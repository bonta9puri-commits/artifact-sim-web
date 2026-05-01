"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { characterBuilds } from '@/lib/character_data';
import { simulateUntilTotalScoreForCustomBuild, simulateScoreAfterFixedAttemptsForCustomBuild, calculateDamageIndex, parts, Part } from '@/lib/simulator';
import { toPng } from 'html-to-image';
import { BarChart, Bar, XAxis, Tooltip, ReferenceLine, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, YAxis } from 'recharts';

function generatePseudoAIAdvice(charName: string, percentile: number, totalScore: number, inputType: string, weakestPart: string | null, weakestDiff: number) {
  const isHigh = percentile >= 90;
  const isLow = percentile <= 30;

  const charPrefix = `【AI風 分析レポート】${charName}のデータを確認しました。\n`;
  let mainAdvice = "";
  if (isHigh) {
    if (percentile >= 99) mainAdvice = `もはや「神」の領域に達しています。このステータスなら螺旋12層単騎も夢ではないかも…？これ以上の厳選は精神を削るので即座に卒業を推奨します！`;
    else mainAdvice = `非常に素晴らしい仕上がりですね！実戦投入レベルとしては文句なしの100点満点です。これ以上の更新は地獄の始まりですよ。`;
  } else if (isLow) {
    mainAdvice = `まだまだ伸びしろがたっぷりありますね！焦らず、まずは正しいメインステータスを揃えるところから始めましょう。毎日の日課が大事です。`;
  } else {
    mainAdvice = `平均的で良いバランスです。ここからが原神の本当の「厳選の沼」の入り口ですね。さらなる火力を求めるなら、もう一段階上のスコアを目指してみましょう。`;
  }

  let partAdvice = "";
  if (inputType === "parts" && weakestPart) {
    if (weakestDiff >= 10) partAdvice = `\nただ…ちょっと言いにくいのですが、「${weakestPart}」が明らかに足を引っ張っています。他の部位が優秀なだけに勿体ない！まずは廻聖などを駆使して${weakestPart}の一点狙い更新を全力で狙いましょう。`;
    else if (weakestDiff >= 5) partAdvice = `\n今後の伸びしろとしては「${weakestPart}」の更新が一番コスパが良さそうです。優先的に狙ってみてください。`;
    else if (isHigh) partAdvice = `\n全ての部位がバランス良く育っており、弱点らしい弱点が見当たりません。完璧なビルドです！`;
    else partAdvice = `\n全体的にバランスは取れているので、あとは根気よく全体的なサブステータスの底上げを狙っていくフェーズですね。`;
  } else if (inputType === "total") {
     partAdvice = `\n※部位ごとのスコアを入力すると、AI風システムが最も足を引っ張っている「弱点部位」を特定してより詳細なアドバイスを行います！`;
  }

  return charPrefix + mainAdvice + partAdvice;
}

