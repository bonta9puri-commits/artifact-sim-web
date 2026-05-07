"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { GAME_CONFIGS, GameId, GameConfig } from '@/lib/game_data';
import { simulateUntilScore, simulateFixedAttempts, compareRecycleEfficiency, MAIN_PROBS } from '@/lib/simulator';
import { toPng } from 'html-to-image';
import { BarChart, Bar, XAxis, Tooltip, ReferenceLine, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, YAxis } from 'recharts';
import { Zap, Shield, Sword, LayoutGrid, BookOpen, Target, Calendar, MessageSquare, ChevronLeft, X } from 'lucide-react';

export default function Home() {
  const [gameId, setGameId] = useState<GameId>("genshin");
  const config = GAME_CONFIGS[gameId];
  
  const [simMode, setSimMode] = useState<"target" | "period" | "rank" | "comparison">("target");
  const [buildA, setBuildA] = useState<Record<string, number>>({});
  const [buildB, setBuildB] = useState<Record<string, number>>({});
  const [selectedWeapon, setSelectedWeapon] = useState<string>("none");
  const [selectedEnemy, setSelectedEnemy] = useState<string>("standard");

  // 武器・敵のデータ定義
  const WEAPONS: any = {
    genshin: [
      { id: "none", name: "武器なし", stats: {} },
      { id: "sign", name: "モチーフ(会心ダメ)", stats: { "会心ダメージ": 66.2, "攻撃力%": 20 } },
      { id: "crit", name: "汎用星5(会心率)", stats: { "会心率": 33.1 } },
      { id: "f2p", name: "星4配布(攻撃%)", stats: { "攻撃力%": 55.1 } }
    ],
    starrail: [
      { id: "none", name: "光円錐なし", stats: {} },
      { id: "sign", name: "モチーフ(会心ダメ)", stats: { "会心ダメージ": 36, "会心率": 18 } },
      { id: "hertha", name: "星5ヘルタ(攻撃%)", stats: { "攻撃力%": 64 } },
      { id: "f2p", name: "汎用星4", stats: { "攻撃力%": 32 } }
    ],
    zzz: [
      { id: "none", name: "音動機なし", stats: {} },
      { id: "sign", name: "モチーフ", stats: { "会心率": 24, "攻撃力%": 20 } },
      { id: "rank_s", name: "汎用S級", stats: { "会心率": 19.2 } }
    ]
  };

  const ENEMIES: any = {
    genshin: [
      { id: "standard", name: "一般(Lv.90 / 10%耐性)", def: 0.5, res: 0.9 },
      { id: "boss", name: "精鋭(Lv.90 / 70%耐性)", def: 0.5, res: 0.3 }
    ],
    starrail: [
      { id: "standard", name: "一般(Lv.80 / 弱点あり)", def: 0.5, res: 1.0 },
      { id: "boss", name: "精鋭(Lv.80 / 弱点なし)", def: 0.5, res: 0.8 }
    ],
    zzz: [
      { id: "standard", name: "一般(Lv.60)", def: 0.5, res: 1.0 }
    ]
  };

  // 比較モード用スコア入力UIの更新
  useEffect(() => {
    if (simMode === "comparison") {
      const initial: any = {};
      config.slots.forEach(s => { if(s !== "未選択") initial[s] = 30; });
      if (Object.keys(buildA).length === 0) setBuildA(initial);
      if (Object.keys(buildB).length === 0) setBuildB(initial);
    }
  }, [simMode, config]);
  const [characterName, setCharacterName] = useState(config.characters[1] || "未選択");
  
  // Settings
  const [targetScore, setTargetScore] = useState(180);
  const [days, setDays] = useState(30);
  const [breakdownView, setBreakdownView] = useState<"median" | "top10" | "bottom10">("median");
  const [staminaPerDay, setStaminaPerDay] = useState(gameId === "genshin" ? 180 : 240);
  
  const [useStrongbox, setUseStrongbox] = useState(false);
  const [mainStats, setMainStats] = useState<Record<string, string>>({});
  const [userPartScores, setUserPartScores] = useState<Record<string, number>>({});
  const [scoreWeights, setScoreWeights] = useState<Record<string, number>>({
    "会心率": 2.0, "会心ダメージ": 1.0, "攻撃%": 1.0
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [compareResult, setCompareResult] = useState<any>(null);
  const [recycleComparison, setRecycleComparison] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  
  // Base Stats for Damage Index
  const [baseRate, setBaseRate] = useState(5.0);
  const [baseDmg, setBaseDmg] = useState(50.0);
  const [baseAtk, setBaseAtk] = useState(100.0); // 100% means base ATK
  const [baseEm, setBaseEm] = useState(0.0);
  const [baseHp, setBaseHp] = useState(100.0);
  const [baseDef, setBaseDef] = useState(100.0);
  const [baseEr, setBaseEr] = useState(100.0);
  const [scalingMode, setScalingMode] = useState<"atk" | "hp" | "def" | "er">("atk");
  const [useReaction, setUseReaction] = useState(true);
  const [targetSets, setTargetSets] = useState<string[]>(["", "", "", ""]);

  const cardRef = useRef<HTMLDivElement>(null);

  // 設定のロード
  useEffect(() => {
    const savedSettings = localStorage.getItem(`sim_settings_${gameId}`);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.targetScore) setTargetScore(parsed.targetScore);
        if (parsed.scoreWeights) setScoreWeights(parsed.scoreWeights);
        if (parsed.mainStats) setMainStats(parsed.mainStats);
        if (parsed.userPartScores) setUserPartScores(parsed.userPartScores);
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    } else {
      // 初期値設定 (保存データがない場合のみ)
      const initialMain: Record<string, string> = {};
      config.slots.forEach(s => {
        if (s === "未選択") return;
        if (gameId === "genshin") {
          if (s === "生の花") initialMain[s] = "HP(固定値)";
          else if (s === "死の羽") initialMain[s] = "攻撃力(固定値)";
          else initialMain[s] = "攻撃力%";
        } else if (gameId === "starrail") {
          if (s === "頭部") initialMain[s] = "HP(固定値)";
          else if (s === "手部") initialMain[s] = "攻撃力(固定値)";
          else initialMain[s] = "攻撃力%";
        } else if (gameId === "zzz") {
          if (s === "スロット1") initialMain[s] = "HP(固定値)";
          else if (s === "スロット2") initialMain[s] = "攻撃力(固定値)";
          else if (s === "スロット3") initialMain[s] = "防御力(固定値)";
          else initialMain[s] = "攻撃力%";
        } else {
          initialMain[s] = "攻撃力%";
        }
      });
      setMainStats(initialMain);
      
      // ターゲットスコアの初期化
      if (gameId === "genshin") {
        setTargetScore(180);
      } else {
        setTargetScore(420); // スタレ・ゼンゼロは1部位平均70点 × 6部位 = 420点を目標にする
      }
      
      const initialWeights: Record<string, number> = {};
      config.subStats.forEach(s => {
        if (s === "会心率") {
          initialWeights[s] = (gameId === "zzz") ? 1.0 : 2.0;
        }
        else if (s === "会心ダメージ" || s === "攻撃力%" || s === "異常マスタリー") initialWeights[s] = 1.0;
        else if (s === "速度" && gameId === "starrail") initialWeights[s] = 1.0;
        else if (s === "速度") initialWeights[s] = 1.0;
        else initialWeights[s] = 0;
      });
      setScoreWeights(initialWeights);

      // デフォルトの部位スコア設定
      const initialPartScores: Record<string, number> = {};
      config.slots.forEach(s => {
        if (s !== "未選択") {
          if (gameId === "genshin") initialPartScores[s] = 35;
          else initialPartScores[s] = 70; // スタレ・ゼンゼロ共通で70点
        }
      });
      setUserPartScores(initialPartScores);
    }
  }, [gameId, config]);

  // 設定の保存
  useEffect(() => {
    const settings = { targetScore, scoreWeights, mainStats, userPartScores };
    localStorage.setItem(`sim_settings_${gameId}`, JSON.stringify(settings));
  }, [gameId, targetScore, scoreWeights, mainStats, userPartScores]);

  // 履歴のロード
  useEffect(() => {
    const saved = localStorage.getItem(`sim_history_${gameId}`);
    if (saved) setHistory(JSON.parse(saved));
    else setHistory([]);
  }, [gameId]);

  const saveHistory = (res: any) => {
    const newRecord = {
      gameId,
      result: res,
      scoreWeights,
      targetScore,
      mainStats,
      character: characterName,
      timestamp: Date.now()
    };
    const updated = [...history, newRecord].slice(-20);
    setHistory(updated);
    localStorage.setItem(`sim_history_${gameId}`, JSON.stringify(updated));
  };

  const handleSimulate = async (overrideDays?: number) => {
    setIsSimulating(true);
    setSimProgress(0);
    setResult(null);
    
    const staminaCost = gameId === "genshin" ? 20 : 40;
    const trials = 500;
    const subPool = config.subStats.filter(s => s !== "未選択");

    if (simMode === "target") {
      const results: {attempts: number, pieces: any}[] = [];
      for (let i = 0; i < trials; i++) {
        if (i % 10 === 0) {
          setSimProgress(Math.floor((i / trials) * 100));
          await new Promise(r => setTimeout(r, 1));
        }
        const res = simulateUntilScore(gameId, targetScore, scoreWeights, subPool, useStrongbox, mainStats, targetSets);
        results.push(res);
      }
      results.sort((a, b) => a.attempts - b.attempts);
      
      const medianRes = results[Math.floor(trials / 2)];
      const top10Res = results[Math.floor(trials * 0.1)];
      const bottom10Res = results[Math.floor(trials * 0.9)];
  
      const comparison = compareRecycleEfficiency(gameId, targetScore, scoreWeights, subPool, mainStats, targetSets);
      setRecycleComparison({
        staminaSaved: comparison.staminaSaved,
        daysSaved: comparison.daysSaved,
        withRecycle: Math.ceil((comparison.withRecycle.stamina) / staminaPerDay),
        withoutRecycle: Math.ceil((comparison.withoutRecycle.stamina) / staminaPerDay)
      });
 
      const finalRes = {
        type: "target",
        median: Math.ceil((medianRes.attempts * staminaCost) / staminaPerDay),
        top10: Math.ceil((top10Res.attempts * staminaCost) / staminaPerDay),
        bottom10: Math.ceil((bottom10Res.attempts * staminaCost) / staminaPerDay),
        pieces: medianRes.pieces,
        trials
      };
      setResult(finalRes);
      saveHistory(finalRes);
    } else {
      const activeDays = (simMode === "period" ? (overrideDays || days) : days);
      const totalAttempts = Math.floor((activeDays * staminaPerDay) / staminaCost);
      const results: {score: number, pieces: any}[] = [];
      for (let i = 0; i < trials; i++) {
        if (i % 10 === 0) {
          setSimProgress(Math.floor((i / trials) * 100));
          await new Promise(r => setTimeout(r, 1));
        }
        const res = simulateFixedAttempts(gameId, totalAttempts, staminaPerDay, scoreWeights, subPool, useStrongbox, mainStats, targetSets);
        results.push(res);
      }
      results.sort((a, b) => a.score - b.score);
      
      if (simMode === "period") {
        const medianRes = results[Math.floor(trials / 2)];
        const top10Res = results[Math.floor(trials * 0.9)];
        const bottom10Res = results[Math.floor(trials * 0.1)];
        const finalRes = {
          type: "period",
          median: medianRes.score,
          top10: top10Res.score,
          bottom10: bottom10Res.score,
          pieces: medianRes.pieces,
          top10Pieces: top10Res.pieces,
          bottom10Pieces: bottom10Res.pieces,
          rawScores: results.map(r => r.score),
          trials
        };
        setResult(finalRes);
        saveHistory(finalRes);
      } else {
        const userTotal = Object.values(userPartScores).reduce((a, b) => a + b, 0);
        const belowCount = results.filter(r => r.score <= userTotal).length;
        const percentile = (belowCount / trials) * 100;
        const finalRes = {
          type: "rank",
          percentile,
          userScore: userTotal,
          median: results[Math.floor(trials / 2)].score,
          pieces: results[Math.floor(trials / 2)].pieces,
          trials
        };
        setResult(finalRes);
        saveHistory(finalRes);
      }
    }

    setSimProgress(100);
    setIsSimulating(false);
  };

  const calcDamageIndex = (res: any, buildOverride?: Record<string, number>) => {
    if (!res && !buildOverride) return 0;
    
    let totalRate = baseRate;
    let totalDmg = baseDmg;
    let totalAtk = baseAtk;
    let totalHp = baseHp;
    let totalDef = baseDef;
    let totalEr = baseEr;
    let totalEm = baseEm;

    // 武器ステータスの加算
    const weapon = WEAPONS[gameId].find((w: any) => w.id === selectedWeapon);
    if (weapon && weapon.stats) {
      Object.entries(weapon.stats).forEach(([s, v]: [string, any]) => {
        if (s === "会心率") totalRate += v;
        if (s === "会心ダメージ") totalDmg += v;
        if (s === "攻撃力%") totalAtk += v;
        if (s === "HP%") totalHp += v;
        if (s === "防御力%") totalDef += v;
        if (s === "元素熟知") totalEm += v;
      });
    }

    const mainValues: any = {
      genshin: { "会心率": 31.1, "会心ダメージ": 62.2, "攻撃力%": 46.6, "HP%": 46.6, "防御力%": 58.3, "元素チャージ効率": 51.8, "元素熟知": 187 },
      starrail: { "会心率": 32.4, "会心ダメージ": 64.8, "攻撃力%": 43.2, "HP%": 43.2, "防御力%": 54.0, "EP回復効率": 19.4, "撃破特効": 64.8 },
      zzz: { "会心率": 24.0, "会心ダメージ": 48.0, "攻撃力%": 30.0, "HP%": 30.0, "防御力%": 40.0, "エネルギー自動回復": 60, "異常マスタリー": 30 }
    };

    if (buildOverride) {
      // 部位スコアから統計的にサブステータスを逆算
      Object.entries(buildOverride).forEach(([slot, score]) => {
        // メインステータス加算 (簡易的に現在設定されているメインを使用)
        const main = mainStats[slot];
        const mVal = mainValues[gameId][main];
        if (mVal) {
          if (main === "会心率") totalRate += mVal;
          if (main === "会心ダメージ") totalDmg += mVal;
          if (main === "攻撃力%") totalAtk += mVal;
          if (main === "HP%") totalHp += mVal;
          if (main === "防御力%") totalDef += mVal;
          if (main === "元素熟知") totalEm += mVal;
        }

        // スコアからサブステ配分 (会心:攻撃 = 2:1 などの比率で配分)
        // 1スコア ≒ 会心ダメ1.0% または 攻撃%1.0% と想定
        totalRate += (score * 0.4) / 2; // スコアの40%を率に (2.0重み)
        totalDmg += (score * 0.4);      // スコアの40%をダメに (1.0重み)
        totalAtk += (score * 0.2);      // 残り20%を攻撃に
      });
    } else {
      Object.values(res.pieces).forEach((art: any) => {
        if (!art) return;
        const mVal = mainValues[gameId][art.main];
        if (mVal) {
          if (art.main === "会心率") totalRate += mVal;
          if (art.main === "会心ダメージ") totalDmg += mVal;
          if (art.main === "攻撃力%") totalAtk += mVal;
          if (art.main === "HP%") totalHp += mVal;
          if (art.main === "防御力%") totalDef += mVal;
          if (art.main === "元素チャージ効率" || art.main === "EP回復効率" || art.main === "エネルギー自動回復") totalEr += mVal;
          if (art.main === "元素熟知" || art.main === "撃破特効" || art.main === "異常マスタリー") totalEm += mVal;
        }
        if (art.substats) {
          Object.entries(art.substats).forEach(([s, v]: [string, any]) => {
            if (s === "会心率") totalRate += v;
            if (s === "会心ダメージ") totalDmg += v;
            if (s === "攻撃力%") totalAtk += v;
            if (s === "HP%") totalHp += v;
            if (s === "防御力%") totalDef += v;
            if (s === "元素熟知" || s === "撃破特効" || s === "異常マスタリー") totalEm += v;
          });
        }
      });
    }

    const critMult = 1 + (Math.min(100, totalRate) / 100) * (totalDmg / 100);
    let statMult = 1;
    if (scalingMode === "atk") statMult = totalAtk / 100;
    else if (scalingMode === "hp") statMult = totalHp / 100;
    else if (scalingMode === "def") statMult = totalDef / 100;
    else if (scalingMode === "er") statMult = (totalAtk * 0.7 + totalEr * 0.4) / 100;
    
    let emMult = 1;
    if (useReaction) {
      if (gameId === "genshin") emMult = 1 + (2.78 * totalEm) / (totalEm + 1400);
      else emMult = 1 + (totalEm / 100);
    }

    // 敵の防御・耐性補正
    const enemy = ENEMIES[gameId].find((e: any) => e.id === selectedEnemy);
    const enemyMult = (enemy?.def || 0.5) * (enemy?.res || 0.9);

    return critMult * statMult * emMult * enemyMult * 1000; // 桁を見やすく
  };

  const downloadImage = useCallback(() => {
    if (cardRef.current === null) return;
    toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `${gameId}_${characterName}_診断.png`;
        link.href = dataUrl;
        link.click();
      });
  }, [cardRef, characterName, gameId]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-6xl space-y-6">
        
        {/* Game Switcher Tab */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-900 p-1 rounded-2xl flex gap-1 border border-slate-800 shadow-2xl">
            {(["genshin", "starrail", "zzz"] as const).map(id => (
              <button
                key={id}
                onClick={() => setGameId(id)}
                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${gameId === id ? `bg-gradient-to-r ${GAME_CONFIGS[id].gradient} text-white shadow-lg` : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
              >
                {GAME_CONFIGS[id].name}
              </button>
            ))}
          </div>
        </div>

        <header className="flex flex-col md:flex-row items-start md:items-center justify-between py-4 border-b border-white/10 mb-8 gap-4">
          <div>
            <h1 className={`text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r ${config.gradient}`}>
              {config.name} {config.equipName}Sim
            </h1>
            <p className="text-slate-400 mt-1 text-sm font-medium">目標到達までの{gameId === "genshin" ? "樹脂" : "スタミナ"}を徹底シミュレート</p>
          </div>
          <button onClick={() => setIsDrawerOpen(true)} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2">⚙️ 設定</h2>
              
              <div className="space-y-5">
                <div className="flex flex-col gap-2">
                  <button onClick={() => setSimMode("target")} className={`py-2 rounded-lg text-sm font-bold transition-all ${simMode === "target" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-500"}`}>🎯 目標スコア診断</button>
                  <button onClick={() => setSimMode("period")} className={`py-2 rounded-lg text-sm font-bold transition-all ${simMode === "period" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-500"}`}>⏳ 期間シミュ</button>
                  <button onClick={() => setSimMode("rank")} className={`py-2 rounded-lg text-sm font-bold transition-all ${simMode === "rank" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-500"}`}>🏆 ランク診断</button>
                  <button onClick={() => setSimMode("comparison")} className={`py-2 rounded-lg text-sm font-bold transition-all ${simMode === "comparison" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-500"}`}>⚖️ ビルド比較</button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">キャラクター</label>
                  <select value={characterName} onChange={e => setCharacterName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none">
                    {config.characters.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                  <label className="block text-sm font-medium text-slate-400 mb-3">狙いのセット (ダンジョン別)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {targetSets.map((setName, idx) => {
                      const isMain = idx < 2;
                      const label = gameId === "starrail" ? (isMain ? "遺物" : "オーナメント") : (isMain ? "メイン" : "サブ");
                      return (
                        <div key={idx} className="space-y-1">
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{label} {isMain ? idx + 1 : idx - 1}</p>
                          <select 
                            value={setName} 
                            onChange={e => {
                              const newSets = [...targetSets];
                              newSets[idx] = e.target.value;
                              setTargetSets(newSets);
                            }}
                            className="w-full bg-slate-800 text-[10px] p-2 rounded-xl border border-slate-700 text-white outline-none"
                          >
                            <option value="">未選択</option>
                            {config.sets.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[9px] text-slate-500 mt-2 italic">※1&2(A)と3&4(B)は別ダンジョンとして計算します</p>
                </div>

                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                  <label className="block text-sm font-medium text-slate-400 mb-3">メインステータス</label>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {config.slots.filter(s => s !== "未選択").map(slot => {
                      const isFixed = 
                        slot.includes("花") || slot.includes("羽") || 
                        slot === "頭部" || slot === "手部" || 
                        slot === "スロット1" || slot === "スロット2" || slot === "スロット3";
                      
                      return (
                        <div key={slot} className="flex items-center justify-between gap-4">
                          <span className="text-xs text-slate-500 whitespace-nowrap">{slot}</span>
                          {isFixed ? (
                            <span className="text-xs text-slate-400 bg-slate-800/30 px-3 py-1.5 rounded border border-slate-700/50 flex-1 text-right">
                              {slot.includes("花") || slot === "頭部" || slot === "スロット1" ? "HP(固定値)" : 
                               slot.includes("羽") || slot === "手部" || slot === "スロット2" ? "攻撃力(固定値)" : "防御力(固定値)"}
                            </span>
                          ) : (
                            <select 
                              value={mainStats[slot] || ""} 
                              onChange={e => setMainStats({...mainStats, [slot]: e.target.value})}
                              className="bg-slate-800 text-xs p-1.5 rounded border border-slate-700 flex-1 outline-none"
                            >
                              {Object.keys(MAIN_PROBS[gameId][slot] || {}).map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                  <label className="block text-sm font-medium text-slate-400 mb-3">サブステータスの重み</label>
                  <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {config.subStats.filter(s => s !== "未選択").map(sub => (
                      <div key={sub} className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-500 whitespace-nowrap">{sub}</label>
                        <input 
                          type="number" 
                          step="0.1"
                          value={scoreWeights[sub] || 0} 
                          onChange={e => {
                            const val = parseFloat(e.target.value);
                            setScoreWeights({...scoreWeights, [sub]: isNaN(val) ? 0 : val});
                          }}
                          className="bg-slate-800 text-xs p-1.5 rounded border border-slate-700 outline-none text-white w-full"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-3 italic">※会心率=2.0, 会心ダメ=1.0, 攻撃%=1.0 が一般的です</p>
                </div>

                {simMode === "target" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">目標合計スコア</label>
                    <input type="number" value={targetScore} onChange={e => setTargetScore(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white"/>
                  </div>
                )}

                {(simMode === "period" || simMode === "rank") && (
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">厳選日数</label>
                    <input type="number" value={days} onChange={e => setDays(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white"/>
                  </div>
                )}

                {simMode === "rank" && (
                  <div className="grid grid-cols-2 gap-2">
                    {config.slots.filter(s => s !== "未選択").map(slot => (
                      <div key={slot}>
                        <label className="block text-[10px] text-slate-500 mb-1">{slot}</label>
                        <input type="number" value={userPartScores[slot] || 0} onChange={e => setUserPartScores({...userPartScores, [slot]: Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"/>
                      </div>
                    ))}
                  </div>
                )}
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-slate-400">仮想環境設定</label>
                    <Sword size={16} className="text-slate-500" />
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">装備武器</p>
                      <select 
                        value={selectedWeapon} 
                        onChange={e => setSelectedWeapon(e.target.value)}
                        className="w-full bg-slate-800 text-xs p-2 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-all"
                      >
                        {WEAPONS[gameId].map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">ターゲット(仮想敵)</p>
                      <select 
                        value={selectedEnemy} 
                        onChange={e => setSelectedEnemy(e.target.value)}
                        className="w-full bg-slate-800 text-xs p-2 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-all"
                      >
                        {ENEMIES[gameId].map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-slate-400">基礎ステータス (火力計算用)</label>
                    <button 
                      onClick={() => setUseReaction(!useReaction)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all ${useReaction ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                    >
                      <Zap size={10} className={useReaction ? 'animate-pulse' : ''} />
                      <span className="text-[10px] font-bold">{gameId === "genshin" ? "反応あり" : "特殊効果あり"}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Base Rate</p>
                      <input type="number" value={baseRate} onChange={e => setBaseRate(Number(e.target.value))} className="w-full bg-slate-800 text-xs p-2 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-all"/>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Base Dmg</p>
                      <input type="number" value={baseDmg} onChange={e => setBaseDmg(Number(e.target.value))} className="w-full bg-slate-800 text-xs p-2 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-all"/>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Base Atk%</p>
                      <input type="number" value={baseAtk} onChange={e => setBaseAtk(Number(e.target.value))} className="w-full bg-slate-800 text-xs p-2 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-all"/>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Base HP%</p>
                      <input type="number" value={baseHp} onChange={e => setBaseHp(Number(e.target.value))} className="w-full bg-slate-800 text-xs p-2 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-all"/>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Base Def%</p>
                      <input type="number" value={baseDef} onChange={e => setBaseDef(Number(e.target.value))} className="w-full bg-slate-800 text-xs p-2 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-all"/>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Base ER%</p>
                      <input type="number" value={baseEr} onChange={e => setBaseEr(Number(e.target.value))} className="w-full bg-slate-800 text-xs p-2 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-all"/>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{gameId === "genshin" ? "Base EM" : gameId === "starrail" ? "Base Break" : "Base Anomaly"}</p>
                      <input type="number" value={baseEm} onChange={e => setBaseEm(Number(e.target.value))} className="w-full bg-slate-800 text-xs p-2 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 transition-all"/>
                    </div>
                    <div className="space-y-1 col-span-1">
                      <p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest">Scaling Mode</p>
                      <select 
                        value={scalingMode} 
                        onChange={e => setScalingMode(e.target.value as any)}
                        className="w-full bg-slate-800 text-[10px] p-2 rounded-xl border border-blue-500/30 text-blue-300 outline-none font-bold"
                      >
                        <option value="atk">攻撃型</option>
                        <option value="hp">HP型</option>
                        <option value="def">防御型</option>
                        <option value="er">チャージ型</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-600 mt-2">※武器やキャラ突破分、セット効果を含めた数値を入力してください</p>
                </div>

                {simMode === "comparison" && (
                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <p className="text-xs font-bold text-slate-400 mb-2">ビルドA/B スコア調整</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest text-center">Build A</p>
                        {config.slots.filter(s => s !== "未選択").map(slot => (
                          <div key={slot}>
                            <p className="text-[8px] text-slate-500 mb-1">{slot}</p>
                            <input 
                              type="range" min="0" max="60" step="1" 
                              value={buildA[slot] || 0} 
                              onChange={e => setBuildA({...buildA, [slot]: Number(e.target.value)})}
                              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <p className="text-[8px] text-right text-slate-400">{buildA[slot]}pt</p>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3">
                        <p className="text-[9px] text-emerald-400 font-black uppercase tracking-widest text-center">Build B</p>
                        {config.slots.filter(s => s !== "未選択").map(slot => (
                          <div key={slot}>
                            <p className="text-[8px] text-slate-500 mb-1">{slot}</p>
                            <input 
                              type="range" min="0" max="60" step="1" 
                              value={buildB[slot] || 0} 
                              onChange={e => setBuildB({...buildB, [slot]: Number(e.target.value)})}
                              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                            <p className="text-[8px] text-right text-slate-400">{buildB[slot]}pt</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {simMode !== "comparison" && (
                  <button 
                    onClick={() => handleSimulate()} 
                    disabled={isSimulating}
                    className={`w-full py-4 rounded-2xl font-black text-sm shadow-2xl transition-all ${
                      isSimulating 
                        ? 'bg-slate-800 text-slate-600' 
                        : `bg-gradient-to-r ${config.gradient} text-white hover:scale-[1.02] active:scale-[0.98]`
                    }`}
                  >
                    {isSimulating ? 'SIMULATING...' : 'RUN SIMULATION'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-8">
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 min-h-[600px] flex flex-col items-center justify-center relative overflow-hidden">
              {simMode === "comparison" ? (
                <div className="w-full space-y-12 animate-in fade-in duration-500">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black text-white italic tracking-tighter">BUILD COMPARISON</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-[0.3em]">Build A vs Build B Performance</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                    {/* Divider with VS */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-slate-950 rounded-full border border-slate-800 flex items-center justify-center z-10 hidden md:flex font-black text-xs text-slate-600">VS</div>
                    
                    {/* Build A Card */}
                    <div className={`p-8 rounded-[40px] border transition-all ${calcDamageIndex(null, buildA) >= calcDamageIndex(null, buildB) ? 'bg-blue-600/10 border-blue-500/50 shadow-2xl shadow-blue-500/10' : 'bg-slate-900/50 border-slate-800'}`}>
                      <div className="flex justify-between items-center mb-6">
                        <span className="px-3 py-1 bg-blue-600 text-[10px] font-black rounded-full">BUILD A</span>
                        {calcDamageIndex(null, buildA) > calcDamageIndex(null, buildB) && <span className="text-blue-400 font-black italic">WINNER</span>}
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Damage Index</p>
                      <p className="text-6xl font-black text-white mb-8 tracking-tighter">{calcDamageIndex(null, buildA).toFixed(0)}</p>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                          <span className="text-[10px] text-slate-500">Total Score</span>
                          <span className="text-xl font-bold text-slate-300">{Object.values(buildA).reduce((a,b)=>a+b, 0)} <span className="text-[10px]">pt</span></span>
                        </div>
                        <div className="bg-slate-950/50 p-4 rounded-2xl space-y-1">
                          <p className="text-[9px] text-slate-600 font-bold mb-2 uppercase tracking-widest">Estimated Stats</p>
                          <div className="flex justify-between text-xs"><span className="text-slate-500">会心率</span><span className="text-slate-300">{(baseRate + (Object.values(buildA).reduce((a,b)=>a+b, 0) * 0.4 / 2) + 31).toFixed(1)}%</span></div>
                          <div className="flex justify-between text-xs"><span className="text-slate-500">会心ダメ</span><span className="text-slate-300">{(baseDmg + (Object.values(buildA).reduce((a,b)=>a+b, 0) * 0.4) + 62).toFixed(1)}%</span></div>
                        </div>
                      </div>
                    </div>

                    {/* Build B Card */}
                    <div className={`p-8 rounded-[40px] border transition-all ${calcDamageIndex(null, buildB) > calcDamageIndex(null, buildA) ? 'bg-emerald-600/10 border-emerald-500/50 shadow-2xl shadow-emerald-500/10' : 'bg-slate-900/50 border-slate-800'}`}>
                      <div className="flex justify-between items-center mb-6">
                        <span className="px-3 py-1 bg-emerald-600 text-[10px] font-black rounded-full">BUILD B</span>
                        {calcDamageIndex(null, buildB) > calcDamageIndex(null, buildA) && <span className="text-emerald-400 font-black italic">WINNER</span>}
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Damage Index</p>
                      <p className="text-6xl font-black text-white mb-8 tracking-tighter">{calcDamageIndex(null, buildB).toFixed(0)}</p>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                          <span className="text-[10px] text-slate-500">Total Score</span>
                          <span className="text-xl font-bold text-slate-300">{Object.values(buildB).reduce((a,b)=>a+b, 0)} <span className="text-[10px]">pt</span></span>
                        </div>
                        <div className="bg-slate-950/50 p-4 rounded-2xl space-y-1">
                          <p className="text-[9px] text-slate-600 font-bold mb-2 uppercase tracking-widest">Estimated Stats</p>
                          <div className="flex justify-between text-xs"><span className="text-slate-500">会心率</span><span className="text-slate-300">{(baseRate + (Object.values(buildB).reduce((a,b)=>a+b, 0) * 0.4 / 2) + 31).toFixed(1)}%</span></div>
                          <div className="flex justify-between text-xs"><span className="text-slate-500">会心ダメ</span><span className="text-slate-300">{(baseDmg + (Object.values(buildB).reduce((a,b)=>a+b, 0) * 0.4) + 62).toFixed(1)}%</span></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Relative Gap Bar */}
                  <div className="max-w-2xl mx-auto w-full space-y-4">
                    <div className="flex justify-between items-end">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Relative Performance Gap</p>
                      <p className="text-lg font-black text-white">
                        {Math.abs((calcDamageIndex(null, buildA) / calcDamageIndex(null, buildB) - 1) * 100).toFixed(1)}% <span className="text-xs text-slate-500 font-bold">{calcDamageIndex(null, buildA) > calcDamageIndex(null, buildB) ? 'A is Stronger' : 'B is Stronger'}</span>
                      </p>
                    </div>
                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700 flex">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-500" 
                        style={{ width: `${(calcDamageIndex(null, buildA) / (calcDamageIndex(null, buildA) + calcDamageIndex(null, buildB))) * 100}%` }}
                      ></div>
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-500" 
                        style={{ width: `${(calcDamageIndex(null, buildB) / (calcDamageIndex(null, buildA) + calcDamageIndex(null, buildB))) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-center text-[10px] text-slate-600 italic">※スコアから統計的にサブステ配分を推測して計算しています。厳密な比較にはサブステ入力を検討中。</p>
                  </div>
                </div>
              ) : (
                <React.Fragment>
                  {!result && !isSimulating && (
                    <div className="text-center space-y-4 opacity-50">
                      <div className="text-8xl">🎲</div>
                      <p className="text-xl font-bold">条件を入力して実行してください</p>
                    </div>
                  )}

                  {isSimulating && (
                    <div className="flex flex-col items-center gap-6 w-full max-w-md">
                      <div className={`w-16 h-16 border-4 border-t-transparent rounded-full animate-spin border-blue-500`}></div>
                      <div className="w-full space-y-2 text-center">
                        <p className="font-bold text-lg animate-pulse">確率の海を探索中... {simProgress}%</p>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                          <div 
                            className={`h-full bg-gradient-to-r ${config.gradient} transition-all duration-300`} 
                            style={{ width: `${simProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Running 2,500 trials per mode</p>
                      </div>
                    </div>
                  )}

                  {result && !isSimulating && (
                    <div className="w-full space-y-8 animate-in zoom-in-95 duration-300">
                      {result.type === "target" && (
                        <div className="space-y-6">
                          <h3 className="text-center text-xl font-bold">目標スコア {targetScore} 到達までにかかる日数</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-slate-800/50 p-6 rounded-[32px] border border-blue-500/30 text-center relative overflow-hidden group">
                              <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                                <Zap size={24} className="text-blue-400" />
                              </div>
                              <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">Luck: Top 10%</p>
                              <p className="text-4xl font-black text-white">{result.top10} <span className="text-sm font-bold text-slate-500">日</span></p>
                              <p className="text-[10px] text-slate-500 mt-2">非常に運が良い場合</p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-8 rounded-[40px] border border-white/10 text-center shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                              <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest mb-1">Average Expectation</p>
                              <p className="text-6xl font-black text-white tracking-tighter">{result.median} <span className="text-xl font-bold text-slate-500">日</span></p>
                              <p className="text-xs text-slate-400 mt-3 font-medium">中央値（平均的な運勢）</p>
                            </div>
                            <div className="bg-slate-800/50 p-6 rounded-[32px] border border-red-500/20 text-center relative overflow-hidden group">
                              <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                                <Shield size={24} className="text-red-400" />
                              </div>
                              <p className="text-[10px] text-red-400 font-black uppercase tracking-widest mb-1">Luck: Bottom 10%</p>
                              <p className="text-4xl font-black text-white">{result.bottom10} <span className="text-sm font-bold text-slate-500">日</span></p>
                              <p className="text-[10px] text-slate-500 mt-2">運が悪い（沼った）場合</p>
                            </div>
                          </div>

                        </div>
                      )}

                      {result.type === "period" && (
                        <div className="space-y-12">
                          <div className="text-center space-y-4">
                            <h3 className="text-3xl font-black text-white tracking-tighter uppercase">{days}日間の厳選期待値</h3>
                            <div className="flex justify-center gap-2">
                              <button onClick={() => setBreakdownView("median")} className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${breakdownView === "median" ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-500'}`}>AVERAGE</button>
                              <button onClick={() => setBreakdownView("top10")} className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${breakdownView === "top10" ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-800 text-slate-500'}`}>TOP 10%</button>
                              <button onClick={() => setBreakdownView("bottom10")} className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${breakdownView === "bottom10" ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-800 text-slate-500'}`}>BOTTOM 10%</button>
                            </div>
                          </div>

                          <div className="flex flex-col lg:flex-row gap-8 items-center">
                            <div className="w-full lg:w-1/2 space-y-6">
                              <div className="bg-slate-800/30 p-8 rounded-[40px] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all transform group-hover:scale-110">
                                  <Target size={120} />
                                </div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-2">Estimated Build Score</p>
                                <p className="text-7xl font-black text-white tracking-tighter mb-4">
                                  {result[breakdownView].toFixed(1)} <span className="text-xl font-bold text-slate-600 uppercase">Score</span>
                                </p>
                                <div className="flex items-center gap-4 text-xs font-bold">
                                  <div className="flex items-center gap-1.5 text-blue-400">
                                    <Sword size={14} />
                                    <span>DMG Index: {calcDamageIndex({pieces: breakdownView === "median" ? result.pieces : breakdownView === "top10" ? result.top10Pieces : result.bottom10Pieces}).toFixed(0)}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={result.rawScores.slice(0, 50).map((s: number, i: number) => ({id: i, score: s}))}>
                                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                                      {result.rawScores.slice(0, 50).map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={index === Math.floor(breakdownView === "median" ? 25 : breakdownView === "top10" ? 45 : 5) ? '#3b82f6' : '#1e293b'} />
                                      ))}
                                    </Bar>
                                    <XAxis hide />
                                    <Tooltip 
                                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                                      labelStyle={{ display: 'none' }}
                                    />
                                  </BarChart>
                                </ResponsiveContainer>
                                <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-2">Score Distribution (Sample 50)</p>
                              </div>
                            </div>

                            <div className="w-full lg:w-1/2 grid grid-cols-2 md:grid-cols-3 gap-3">
                              {Object.entries((breakdownView === "median" ? result.pieces : breakdownView === "top10" ? result.top10Pieces : result.bottom10Pieces) || {}).map(([slot, art]: [string, any]) => (
                                <div key={slot} className="bg-slate-800/40 border border-slate-700/30 p-4 rounded-3xl group hover:border-blue-500/30 transition-all">
                                  <p className="text-[9px] text-slate-500 font-black uppercase mb-2 truncate">{slot}</p>
                                  {art ? (
                                    <div className="space-y-1">
                                      <p className="text-sm font-black text-white">{art.score.toFixed(1)} <span className="text-[10px] text-slate-500">pt</span></p>
                                      <p className="text-[9px] text-blue-400 font-bold truncate">{art.setName}</p>
                                      <p className="text-[8px] text-slate-600 truncate">{art.main}</p>
                                    </div>
                                  ) : (
                                    <p className="text-[10px] text-slate-700 font-bold">N/A</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {result.type === "rank" && (
                        <div className="space-y-8">
                          <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-32 h-32 rounded-full border-4 border-blue-500/30 flex items-center justify-center relative">
                              <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl"></div>
                              <span className="text-4xl font-black text-white tracking-tighter">
                                {result.percentile.toFixed(1)}<span className="text-sm">%</span>
                              </span>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white tracking-tight">上位 {result.percentile.toFixed(1)}% の実力です</h3>
                              <p className="text-sm text-slate-500 mt-1">{days}日間の厳選を {result.trials}回試行した結果との比較</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-800/30 p-6 rounded-[32px] border border-white/5">
                              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 text-center">Your Current Build</p>
                              <p className="text-5xl font-black text-white text-center tracking-tighter">{result.userScore} <span className="text-sm text-slate-600 uppercase">Score</span></p>
                            </div>
                            <div className="bg-slate-800/30 p-6 rounded-[32px] border border-white/5">
                              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 text-center">Average for {days} Days</p>
                              <p className="text-5xl font-black text-white text-center tracking-tighter">{result.median.toFixed(1)} <span className="text-sm text-slate-600 uppercase">Score</span></p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-8 border-t border-slate-800">
                        <button onClick={downloadImage} className="flex items-center gap-2 px-8 py-3 bg-white text-slate-950 font-black text-sm rounded-full shadow-xl hover:scale-105 transition-all">
                          <span>SNSで結果をシェア</span>
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Damage Index Display (Unified) */}
                  <div className="w-full max-w-2xl mx-auto mt-8">
                    <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/10 border border-blue-500/30 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
                      <p className="text-[10px] font-black text-blue-400 tracking-[0.3em] uppercase mb-1">Expected Damage Index</p>
                      <p className="text-5xl font-black text-white tracking-tighter">
                        {calcDamageIndex(result).toFixed(2)}<span className="text-xl text-slate-500 ml-1">x</span>
                      </p>
                      {compareResult && (
                        <div className={`mt-3 px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-2 border ${
                          (calcDamageIndex(result) / calcDamageIndex(compareResult)) >= 1 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        }`}>
                          <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                          {((calcDamageIndex(result) / calcDamageIndex(compareResult) - 1) * 100) >= 0 ? '+' : ''}
                          {((calcDamageIndex(result) / calcDamageIndex(compareResult) - 1) * 100).toFixed(1)}% <span className="opacity-50 font-bold ml-1">vs Past Build</span>
                        </div>
                      )}
                      <p className="text-[9px] text-slate-500 mt-4 font-medium italic">※入力された基礎ステータスと、全6部位のメイン・サブステータスを合算して算出</p>
                    </div>
                  </div>

                  {/* Piece Breakdown (Common for all modes) */}
                  {result && result.pieces && (
                    <div className="mt-10 pt-8 border-t border-slate-700/50 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">構成の内訳 (期待値の例)</h4>
                        
                        {/* Tab Switcher for Period Mode */}
                        {result.top10Pieces && (
                          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700 text-[10px]">
                            <button 
                              onClick={() => setBreakdownView("bottom10")}
                              className={`px-3 py-1.5 rounded-lg transition-all ${breakdownView === "bottom10" ? "bg-slate-700 text-white font-bold" : "text-slate-500 hover:text-slate-300"}`}
                            >
                              不運 (下位10%)
                            </button>
                            <button 
                              onClick={() => setBreakdownView("median")}
                              className={`px-3 py-1.5 rounded-lg transition-all ${breakdownView === "median" ? "bg-slate-700 text-white font-bold" : "text-slate-500 hover:text-slate-300"}`}
                            >
                              中央値 (平均)
                            </button>
                            <button 
                              onClick={() => setBreakdownView("top10")}
                              className={`px-3 py-1.5 rounded-lg transition-all ${breakdownView === "top10" ? "bg-slate-700 text-white font-bold" : "text-slate-500 hover:text-slate-300"}`}
                            >
                              幸運 (上位10%)
                            </button>
                          </div>
                        )}
                        {!result.top10Pieces && <div className="h-px flex-1 mx-4 bg-slate-800 hidden sm:block"></div>}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {Object.entries(
                          breakdownView === "top10" && result.top10Pieces ? result.top10Pieces :
                          breakdownView === "bottom10" && result.bottom10Pieces ? result.bottom10Pieces :
                          result.pieces
                        ).map(([slot, art]: [string, any]) => (
                          <div key={slot} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex flex-col items-center group hover:border-slate-700 transition-all min-h-[140px]">
                            <span className="text-[10px] text-slate-500 mb-1 font-bold truncate w-full text-center">{slot}</span>
                            <span className="text-xl font-black text-white group-hover:text-blue-400 transition-colors mb-2">{art?.score ? art.score.toFixed(1) : "0.0"}</span>
                            
                            {/* Main Stat */}
                            {art?.main && (
                              <div className="w-full bg-slate-800/50 py-1 px-2 rounded mb-2 text-center">
                                <p className="text-[9px] text-slate-500 font-bold leading-none mb-0.5">MAIN</p>
                                <p className="text-[10px] text-blue-300 font-black truncate">
                                  {art.main}
                                </p>
                              </div>
                            )}

                            {/* Substats List */}
                            <div className="w-full space-y-1">
                              {art?.substats && Object.entries(art.substats).map(([s, v]: [string, any]) => (
                                <div key={s} className="flex justify-between text-[9px] leading-tight">
                                  <span className="text-slate-500">{s}</span>
                                  <span className="text-slate-300 font-medium">
                                    {v.toFixed(1)}{s.includes("%") || s.includes("率") || s.includes("ダメージ") || s.includes("効率") || s.includes("特効") || s.includes("命中") || s.includes("掌握") ? "%" : ""}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-center text-slate-600 mt-6 italic">
                        {breakdownView === "top10" ? "※ 運がかなり良かった（上位10%）場合の結果例です" :
                         breakdownView === "bottom10" ? "※ 運が悪かった（下位10%）場合の結果例です" :
                         "※ セット効果を最大化（原神:4+1, スタレ:4+2, ZZZ:4+2）した際の各部位スコアです"}
                      </p>
                    </div>
                  )}
                </React.Fragment>
              )}
            </div>
          </div>

            {/* --- COMPARISON RESULT (Optional) --- */}
            {compareResult && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700 opacity-80 hover:opacity-100 transition-opacity">
                <div className="bg-slate-700/50 text-slate-400 py-1 px-4 rounded-full text-[10px] font-black w-fit border border-slate-600/30">
                  PAST / A (比較対象)
                </div>

                {compareResult.type === "score" ? (
                  <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-transparent pointer-events-none" />
                    <p className="text-slate-500 text-xs font-bold tracking-widest mb-4">目標スコア達成までの期待値</p>
                    <div className="flex justify-center items-baseline gap-4 mb-6">
                      <p className="text-7xl font-black text-white tracking-tighter">{Math.floor(compareResult.stamina / 240)}</p>
                      <p className="text-2xl font-black text-slate-500 uppercase tracking-widest">Days</p>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-full border border-slate-700/50 text-slate-400 text-sm font-bold">
                      <Zap size={16} className="text-slate-500" />
                      合計消費スタミナ: {compareResult.stamina.toLocaleString()}
                    </div>
                  </div>
                ) : compareResult.type === "period" ? (
                  <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 text-center">
                    <p className="text-slate-500 text-xs font-bold tracking-widest mb-6 uppercase">{compareResult.activeDays}日間の厳選で期待できるスコア</p>
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-700/30">
                        <p className="text-[10px] text-slate-500 font-bold mb-2">下位10%</p>
                        <p className="text-2xl font-black text-slate-400">{compareResult.bottom10.toFixed(1)}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-700/30 border border-slate-600/50 ring-1 ring-slate-500/30">
                        <p className="text-[10px] text-slate-300 font-bold mb-2">中央値 (平均)</p>
                        <p className="text-4xl font-black text-white">{compareResult.median.toFixed(1)}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-700/30">
                        <p className="text-[10px] text-slate-500 font-bold mb-2">上位10%</p>
                        <p className="text-2xl font-black text-emerald-500/70">{compareResult.top10.toFixed(1)}</p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Damage Index for Comparison */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 flex flex-col items-center">
                  <p className="text-[9px] font-bold text-slate-500 tracking-widest uppercase mb-1">Comparison Damage Index</p>
                  <p className="text-2xl font-black text-slate-300">
                    {calcDamageIndex(compareResult).toFixed(2)}<span className="text-xs text-slate-600 font-bold">x</span>
                  </p>
                </div>

                {/* Breakdown for Comparison */}
                <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-3xl p-6">
                  <h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-6 flex items-center gap-2">
                    <LayoutGrid size={14} />
                    構成の内訳 (比較対象)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {compareResult.pieces && Object.entries(compareResult.pieces).map(([slot, art]: [string, any]) => (
                      <div key={slot} className="bg-slate-900/30 border border-slate-800 rounded-xl p-3 flex flex-col items-center opacity-60">
                        <span className="text-[9px] text-slate-600 mb-1 font-bold truncate w-full text-center">{slot}</span>
                        <span className="text-lg font-black text-slate-500 mb-1">{art?.score ? art.score.toFixed(1) : "0.0"}</span>
                        {art?.main && (
                          <p className="text-[8px] text-slate-600 font-black truncate bg-slate-950/50 px-1 rounded">{art.main}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
        </div>

      {/* --- Footer --- */}
        <footer className="mt-20 pb-12 border-t border-slate-800/50 pt-12 text-center">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <Link href="/blog/usage" className="hover:text-emerald-400 transition-colors">Usage Guide / 使い方</Link>
            <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
            <a href="https://github.com/bonta9puri" target="_blank" rel="noopener" className="hover:text-white transition-colors">GitHub</a>
            <a href="https://twitter.com" target="_blank" rel="noopener" className="hover:text-sky-400 transition-colors">Twitter (X)</a>
          </div>
          <div className="space-y-2">
            <p className="text-[9px] text-slate-600 font-medium">© 2026 artifact-sim.com. All Rights Reserved.</p>
            <p className="text-[8px] text-slate-700 font-bold max-w-xl mx-auto px-4 leading-relaxed">
              当サイトは個人が制作した非公式のファンサイトであり、HoYoverse、COGNOSPHERE社とは一切関係ありません。
              ゲーム画像の著作権は各権利所有者に帰属します。
            </p>
          </div>
        </footer>
      </div>

      {/* Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="relative w-80 bg-slate-900 h-full border-l border-slate-800 p-8 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-black">Menu</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Sim History</p>
              {history.length === 0 && <p className="text-center text-slate-600 py-10 italic">履歴はありません</p>}
              {[...history].reverse().map((item, i) => (
                <div key={i} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-blue-400">{item.result?.type === "target" ? "🎯 目標診断" : "⏳ 期間シミュ"}</span>
                    <span className="text-[10px] text-slate-500">{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-300 truncate mb-3">
                    {item.character}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setResult(item.result);
                        setIsDrawerOpen(false);
                      }}
                      className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-[10px] font-bold transition-colors"
                    >
                      復元
                    </button>
                    <button 
                      onClick={() => {
                        setCompareResult(item.result);
                        setIsDrawerOpen(false);
                      }}
                      className="flex-1 py-2 bg-blue-600/50 hover:bg-blue-600 rounded-lg text-[10px] font-bold transition-colors"
                    >
                      比較
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <nav className="mt-6 pt-6 border-t border-slate-800 space-y-2">
              <a href="/chronicle" className="block py-2 px-4 hover:bg-slate-800 rounded-xl transition-colors text-xs text-slate-400">📜 Chronicle Hub</a>
              <a href="/about" className="block py-2 px-4 hover:bg-slate-800 rounded-xl transition-colors text-xs text-slate-400">About</a>
            </nav>
            
            <div className="mt-auto pt-6 border-t border-slate-800">
              <p className="text-center text-[10px] text-slate-600">© 2026 Artifact Sim</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