export default function Home() {
  const [simMode, setSimMode] = useState<"target" | "period" | "rank">("target");
  const [characterName, setCharacterName] = useState("アルレッキーノ");
  
  // Target mode states
  const [targetScore, setTargetScore] = useState(180);
  
  // Period mode states
  const [days, setDays] = useState(30);
  const [resinPerDay, setResinPerDay] = useState(180);
  const [periodSliderScore, setPeriodSliderScore] = useState(180);

  // Advanced options
  const [useStrongbox, setUseStrongbox] = useState(true);
  const [elixirMode, setElixirMode] = useState<"off" | "periodic" | "bulk1" | "bulk2" | "bulk3" | "bulk4" | "bulk5">("periodic");

  // Rank mode states
  const [inputType, setInputType] = useState<"total" | "parts">("total");
  const [userTotalScore, setUserTotalScore] = useState(150);
  const [partScores, setPartScores] = useState<Record<Part, number>>({
    "花": 30, "羽": 30, "時計": 30, "杯": 30, "冠": 30
  });
  const [selectedElement, setSelectedElement] = useState<string>("all");

  const [isSimulating, setIsSimulating] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('artifactSimHistory');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const saveHistory = (char: string, score: number) => {
    // 同じキャラで直近のスコアと全く同じなら保存しない（連打対策）
    const charHist = history.filter(h => h.character === char);
    if (charHist.length > 0 && charHist[charHist.length - 1].score === score) {
        return;
    }
    
    const newRecord = {
      date: new Date().toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      score: score,
      character: char,
      timestamp: Date.now()
    };
    
    const updatedHistory = [...history, newRecord];
    setHistory(updatedHistory);
    localStorage.setItem('artifactSimHistory', JSON.stringify(updatedHistory));
  };

  const charData = characterBuilds[characterName];
  const buildName = Object.keys(charData.builds)[0];
  const buildData = charData.builds[buildName];

  const [selectedMainStats, setSelectedMainStats] = useState({
    "時計": buildData.mainstat_options["時計"][0],
    "杯": buildData.mainstat_options["杯"][0],
    "冠": buildData.mainstat_options["冠"][0]
  });

  useEffect(() => {
    const newCharData = characterBuilds[characterName];
    const newBuildData = newCharData.builds[Object.keys(newCharData.builds)[0]];
    setSelectedMainStats({
      "時計": newBuildData.mainstat_options["時計"][0],
      "杯": newBuildData.mainstat_options["杯"][0],
      "冠": newBuildData.mainstat_options["冠"][0]
    });
  }, [characterName]);

  const handleSimulate = async (overrideDays?: number) => {
    setIsSimulating(true);
    setResult(null);
    
    await new Promise(resolve => setTimeout(resolve, 800));

    const mainstats: Record<Part, string> = {
      "花": buildData.fixed_mainstats["花"],
      "羽": buildData.fixed_mainstats["羽"],
      "時計": selectedMainStats["時計"],
      "杯": selectedMainStats["杯"],
      "冠": selectedMainStats["冠"],
    };

    const scoreWeights = buildData.score_weight_options[buildData.default_score_mode];
    const elixirInterval = elixirMode === "periodic" ? 250 : 0;
    const elixirBulkCount = elixirMode.startsWith("bulk") ? parseInt(elixirMode.replace("bulk", "")) : 0;
    const elixirFixedSubstats = buildData.elixir_fixed_substats;

    if (simMode === "target") {
      let maxYears = 1;
      let trials = 5000;
      
      if (targetScore > 240) { maxYears = 5; trials = 200; }
      else if (targetScore > 220) { maxYears = 4; trials = 500; }
      else if (targetScore > 200) { maxYears = 3; trials = 1000; }
      else if (targetScore > 180) { maxYears = 2; trials = 2000; }
      else { maxYears = 1; trials = 5000; }
      
      const maxDaysLimit = maxYears * 365;
      const maxAttemptsLimit = Math.floor((maxDaysLimit * resinPerDay) / 20);

      const attemptResults: number[] = [];
      let giveUpCount = 0;

      for (let i = 0; i < trials; i++) {
        const simResult = simulateUntilTotalScoreForCustomBuild(mainstats, scoreWeights, targetScore, maxAttemptsLimit, useStrongbox, elixirInterval, elixirBulkCount, elixirFixedSubstats);
        attemptResults.push(simResult.attempts);
        if (simResult.attempts >= maxAttemptsLimit) {
          giveUpCount++;
        }
      }
      attemptResults.sort((a,b) => a - b);
      
      const top10Attempts = attemptResults[Math.floor(attemptResults.length * 0.1)]; 
      const medianAttempts = attemptResults[Math.floor(attemptResults.length / 2)];
      const bottom10Attempts = attemptResults[Math.floor(attemptResults.length * 0.9)]; 

      const dailyAttempts = resinPerDay / 20;
      const dayResults = attemptResults.map(a => Math.ceil(a / dailyAttempts));
      const minDays = dayResults[0];
      const p95 = dayResults[Math.floor(dayResults.length * 0.95)];
      
      let binSize = 10;
      if (p95 - minDays > 1000) binSize = 100;
      else if (p95 - minDays > 500) binSize = 50;
      else if (p95 - minDays > 200) binSize = 20;
      else binSize = 10;

      const roundedMin = Math.floor(minDays / binSize) * binSize;
      const graphMax = Math.ceil(p95 / binSize) * binSize;
      const bins: any[] = [];

      for (let i = roundedMin; i < graphMax; i += binSize) {
        bins.push({ name: `${i}~`, rangeMin: i, rangeMax: i + binSize, count: 0 });
      }
      bins.push({ name: `${graphMax}以上`, rangeMin: graphMax, rangeMax: Infinity, count: 0 });

      for (const d of dayResults) {
        if (d >= graphMax) {
          bins[bins.length - 1].count++;
        } else {
          const binIndex = Math.floor((d - roundedMin) / binSize);
          if (bins[binIndex]) bins[binIndex].count++;
        }
      }

      const medianDay = Math.ceil(medianAttempts / dailyAttempts);
      const medianBinName = medianDay >= graphMax ? `${graphMax}以上` : `${Math.floor((medianDay - roundedMin) / binSize) * binSize + roundedMin}~`;

      setResult({ 
        type: "target", 
        top10Attempts,
        medianAttempts,
        bottom10Attempts,
        histogramData: bins,
        medianBinName,
        maxYears,
        giveUpCount,
        trials
      });
    } else if (simMode === "period") {
      const activeDays = overrideDays !== undefined ? overrideDays : days;
      const totalAttempts = Math.floor((activeDays * resinPerDay) / 20);
      const trials = 10000;
      const scores: any[] = [];

      for (let i = 0; i < trials; i++) {
        const res = simulateScoreAfterFixedAttemptsForCustomBuild(mainstats, scoreWeights, totalAttempts, useStrongbox, elixirInterval, elixirBulkCount, elixirFixedSubstats);
        if (res.bestTotal !== null) {
            scores.push({ score: res.bestTotal, selected: res.selected });
        }
      }

      scores.sort((a,b) => a.score - b.score);
      const medianRun = scores.length > 0 ? scores[Math.floor(scores.length / 2)] : null;
      const top10Run = scores.length > 0 ? scores[Math.floor(scores.length * 0.9)] : null;
      const bottom10Run = scores.length > 0 ? scores[Math.floor(scores.length * 0.1)] : null;

      const medianDmg = medianRun ? calculateDamageIndex(medianRun.selected, buildData.default_score_mode) : 1;
      const top10Dmg = top10Run ? calculateDamageIndex(top10Run.selected, buildData.default_score_mode) : 1;
      const bottom10Dmg = bottom10Run ? calculateDamageIndex(bottom10Run.selected, buildData.default_score_mode) : 1;

      setResult({ 
        type: "period", 
        totalAttempts, 
        trials, 
        median: medianRun?.score || 0, 
        top10: top10Run?.score || 0, 
        bottom10: bottom10Run?.score || 0, 
        sampleRun: medianRun, 
        rawScores: scores.map(s => s.score),
        dmgRatios: {
          median: 100,
          top10: (top10Dmg / medianDmg) * 100,
          bottom10: (bottom10Dmg / medianDmg) * 100
        }
      });
    } else if (simMode === "rank") {
      const actualTotalScore = inputType === "total" ? userTotalScore : Object.values(partScores).reduce((a, b) => a + b, 0);
      
      const standardAttempts = Math.floor((days * resinPerDay) / 20); 
      const trials = 10000;
      const scores: number[] = [];

      for (let i = 0; i < trials; i++) {
        const res = simulateScoreAfterFixedAttemptsForCustomBuild(mainstats, scoreWeights, standardAttempts, useStrongbox, elixirInterval, elixirBulkCount, elixirFixedSubstats);
        if (res.bestTotal !== null) scores.push(res.bestTotal);
      }
      scores.sort((a,b) => a - b);

      let countBelow = 0;
      for (const s of scores) {
        if (s <= actualTotalScore) countBelow++;
      }
      const percentile = (countBelow / trials) * 100;

      let stars = 1;
      let label = "初心者";
      let advice = "";

      if (percentile >= 99) { stars = 5; label = "神域"; advice = "これ以上の厳選は数年単位の樹脂を要求されます。即座に終了して他キャラを育成しましょう。"; }
      else if (percentile >= 90) { stars = 4; label = "達人"; advice = "十分に完成しています。これ以上の更新は非常に困難です。"; }
      else if (percentile >= 75) { stars = 3; label = "熟練者"; advice = "実戦投入には十分な強さです。推しキャラならさらに上を目指しても良いでしょう。"; }
      else if (percentile >= 50) { stars = 2; label = "一般"; advice = "あと1部位でも神聖遺物が引ければ大きく化けます。もう一息！"; }
      else { stars = 1; label = "伸びしろ大"; advice = "まだまだスコアが伸びやすい段階です。メインステ一致を目標に周回を続けましょう。"; }

      let weakestPart = null;
      let weakestDiff = 0;

      if (inputType === "parts") {
        const benchmarks: Record<Part, number> = { "花": 40, "羽": 40, "時計": 35, "杯": 35, "冠": 30 };
        const partEvals = parts.map(p => {
          const s = partScores[p];
          const ideal = benchmarks[p];
          const target = ideal * 0.85;
          const compromise = ideal * 0.70;

          let rank = 1;
          let text = "🔴 弱点";
          if (s >= ideal) { rank = 4; text = "✨ 理想"; }
          else if (s >= target) { rank = 3; text = "🟢 目標"; }
          else if (s >= compromise) { rank = 2; text = "🟡 妥協"; }

          return { part: p, score: s, text, rank, diff: ideal - s };
        });

        partEvals.sort((a, b) => {
          if (a.rank !== b.rank) return a.rank - b.rank;
          return b.diff - a.diff;
        });

        if (partEvals[0].rank <= 2) {
          weakestPart = partEvals[0].part;
          weakestDiff = partEvals[0].diff;
        }
      }

      advice = generatePseudoAIAdvice(characterName, percentile, actualTotalScore, inputType, weakestPart, weakestDiff);

      const minScore = Math.floor(Math.min(...scores) / 10) * 10;
      const maxScore = Math.ceil(Math.max(...scores) / 10) * 10;
      const binSize = 10;
      const bins: any[] = [];
      for (let i = minScore; i <= maxScore; i += binSize) {
        bins.push({ name: `${i}~`, rangeMin: i, rangeMax: i + binSize, count: 0 });
      }
      for (const s of scores) {
        const binIndex = Math.floor((s - minScore) / binSize);
        if (bins[binIndex]) bins[binIndex].count++;
      }

      setResult({
        type: "rank",
        actualTotalScore,
        percentile,
        stars,
        label,
        advice,
        weakestPart,
        weakestDiff,
        histogramData: bins
      });

      saveHistory(characterName, actualTotalScore);
    }

    setIsSimulating(false);
  };

  const downloadImage = useCallback(() => {
    if (cardRef.current === null) return;
    toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `${characterName}_診断結果.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('画像生成に失敗しました', err);
      });
  }, [cardRef, characterName]);

  const handleRealAI = async () => {
    if (!result || result.type !== "rank") return;
    setIsAIGenerating(true);
    try {
      const res = await fetch('/api/generate-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          charName: characterName,
          totalScore: result.actualTotalScore,
          percentile: result.percentile,
          partScores: partScores,
          weakestPart: result.weakestPart,
          weakestDiff: result.weakestDiff,
          isParts: inputType === "parts"
        })
      });
      const data = await res.json();
      if (data.error) {
        alert("エラー: " + data.error);
      } else {
        setResult((prev: any) => ({ ...prev, advice: data.advice }));
      }
    } catch (e) {
      alert("通信エラーが発生しました");
    }
    setIsAIGenerating(false);
  };

  return (
    <main className="min-h-screen p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-6xl space-y-6">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between py-4 border-b border-white/10 mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Artifact Simulator V2
            </h1>
            <p className="text-slate-400 mt-1 text-sm font-medium">Genshin Impact 聖遺物厳選シミュレーター</p>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 flex items-center justify-center w-10 h-10 shadow-lg"
            aria-label="メニューを開く"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel p-6 shadow-xl">
              <h2 className="text-xl font-semibold mb-5 text-white flex items-center gap-2">
                <span className="text-blue-400 text-xl">⚙️</span> モード設定
              </h2>
              
              <div className="space-y-5">
                <div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => setSimMode("target")} className={`py-2 rounded-lg text-sm font-semibold transition-all ${simMode === "target" ? "bg-blue-600 text-white shadow-lg" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>🎯 かんたん診断</button>
                    <button onClick={() => setSimMode("period")} className={`py-2 rounded-lg text-sm font-semibold transition-all ${simMode === "period" ? "bg-blue-600 text-white shadow-lg" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>⏳ 期間シミュ</button>
                    <button onClick={() => setSimMode("rank")} className={`py-2 rounded-lg text-sm font-semibold transition-all ${simMode === "rank" ? "bg-blue-600 text-white shadow-lg" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>🏆 聖遺物ランク診断</button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">元素フィルター</label>
                  <div className="flex flex-wrap gap-2">
                    {["all", "炎", "水", "風", "雷", "草", "氷", "岩"].map(elem => (
                      <button
                        key={elem}
                        onClick={() => {
                           setSelectedElement(elem);
                           const firstChar = Object.keys(characterBuilds).find(name => elem === "all" || characterBuilds[name].element === elem);
                           if (firstChar) setCharacterName(firstChar);
                        }}
                        className={`px-3 py-1 text-xs font-bold rounded-full border transition-all ${selectedElement === elem ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'}`}
                      >
                        {elem === "all" ? "すべて" : elem}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">キャラクター</label>
                  <select 
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium"
                  >
                    {Object.keys(characterBuilds)
                      .filter(name => selectedElement === "all" || characterBuilds[name].element === selectedElement)
                      .map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                  <label className="block text-sm font-medium text-slate-300 mb-3">メインステータス設定</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["時計", "杯", "冠"] as const).map(part => (
                      <div key={part}>
                        <label className="block text-xs text-slate-400 mb-1">{part}</label>
                        <select 
                          value={selectedMainStats[part]}
                          onChange={(e) => setSelectedMainStats({...selectedMainStats, [part]: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                        >
                          {buildData.mainstat_options[part].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {simMode === "target" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">目標スコア</label>
                      <input type="number" value={targetScore} onChange={(e) => setTargetScore(Number(e.target.value))} className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">1日の樹脂</label>
                      <input type="number" value={resinPerDay} onChange={(e) => setResinPerDay(Number(e.target.value))} className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"/>
                    </div>
                  </div>
                )}
                
                {simMode === "period" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">厳選日数</label>
                      <input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">1日の樹脂</label>
                      <input type="number" value={resinPerDay} onChange={(e) => setResinPerDay(Number(e.target.value))} className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"/>
                    </div>
                  </div>
                )}

                {simMode === "rank" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">比較基準とする厳選日数</label>
                        <input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"/>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">1日の樹脂</label>
                        <input type="number" value={resinPerDay} onChange={(e) => setResinPerDay(Number(e.target.value))} className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"/>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">入力方式</label>
                      <select value={inputType} onChange={(e) => setInputType(e.target.value as any)} className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium">
                        <option value="total">合計スコアのみ入力</option>
                        <option value="parts">部位ごとに入力（弱点診断あり）</option>
                      </select>
                    </div>

                    {inputType === "total" ? (
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">現在の合計スコア</label>
                        <input type="number" value={userTotalScore} onChange={(e) => setUserTotalScore(Number(e.target.value))} className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"/>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {parts.map(p => (
                          <div key={p}>
                            <label className="block text-xs text-slate-400 mb-1">{p}</label>
                            <input type="number" value={partScores[p]} onChange={(e) => setPartScores({...partScores, [p]: Number(e.target.value)})} className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 space-y-3">
                  <label className="block text-sm font-medium text-slate-300 mb-2">追加オプション</label>
                  <label className="flex items-center gap-2 cursor-pointer mb-4">
                    <input type="checkbox" checked={useStrongbox} onChange={(e) => setUseStrongbox(e.target.checked)} className="w-4 h-4 rounded bg-slate-800 border-slate-600 accent-blue-500" />
                    <span className="text-sm text-slate-300">廻聖を利用する (不要な聖遺物3個で1個生成)</span>
                  </label>
                  
                  <div className="space-y-2">
                    <label className="block text-sm text-slate-300">祝聖のエリクシル</label>
                    <select 
                      value={elixirMode}
                      onChange={(e) => setElixirMode(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                    >
                      <option value="off">利用しない</option>
                      <option value="periodic">定期的にもらう (約40日ごとに1個)</option>
                      <option value="bulk1">最初にまとめて使う (1個)</option>
                      <option value="bulk2">最初にまとめて使う (2個)</option>
                      <option value="bulk3">最初にまとめて使う (3個)</option>
                      <option value="bulk4">最初にまとめて使う (4個)</option>
                      <option value="bulk5">最初にまとめて使う (5個: 全部位)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-700/50">
                  <button onClick={() => handleSimulate()} disabled={isSimulating} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-blue-500/25 transition-all transform active:scale-[0.98]">
                    {isSimulating ? "計算中..." : (simMode === "rank" ? "ランクを診断する" : "シミュレーション開始")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="glass-panel p-6 h-full min-h-[500px]">
              {!result && !isSimulating && (
                <div className="flex flex-col items-center justify-center h-full border-dashed border-2 border-slate-700/50 bg-slate-900/20 relative overflow-hidden group rounded-xl min-h-[450px]">
                  <div className="text-center space-y-5 relative z-10">
                    <div className="text-7xl mb-6 opacity-80 filter drop-shadow-lg">📊</div>
                    <h3 className="text-2xl font-semibold text-slate-200">
                      左側のパネルから条件を設定して<br/>シミュレーションを開始してください
                    </h3>
                  </div>
                </div>
              )}
              
              {isSimulating && (
                <div className="flex flex-col items-center justify-center h-full min-h-[450px]">
                   <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                   <p className="text-slate-300 font-medium">計算中...</p>
                </div>
              )}

              {result && !isSimulating && result.type === "target" && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="text-center mb-6">
                    <h3 className="text-xl text-slate-300">目標スコア <span className="text-white font-bold text-2xl">{targetScore}</span> 到達までにかかる日数</h3>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6 text-center">
                      <h3 className="text-sm text-purple-300 mb-2">上位10% (豪運)</h3>
                      <div className="text-3xl font-bold text-purple-400">
                        {Math.ceil((result.top10Attempts * 20) / resinPerDay).toLocaleString()} <span className="text-base font-normal">日</span>
                      </div>
                    </div>
                    <div className="bg-blue-900/30 border border-blue-500/50 rounded-xl p-6 text-center transform scale-105 shadow-lg shadow-blue-900/20">
                      <h3 className="text-sm text-blue-300 mb-2">中央値 (平均)</h3>
                      <div className="text-4xl font-bold text-blue-400">
                        {Math.ceil((result.medianAttempts * 20) / resinPerDay).toLocaleString()} <span className="text-xl font-normal">日</span>
                      </div>
                    </div>
                    <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 text-center">
                      <h3 className="text-sm text-slate-400 mb-2">下位10% (不運)</h3>
                      <div className="text-3xl font-bold text-slate-300">
                        {result.bottom10Attempts >= Math.floor(((result.maxYears * 365) * resinPerDay) / 20) 
                          ? <span className="text-xl text-red-400">到達不可 ({result.maxYears}年経過)</span> 
                          : <>{Math.ceil((result.bottom10Attempts * 20) / resinPerDay).toLocaleString()} <span className="text-base font-normal">日</span></>
                        }
                      </div>
                    </div>
                  </div>

                  {result.giveUpCount > 0 && (
                    <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl text-center">
                      <h4 className="font-bold text-red-400 mb-1">⚠️ 限界突破</h4>
                      <p className="text-sm text-slate-300">
                        目標が高すぎるため、{result.maxYears}年周回しても到達できずに<span className="font-bold text-white">妥協した人が {result.trials}人中 {result.giveUpCount}人</span> いました（妥協率: {((result.giveUpCount / result.trials) * 100).toFixed(1)}%）
                      </p>
                    </div>
                  )}

                  {result.histogramData && (
                    <div className="mt-6 w-full h-40">
                      <h4 className="text-xs text-slate-400 mb-2 text-left">目標スコア {targetScore} に到達するまでの日数分布 (上位95%を表示)</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={result.histogramData}>
                          <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickMargin={5} />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                          <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                          <ReferenceLine x={result.medianBinName} stroke="#facc15" strokeDasharray="3 3" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  
                  <div className="text-center text-sm text-slate-500 mt-4">
                    ※ 1日 {resinPerDay} 樹脂で計算。{result.trials}人のシミュレーター結果に基づく分布です。
                  </div>
                </div>
              )}

              {result && !isSimulating && result.type === "period" && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 text-center">
                      <h3 className="text-sm text-slate-400 mb-2">下位10% (不運)</h3>
                      <div className="text-3xl font-bold text-slate-300">{result.bottom10.toFixed(1)}</div>
                      <div className="text-xs text-slate-500 mt-2">想定ダメージ比</div>
                      <div className="text-sm font-semibold text-slate-400">{result.dmgRatios.bottom10.toFixed(1)}%</div>
                    </div>
                    <div className="bg-blue-900/30 border border-blue-500/50 rounded-xl p-6 text-center transform scale-105 shadow-lg shadow-blue-900/20">
                      <h3 className="text-sm text-blue-300 mb-2">中央値 (平均)</h3>
                      <div className="text-4xl font-bold text-blue-400">{result.median.toFixed(1)}</div>
                      <div className="text-xs text-blue-400/70 mt-2">想定ダメージ比</div>
                      <div className="text-sm font-semibold text-blue-300">基準 (100%)</div>
                    </div>
                    <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6 text-center">
                      <h3 className="text-sm text-purple-300 mb-2">上位10% (豪運)</h3>
                      <div className="text-3xl font-bold text-purple-400">{result.top10.toFixed(1)}</div>
                      <div className="text-xs text-purple-400/70 mt-2">想定ダメージ比</div>
                      <div className="text-sm font-semibold text-purple-300">+{ (result.dmgRatios.top10 - 100).toFixed(1) }%</div>
                    </div>
                  </div>

                  {/* スライダー式 到達確率 */}
                  <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 shadow-md">
                    <h3 className="text-lg font-bold text-white mb-4">🎯 到達確率チェッカー</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <input 
                        type="range" 
                        min="130" max="230" step="1"
                        value={periodSliderScore}
                        onChange={(e) => setPeriodSliderScore(Number(e.target.value))}
                        className="w-full cursor-pointer accent-blue-500 h-2 bg-slate-700 rounded-lg appearance-none"
                      />
                      <div className="text-2xl font-bold text-blue-400 w-16 text-right">{periodSliderScore}</div>
                    </div>
                    
                    {(() => {
                      const count = result.rawScores.filter((s: number) => s >= periodSliderScore).length;
                      const probability = (count / result.rawScores.length) * 100;
                      return (
                        <div className="bg-slate-900/50 p-4 rounded-lg flex justify-between items-center border border-slate-700">
                          <span className="text-slate-300">スコア <span className="text-white font-bold text-lg">{periodSliderScore}</span> 以上に到達できる確率:</span>
                          <span className="text-3xl font-bold text-yellow-400">{probability.toFixed(1)} <span className="text-xl">%</span></span>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="pt-2 flex justify-center">
                    <button 
                      onClick={() => {
                        const newDays = days + 90;
                        setDays(newDays);
                        handleSimulate(newDays);
                      }}
                      className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2 border border-slate-500 transform active:scale-95"
                    >
                      ⏳ 諦めずに追加で 90日間 (約3ヶ月) 厳選する
                    </button>
                  </div>
                </div>
              )}

              {result && !isSimulating && result.type === "rank" && (
                <div className="space-y-6 animate-in fade-in duration-500 flex flex-col items-center">
                  
                  {/* 保存用・シェア用のカード領域 (CSSで幅を固定し、綺麗にレイアウトする) */}
                  <div 
                    ref={cardRef} 
                    className="bg-slate-900 border border-slate-700 rounded-2xl p-8 text-center flex flex-col items-center justify-center relative overflow-hidden"
                    style={{ width: "100%", maxWidth: "540px" }}
                  >
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    <h2 className="text-lg font-bold text-slate-400 mb-6 flex items-center gap-2">
                      <span>Artifact Simulator V2</span>
                    </h2>
                    
                    <div className="bg-slate-800/50 rounded-xl p-4 w-full mb-6 border border-slate-700/50">
                      <div className="text-sm text-blue-300 font-semibold mb-1">{characterName}</div>
                      <div className="text-xs text-slate-400">聖遺物ランク診断</div>
                    </div>

                    <div className="text-slate-400 mb-1 text-sm">あなたのスコア</div>
                    <div className="text-4xl font-black text-white mb-3">
                      {result.actualTotalScore.toFixed(1)}
                    </div>

                    <div className="text-5xl mb-3 text-yellow-400 drop-shadow-md">
                      {"★".repeat(result.stars)}{"☆".repeat(5 - result.stars)}
                    </div>
                    
                    <div className="text-2xl font-bold text-blue-400 mb-8">
                      上位 <span className="text-4xl">{((100 - result.percentile)).toFixed(1)}</span> <span className="text-xl">%</span>
                    </div>
                    
                    <div className="bg-blue-900/30 border border-blue-500/50 p-4 rounded-xl w-full mb-4 text-left">
                      <h4 className="font-bold text-blue-300 mb-2 border-b border-blue-500/30 pb-2">評価: {result.label}</h4>
                      <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{result.advice}</p>
                      
                      <button 
                        onClick={handleRealAI}
                        disabled={isAIGenerating}
                        className="mt-4 w-full bg-slate-800 hover:bg-slate-700 text-xs text-blue-300 py-2 rounded border border-slate-600 transition-all flex justify-center items-center gap-2"
                      >
                        {isAIGenerating ? "🤖 AI先輩がタイピング中..." : "🤖 AI先輩のガチ診断を受ける（※回数制限あり）"}
                      </button>
                    </div>

                    {result.weakestPart && (
                      <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl w-full text-left">
                        <h4 className="font-bold text-red-400 mb-2 border-b border-red-500/30 pb-2">🎯 次の更新目標</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">
                          最も伸びしろがある【<span className="font-bold text-white">{result.weakestPart}</span>】の更新がおすすめ！（理想まであと <span className="text-red-400 font-bold">{result.weakestDiff.toFixed(1)}</span>）
                        </p>
                      </div>
                    )}

                    {result.histogramData && (
                      <div className="mt-6 w-full h-40">
                        <h4 className="text-xs text-slate-400 mb-2 text-left">同条件で{days}日間厳選した際のスコア分布</h4>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={result.histogramData}>
                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickMargin={5} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                              {result.histogramData.map((entry: any, index: number) => {
                                 const isUserScore = result.actualTotalScore >= entry.rangeMin && result.actualTotalScore < entry.rangeMax;
                                 return <Cell key={`cell-${index}`} fill={isUserScore ? '#facc15' : '#3b82f6'} />;
                              })}
                            </Bar>
                            <ReferenceLine x={`${Math.floor(result.actualTotalScore / 10) * 10}~`} stroke="#facc15" strokeDasharray="3 3" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {(() => {
                    const charHistory = history.filter(h => h.character === characterName);
                    if (charHistory.length > 1) {
                      return (
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 w-full max-w-lg mt-4">
                          <h4 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                            📈 {characterName} のスコア成長記録
                          </h4>
                          <div className="w-full h-40">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={charHistory}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickMargin={5} />
                                <YAxis stroke="#64748b" fontSize={10} domain={['dataMin - 10', 'dataMax + 10']} width={30} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }} />
                                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div className="pt-4">
                    <button 
                      onClick={downloadImage}
                      className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 transform active:scale-95"
                    >
                      📷 画像として保存・シェアする
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
          
        </div>
      </div>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Drawer Content */}
      <div 
        className={`fixed inset-y-0 right-0 w-80 max-w-[80vw] bg-slate-900 border-l border-slate-700 shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>ℹ️</span> メニュー・情報
          </h2>
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="text-slate-400 hover:text-white p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          <section>
            <h3 className="text-sm font-bold text-blue-400 mb-3 border-b border-blue-500/30 pb-1">使い方・スコア計算について</h3>
            <ul className="text-sm text-slate-300 space-y-2 list-disc pl-4">
              <li>スコアは基本的に <strong>会心率×2 ＋ 会心ダメージ ＋ 攻撃力%</strong> (HP依存キャラはHP%、防御依存キャラは防御%など) で計算しています。</li>
              <li>「かんたん診断」は目標スコアに到達するまでの目安期間を算出します。</li>
              <li>「期間シミュ」は指定期間内でどこまでスコアが伸びるかを予測します。</li>
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-bold text-purple-400 mb-3 border-b border-purple-500/30 pb-1">アップデート履歴</h3>
            <ul className="text-sm text-slate-300 space-y-2">
              <li className="flex gap-2"><span className="text-slate-500 shrink-0">v2.1</span> <span>AI先輩の辛口診断機能を実装しました。</span></li>
              <li className="flex gap-2"><span className="text-slate-500 shrink-0">v2.0</span> <span>Next.js版へ完全移行。計算速度が大幅に向上しました。</span></li>
              <li className="flex gap-2"><span className="text-slate-500 shrink-0">v1.1</span> <span>廻聖・エリクシルの一括使用機能を追加しました。</span></li>
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-bold text-yellow-400 mb-3 border-b border-yellow-500/30 pb-1">免責事項</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              当サイトは非公式のファンサイトであり、株式会社miHoYoおよびHoYoverseとは一切関係ありません。
              ドロップ率やステータス伸びの確率は、コミュニティによる有志の検証データに基づいた推測値を使用しています。実際のゲーム内の確率とは異なる場合があります。
            </p>
          </section>

          <section>
            <h3 className="text-sm font-bold text-green-400 mb-3 border-b border-green-500/30 pb-1">開発者情報</h3>
            <div className="space-y-3">
              <a href="https://www.youtube.com/channel/UCl9ZmeECCvInf8XiNSWduuA" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white transition-colors bg-red-600/90 hover:bg-red-500 p-3 rounded-lg border border-red-500/50 shadow-lg shadow-red-900/20">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                開発者のYouTubeチャンネル
              </a>
              <a href="https://twitter.com/intent/tweet?text=最強の原神聖遺物シミュレーターで絶望しよう！&url=https://artifact-sim.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors bg-slate-800 p-3 rounded-lg border border-slate-700 hover:border-slate-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                X (旧Twitter) でシェア
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
