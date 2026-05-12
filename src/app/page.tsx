"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { GAME_CONFIGS, GameId, GameConfig } from '@/lib/game_data';
import { simulateUntilScore, simulateFixedAttempts, compareRecycleEfficiency, MAIN_PROBS } from '@/lib/simulator';
import { SET_EFFECTS_TEXT, SET_BONUS_STATS, getActiveSets } from '@/lib/set_effects';
import { SET_PAIRS } from '@/lib/set_pairs';
import { toPng } from 'html-to-image';
import { BarChart, Bar, XAxis, Tooltip, ReferenceLine, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, YAxis } from 'recharts';
import { Zap, Shield, Sword, LayoutGrid, BookOpen, Target, Calendar, MessageSquare, ChevronLeft, X } from 'lucide-react';

export default function Home() {
  const [gameId, setGameId] = useState<GameId>("genshin");
  const config = GAME_CONFIGS[gameId];
  
  const [simMode, setSimMode] = useState<"target" | "period" | "rank" | "upgrade">("target");


  // 診断モード用スコア入力UIの更新
  useEffect(() => {
    if (simMode === "upgrade") {
      const initial: any = {};
      config.slots.forEach(s => { if(s !== "未選択") initial[s] = 30; });
      if (Object.keys(userPartScores).length === 0) setUserPartScores(initial);
    }
  }, [simMode, config]);
  const [characterName, setCharacterName] = useState<string>("ヌヴィレット");
  const [elementFilter, setElementFilter] = useState<string>("ALL");

  // キャラクター変更時にデフォルト値を適用
  useEffect(() => {
    const charData = config.characters.find(c => c.name === characterName);
    if (charData && charData.defaults) {
      const d = charData.defaults;
      if (d.weights) setScoreWeights(d.weights);
      if (d.mainStats) setMainStats(d.mainStats);
      if (d.targetSets) setTargetSets(d.targetSets);
    }
  }, [characterName, gameId]);

  // ゲーム変更時にフィルターとキャラをリセット
  useEffect(() => {
    setElementFilter("ALL");
    const firstChar = config.characters[0]?.name || "未選択";
    setCharacterName(firstChar);
  }, [gameId]);
  
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
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);
  const [luckPercentile, setLuckPercentile] = useState(50);
  const [sortedResults, setSortedResults] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [upgradeResult, setUpgradeResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  
  const [targetSets, setTargetSets] = useState<string[]>(["", "", "", ""]);

  // Elixir Settings
  const [elixirEnabled, setElixirEnabled] = useState(false);
  const [elixirInitialCount, setElixirInitialCount] = useState(0);
  const [elixirPerVersion, setElixirPerVersion] = useState(1);
  const [elixirTargetPart, setElixirTargetPart] = useState("空の杯");
  const [elixirTargetMain, setElixirTargetMain] = useState("元素ダメージ");
  const [elixirTargetSet, setElixirTargetSet] = useState("");
  const [elixirSub1, setElixirSub1] = useState("会心率");
  const [elixirSub2, setElixirSub2] = useState("会心ダメージ");


  // God pieces
  const [latestGodPiece, setLatestGodPiece] = useState<any>(null);
  const [allGodPieces, setAllGodPieces] = useState<any[]>([]);

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
    setLatestGodPiece(null);
    setAllGodPieces([]);
    setSortedResults([]);
    
    const staminaCost = gameId === "genshin" ? 20 : 40;
    const trials = 500;
    const subPool = config.subStats.filter(s => s !== "未選択");

    if (simMode === "upgrade") {
      const upgradeStats: Record<string, { count: number, totalIncrease: number }> = {};
      config.slots.forEach(s => { if(s !== "未選択") upgradeStats[s] = { count: 0, totalIncrease: 0 }; });
      let overallUpgraded = 0;
      const attempts = Math.ceil((days * staminaPerDay) / staminaCost);

      for (let i = 0; i < trials; i++) {
        if (i % 10 === 0) {
          setSimProgress(Math.floor((i / trials) * 100));
          await new Promise(r => setTimeout(r, 1));
        }
        const res = simulateFixedAttempts(gameId, attempts, staminaPerDay, scoreWeights, subPool, useStrongbox, mainStats, targetSets);
        
        let upgradedAny = false;
        Object.entries(res.pieces).forEach(([slot, piece]: [string, any]) => {
          const current = userPartScores[slot] || 0;
          if (piece && piece.score > current) {
            upgradeStats[slot].count++;
            upgradeStats[slot].totalIncrease += (piece.score - current);
            upgradedAny = true;
          }
        });
        if (upgradedAny) overallUpgraded++;
      }

      const overallProb = (overallUpgraded / trials) * 100;
      const slotResults = Object.entries(upgradeStats).map(([slot, stat]) => ({
        slot,
        prob: (stat.count / trials) * 100,
        avgIncrease: stat.count > 0 ? stat.totalIncrease / stat.count : 0
      })).sort((a, b) => b.prob - a.prob);

      setUpgradeResult({ overallProb, slotResults, trials, days });
      setResult({ type: "upgrade" });
      setSimProgress(100);
      setIsSimulating(false);
      return;
    }

    if (simMode === "target") {
      const elixirConfig = {
        enabled: elixirEnabled,
        initialCount: elixirInitialCount,
        perVersion: elixirPerVersion,
        targetPart: elixirTargetPart,
        targetSet: elixirTargetSet,
        targetMain: elixirTargetMain,
        sub1: elixirSub1,
        sub2: elixirSub2
      };
      let collectedGods: any[] = [];
      const results: {attempts: number, pieces: any, godPieces?: any[]}[] = [];
      for (let i = 0; i < trials; i++) {
        if (i % 10 === 0) {
          setSimProgress(Math.floor((i / trials) * 100));
          await new Promise(r => setTimeout(r, 1));
        }
        const res = simulateUntilScore(gameId, targetScore, scoreWeights, subPool, useStrongbox, mainStats, targetSets, elixirConfig);
        results.push(res);
        if (res.godPieces && res.godPieces.length > 0) {
          collectedGods.push(...res.godPieces);
          setLatestGodPiece(res.godPieces[res.godPieces.length - 1]);
        }
      }
      results.sort((a, b) => a.attempts - b.attempts);
      setSortedResults(results);
      setLuckPercentile(50);
      collectedGods.sort((a, b) => b.score - a.score);
      setAllGodPieces(collectedGods.slice(0, 10));
      
      const medianRes = results[Math.floor(trials / 2)];
      const top10Res = results[Math.floor(trials * 0.1)];
      const bottom10Res = results[Math.floor(trials * 0.9)];
  
  
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
      const elixirConfig = {
        enabled: elixirEnabled,
        initialCount: elixirInitialCount,
        perVersion: elixirPerVersion,
        targetPart: elixirTargetPart,
        targetSet: elixirTargetSet,
        targetMain: elixirTargetMain,
        sub1: elixirSub1,
        sub2: elixirSub2
      };
      let collectedGods: any[] = [];
      const results: {score: number, pieces: any, godPieces?: any[]}[] = [];
      for (let i = 0; i < trials; i++) {
        if (i % 10 === 0) {
          setSimProgress(Math.floor((i / trials) * 100));
          await new Promise(r => setTimeout(r, 1));
        }
        const res = simulateFixedAttempts(gameId, totalAttempts, staminaPerDay, scoreWeights, subPool, useStrongbox, mainStats, targetSets, elixirConfig);
        results.push(res);
        if (res.godPieces && res.godPieces.length > 0) {
          collectedGods.push(...res.godPieces);
          setLatestGodPiece(res.godPieces[res.godPieces.length - 1]);
        }
      }
      results.sort((a, b) => b.score - a.score);
      setSortedResults(results);
      setLuckPercentile(50);
      collectedGods.sort((a, b) => b.score - a.score);
      setAllGodPieces(collectedGods.slice(0, 10));
      
      if (simMode === "period") {
        const medianRes = results[Math.floor(trials / 2)];
        const top10Res = results[Math.floor(trials * 0.1)];
        const bottom10Res = results[Math.floor(trials * 0.9)];
        
        // 平均的なエリクシルによる伸びを計算
        const avgBonus = results.reduce((acc, r: any) => acc + (r.score - (r.scoreBeforeElixir || r.score)), 0) / trials;

        const finalRes = {
          type: "period",
          median: medianRes.score,
          top10: top10Res.score,
          bottom10: bottom10Res.score,
          elixirBonus: avgBonus,
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
        const percentile = Math.max(0.1, 100 - (belowCount / trials) * 100);
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

  const snsCardRef = useRef<HTMLDivElement>(null);

  const downloadImage = useCallback(() => {
    // SNS専用カードがあればそちらを優先、なければ現在の表示パネルをキャプチャ
    const target = (snsCardRef.current?.style.display !== 'none' ? snsCardRef.current : cardRef.current) || cardRef.current;
    if (target === null) return;
    
    toPng(target, { cacheBust: true, pixelRatio: 3, backgroundColor: '#020617' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `${gameId}_${characterName}_診断結果.png`;
        link.href = dataUrl;
        link.click();
      });
  }, [cardRef, snsCardRef, characterName, gameId]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-6xl space-y-6">
        
        {/* --- SNS SHARE CARD (Capture Target) --- */}
        <div className="fixed -left-[9999px] top-0 pointer-events-none">
          <div ref={snsCardRef} className="w-[480px] min-h-[850px] bg-slate-950 p-10 flex flex-col items-center relative overflow-hidden font-sans border-[12px] border-slate-900 shadow-2xl">
            {/* Background Decorations */}
            <div className={`absolute top-[-100px] right-[-100px] w-64 h-64 rounded-full blur-[100px] opacity-30 bg-gradient-to-br ${config.gradient}`}></div>
            <div className={`absolute bottom-[-100px] left-[-100px] w-80 h-80 rounded-full blur-[120px] opacity-20 bg-gradient-to-br ${config.gradient}`}></div>
            
            {/* Header */}
            <div className="z-10 w-full text-center mb-12">
              <p className={`text-[10px] font-black tracking-[0.4em] uppercase mb-2 bg-clip-text text-transparent bg-gradient-to-r ${config.gradient}`}>
                {config.name} Artifact Simulator
              </p>
              <h2 className="text-4xl font-black text-white tracking-tighter italic">{characterName}</h2>
              <div className="h-1.5 w-16 bg-white/20 mx-auto mt-6 rounded-full"></div>
            </div>

            {/* Main Result Area */}
            {result && (
              <div className="z-10 w-full flex flex-col items-center mb-12">
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[50px] p-10 w-full flex flex-col items-center shadow-2xl relative ring-1 ring-white/5">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">
                    {result.type === "target" ? "Expected Days to Reach Target" : result.type === "period" ? `${days} Days Farm Result` : result.type === "upgrade" ? `${days} Days Upgrade Prob.` : "Build Performance Rank"}
                  </p>
                  
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-8xl font-black text-white tracking-tighter drop-shadow-2xl">
                      {result.type === "rank" ? result.percentile.toFixed(1) : result.type === "upgrade" ? upgradeResult?.overallProb.toFixed(1) : result.median}
                    </span>
                    <span className="text-2xl font-black text-slate-500 uppercase tracking-widest">
                      {result.type === "rank" || result.type === "upgrade" ? "%" : result.type === "target" ? "Days" : "Score"}
                    </span>
                  </div>

                  <p className="text-sm font-black text-blue-400 mb-8 tracking-wider">
                    {result.type === "rank" ? "TOP PERCENTILE" : result.type === "upgrade" ? "UPGRADE CHANCE" : "ESTIMATED AVERAGE"}
                  </p>

                  {/* Range (Top/Bottom 10%) for Target/Period */}
                  {(result.type === "target" || result.type === "period") && (
                    <div className="w-full grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
                      <div className="text-center">
                        <p className="text-[9px] text-emerald-400 font-black uppercase tracking-widest mb-2">LUCK: TOP 10%</p>
                        <p className="text-3xl font-black text-white leading-none tracking-tighter">
                          {result.type === "target" 
                            ? `+${((1 - result.top10 / result.median) * 100).toFixed(0)}% 得`
                            : `+${((result.top10 / result.median - 1) * 100).toFixed(0)}% 強`
                          }
                        </p>
                      </div>
                      <div className="text-center border-l border-white/10">
                        <p className="text-[9px] text-rose-400 font-black uppercase tracking-widest mb-2">LUCK: BOTTOM 10%</p>
                        <p className="text-3xl font-black text-white leading-none tracking-tighter">
                          {result.type === "target"
                            ? `-${((result.bottom10 / result.median - 1) * 100).toFixed(0)}% 損`
                            : `-${((1 - result.bottom10 / result.median) * 100).toFixed(0)}% 弱`
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Upgrade breakdown for SNS card */}
                  {result.type === "upgrade" && upgradeResult && (
                    <div className="w-full grid grid-cols-2 gap-4 pt-8 border-t border-white/10">
                      {upgradeResult.slotResults.slice(0, 4).map((res: any) => (
                        <div key={res.slot} className="text-center">
                          <p className="text-[7px] text-slate-500 font-black uppercase mb-1 truncate">{res.slot}</p>
                          <p className="text-xl font-black text-white tracking-tighter">{res.prob.toFixed(1)}%</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 3-Way Comparison for Rank Diagnosis */}
                  {result.type === "rank" && (
                    <div className="w-full grid grid-cols-3 gap-2 pt-8 border-t border-white/10">
                      <div className="text-center">
                        <p className="text-[7px] text-slate-500 font-black uppercase mb-2">Current</p>
                        <p className="text-lg font-black text-white">{result.userScore}</p>
                      </div>
                      <div className="text-center border-l border-white/10">
                        <p className="text-[7px] text-slate-500 font-black uppercase mb-2">Average</p>
                        <p className="text-lg font-black text-white">{result.median.toFixed(0)}</p>
                      </div>
                      <div className="text-center border-l border-white/10">
                        <p className="text-[7px] text-emerald-500 font-black uppercase mb-2">Target</p>
                        <p className="text-lg font-black text-emerald-400">{targetScore}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Piece Breakdown (Compact Cards) */}
            {result && result.pieces && (
              <div className="z-10 w-full mb-12">
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] text-center mb-6">Equipped Pieces Summary</p>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(result.pieces).map(([slot, art]: [string, any]) => {
                    if (!art) return (
                      <div key={slot} className="bg-slate-900/60 border border-white/5 p-4 rounded-3xl flex flex-col items-center justify-center min-h-[120px] opacity-30">
                        <p className="text-[7px] text-slate-600 font-black uppercase tracking-widest truncate w-full text-center">{slot}</p>
                        <p className="text-[10px] font-bold text-slate-500">N/A</p>
                      </div>
                    );

                    const shortMain = art.main
                      .replace("会心率", "率")
                      .replace("会心ダメージ", "ダメ")
                      .replace("攻撃力%", "攻撃%")
                      .replace("HP%", "HP%")
                      .replace("防御力%", "防御%")
                      .replace("元素熟知", "熟知")
                      .replace("元素チャージ効率", "チャージ")
                      .replace("元素ダメ", "ダメ")
                      .replace("物理ダメージ", "物理")
                      .replace("与える治療効果", "治療");

                    return (
                      <div key={slot} className="bg-slate-900/60 border border-white/5 p-4 rounded-3xl flex flex-col items-center justify-between min-h-[120px] relative overflow-hidden group">
                        {art.isElixir && (
                          <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-400 to-yellow-600 text-slate-950 text-[6px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-tighter z-10 shadow-sm animate-pulse">
                            祝聖
                          </div>
                        )}
                        <p className="text-[7px] text-slate-600 font-black uppercase tracking-widest truncate w-full text-center">{slot}</p>
                        <div className="flex flex-col items-center -my-1">
                           <p className="text-[8px] text-slate-500 font-bold mb-0.5">{shortMain}</p>
                          <p className={`text-xl font-black tracking-tighter ${art.isElixir ? 'text-yellow-400' : 'text-white'}`}>{art.score.toFixed(1)}</p>
                        </div>
                        <div className="w-full text-center">
                          <p className="text-[6px] text-blue-400/50 font-black truncate leading-tight">{art.setName}</p>
                          <p className="text-[7px] text-blue-500/80 font-bold truncate w-full leading-none">{art.main}</p>
                        </div>
                      </div>
                    );
                  })}
                  {gameId === "genshin" && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-3xl flex flex-col items-center justify-between min-h-[120px] shadow-lg shadow-emerald-500/5">
                      <p className="text-[7px] text-emerald-700 font-black uppercase tracking-widest">TARGET</p>
                      <p className="text-2xl font-black text-emerald-400 tracking-tighter">{targetScore}</p>
                      <p className="text-[7px] text-emerald-600/80 font-bold uppercase">GOAL</p>
                    </div>
                  )}
                  {gameId !== "genshin" && (
                    <>
                      <div className="invisible"></div>
                      <div className="invisible"></div>
                      <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-3xl flex flex-col items-center justify-between min-h-[120px] shadow-lg shadow-emerald-500/5">
                        <p className="text-[7px] text-emerald-700 font-black uppercase tracking-widest">TARGET</p>
                        <p className="text-2xl font-black text-emerald-400 tracking-tighter">{targetScore}</p>
                        <p className="text-[7px] text-emerald-600/80 font-bold uppercase">GOAL</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="z-10 mt-auto w-full flex items-center justify-between border-t border-white/10 pt-10">
              <div className="text-left">
                <p className="text-[10px] text-slate-600 font-black tracking-widest mb-1">PRODUCED BY</p>
                <p className={`text-xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r ${config.gradient}`}>ARTIFACT-SIM.COM</p>
              </div>
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                <div className="w-10 h-10 border-2 border-white/20 rounded-lg flex items-center justify-center">
                   <div className="w-4 h-4 bg-white/40 rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-24 lg:pb-0">
          {/* Settings Panel (Mobile Bottom Sheet / Desktop Sidebar) */}
          <div className={`lg:col-span-4 space-y-6 ${isMobileSettingsOpen ? 'fixed inset-0 z-40' : 'hidden lg:block'}`}>
            {/* Backdrop for mobile */}
            <div 
              className={`lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${isMobileSettingsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
              onClick={() => setIsMobileSettingsOpen(false)}
            ></div>
            
            {/* The Panel Content */}
            <div className={`bg-slate-900 border border-slate-800 rounded-t-[40px] lg:rounded-3xl p-6 shadow-2xl backdrop-blur-md transition-all duration-300 relative z-50 h-[85vh] lg:h-auto overflow-y-auto custom-scrollbar ${isMobileSettingsOpen ? 'translate-y-0 bottom-0 fixed w-full' : 'translate-y-full lg:translate-y-0 lg:static w-full'}`}>
              <div className="lg:hidden w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-6"></div>
              
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold flex items-center gap-2">⚙️ 設定</h2>
                <button className="lg:hidden p-2 text-slate-500 hover:text-white transition-colors" onClick={() => setIsMobileSettingsOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-5">
                <div className="flex flex-col gap-2">
                  <button onClick={() => setSimMode("target")} className={`py-3 rounded-xl text-sm font-bold transition-all ${simMode === "target" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-slate-800 text-slate-500 hover:bg-slate-700"}`}>🎯 目標スコア診断</button>
                  <button onClick={() => setSimMode("period")} className={`py-3 rounded-xl text-sm font-bold transition-all ${simMode === "period" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-slate-800 text-slate-500 hover:bg-slate-700"}`}>⏳ 期間シミュ</button>
                  <button onClick={() => setSimMode("rank")} className={`py-3 rounded-xl text-sm font-bold transition-all ${simMode === "rank" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-slate-800 text-slate-500 hover:bg-slate-700"}`}>🏆 ランク診断</button>
                  <button onClick={() => setSimMode("upgrade")} className={`py-3 rounded-xl text-sm font-bold transition-all ${simMode === "upgrade" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-slate-800 text-slate-500 hover:bg-slate-700"}`}>📈 更新確率診断</button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">キャラクター</label>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <button 
                      onClick={() => setElementFilter("ALL")}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${elementFilter === "ALL" ? 'bg-slate-700 text-white shadow-lg shadow-white/5' : 'bg-slate-950 text-slate-600 border border-slate-800'}`}
                    >
                      ALL
                    </button>
                    {Array.from(new Set(config.characters.map(c => c.element))).filter(e => e !== "無" && e !== "その他").map(el => (
                      <button
                        key={el}
                        onClick={() => setElementFilter(el)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${elementFilter === el ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-950 text-slate-600 border border-slate-800 hover:border-slate-600'}`}
                      >
                        {el}
                      </button>
                    ))}
                  </div>
                  <select value={characterName} onChange={e => setCharacterName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition-all">
                    {config.characters.filter(c => elementFilter === "ALL" || c.element === elementFilter).map(c => (
                      <option key={c.name} value={c.name}>
                        {c.defaults ? `✨ ${c.name}` : c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                  <label className="block text-sm font-medium text-slate-400 mb-3">狙いのセット (ダンジョン別)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {targetSets.map((setName, idx) => {
                      const label = gameId === "starrail" 
                        ? (idx === 0 ? "遺物1 (大本命)" : idx === 1 ? "遺物2 (副産物)" : idx === 2 ? "オーナメント1 (大本命)" : "オーナメント2 (副産物)") 
                        : (idx === 0 ? "セット1 (大本命)" : idx === 1 ? "セット2 (副産物)" : idx === 2 ? "別秘境セット1" : "別秘境セット2");
                      return (
                        <div key={idx} className="space-y-1">
                          <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">{label}</p>
                          <select 
                            value={setName} 
                            onChange={e => {
                              const val = e.target.value;
                              const newSets = [...targetSets];
                              newSets[idx] = val;
                              const pair = SET_PAIRS[gameId][val];
                              if (pair) {
                                if (idx === 0 && !newSets[1]) newSets[1] = pair;
                                if (idx === 2 && !newSets[3]) newSets[3] = pair;
                              }
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
                  <p className="text-[9px] text-emerald-400 mt-2 italic">※「大本命」に設定したセットを最優先で装備するように計算します。<br/><span className="text-slate-500">※1&2(A)と3&4(B)は別ダンジョンとして計算します</span></p>
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
                          onChange={e => setScoreWeights({...scoreWeights, [sub]: e.target.value === "" ? 0 : Number(e.target.value)})}
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
                    <input type="number" value={targetScore} onChange={e => setTargetScore(e.target.value === "" ? 0 : Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white"/>
                  </div>
                )}

                {(simMode === "period" || simMode === "rank" || simMode === "upgrade") && (
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">厳選日数</label>
                    <input type="number" value={days} onChange={e => setDays(e.target.value === "" ? 0 : Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white"/>
                  </div>
                )}

                {(simMode === "rank" || simMode === "upgrade") && (
                  <div className="grid grid-cols-2 gap-2 bg-slate-950/30 p-4 rounded-2xl border border-slate-800/50">
                    <p className="col-span-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">現在の部位別スコア</p>
                    {config.slots.filter(s => s !== "未選択").map(slot => (
                      <div key={slot}>
                        <label className="block text-[10px] text-slate-500 mb-1">{slot}</label>
                        <input type="number" value={userPartScores[slot] || 0} onChange={e => setUserPartScores({...userPartScores, [slot]: e.target.value === "" ? 0 : Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"/>
                      </div>
                    ))}
                  </div>
                )}

                {gameId === "genshin" && (
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-emerald-900/50">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-medium text-emerald-400 flex items-center gap-2">✨ 祝聖のエリクシル</label>
                      <button 
                        onClick={() => setElixirEnabled(!elixirEnabled)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${elixirEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                      >
                        <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${elixirEnabled ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                    {elixirEnabled && (
                      <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold mb-1">初期所持数</p>
                            <input type="number" value={elixirInitialCount} onChange={e => setElixirInitialCount(e.target.value === "" ? 0 : Number(e.target.value))} className="w-full bg-slate-800 text-xs p-2 rounded-xl border border-slate-700 text-white outline-none focus:border-emerald-500"/>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold mb-1">1Ver(42日)の獲得数</p>
                            <input type="number" value={elixirPerVersion} onChange={e => setElixirPerVersion(e.target.value === "" ? 0 : Number(e.target.value))} className="w-full bg-slate-800 text-xs p-2 rounded-xl border border-slate-700 text-white outline-none focus:border-emerald-500"/>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold mb-1">使用部位 (消費コスト)</p>
                            <select value={elixirTargetPart} onChange={e => setElixirTargetPart(e.target.value)} className="w-full bg-slate-800 text-xs p-2 rounded-xl border border-slate-700 text-white outline-none focus:border-emerald-500">
                              <option value="生の花">生の花 (1)</option>
                              <option value="死の羽">死の羽 (1)</option>
                              <option value="時の砂">時の砂 (2)</option>
                              <option value="空の杯">空の杯 (4)</option>
                              <option value="理の冠">理の冠 (3)</option>
                            </select>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold mb-1">セット</p>
                            <select value={elixirTargetSet} onChange={e => setElixirTargetSet(e.target.value)} className="w-full bg-slate-800 text-xs p-2 rounded-xl border border-slate-700 text-white outline-none focus:border-emerald-500">
                              {targetSets.filter(s => s && s !== "未選択").map(s => <option key={s} value={s}>{s}</option>)}
                              {targetSets.filter(s => s && s !== "未選択").length === 0 && <option value="">ダンジョン設定を反映</option>}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold mb-1">メイン</p>
                            <select value={elixirTargetMain} onChange={e => setElixirTargetMain(e.target.value)} className="w-full bg-slate-800 text-[10px] p-2 rounded-xl border border-slate-700 text-white outline-none focus:border-emerald-500">
                              {Object.keys(MAIN_PROBS["genshin"]?.[elixirTargetPart] || {}).map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold mb-1">サブ1</p>
                            <select value={elixirSub1} onChange={e => setElixirSub1(e.target.value)} className="w-full bg-slate-800 text-[10px] p-2 rounded-xl border border-slate-700 text-white outline-none focus:border-emerald-500">
                              {config.subStats.filter(s => s !== "未選択").map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold mb-1">サブ2</p>
                            <select value={elixirSub2} onChange={e => setElixirSub2(e.target.value)} className="w-full bg-slate-800 text-[10px] p-2 rounded-xl border border-slate-700 text-white outline-none focus:border-emerald-500">
                              {config.subStats.filter(s => s !== "未選択").map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        </div>
                        <p className="text-[9px] text-emerald-500/70 italic">※初期4オプ率は50%でシミュレートされます</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Strongbox Toggle */}
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-yellow-900/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-yellow-400 flex items-center gap-2">♻️ 聖遺物廻聖を利用する</label>
                      <p className="text-[10px] text-slate-500 mt-1">※3個につき1個生成。初期4オプ率50%。「大本命」のセットが固定で排出されます</p>
                    </div>
                    <button 
                      onClick={() => setUseStrongbox(!useStrongbox)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${useStrongbox ? 'bg-yellow-500' : 'bg-slate-700'}`}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${useStrongbox ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                </div>


                {simMode !== "upgrade" && (
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
                {simMode === "upgrade" && (
                  <button 
                    onClick={() => handleSimulate()} 
                    disabled={isSimulating}
                    className={`w-full py-4 rounded-2xl font-black text-sm shadow-2xl transition-all ${
                      isSimulating 
                        ? 'bg-slate-800 text-slate-600' 
                        : `bg-gradient-to-r ${config.gradient} text-white hover:scale-[1.02] active:scale-[0.98]`
                    }`}
                  >
                    {isSimulating ? 'SIMULATING...' : 'RUN UPGRADE DIAGNOSIS'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-8">
            <div ref={cardRef} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 min-h-[600px] flex flex-col items-center justify-center relative overflow-hidden">
              {simMode === "upgrade" && result && result.type === "upgrade" && upgradeResult ? (
                <div className="w-full space-y-12 animate-in fade-in duration-500">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Upgrade Probability</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-[0.3em]">{days}日間の厳選による更新期待度</p>
                  </div>

                  <div className="bg-slate-950/50 p-10 rounded-[50px] border border-slate-800 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-4">Overall Build Improvement Chance</p>
                    <p className="text-8xl font-black text-white tracking-tighter mb-4">
                      {(upgradeResult.overallProb || 0).toFixed(1)}<span className="text-2xl text-slate-500">%</span>
                    </p>
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-blue-500/10 text-blue-400 text-sm font-black">
                      <Target size={16} />
                      <span>{(upgradeResult.trials || 0)}回のシミュレーション結果</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(upgradeResult.slotResults || []).map((res: any) => (
                      <div key={res.slot} className="bg-slate-900/50 p-6 rounded-[32px] border border-slate-800 hover:border-blue-500/30 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest truncate">{res.slot}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${(res.prob || 0) > 20 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                            {(res.prob || 0) > 20 ? '狙い目' : '難関'}
                          </span>
                        </div>
                        <p className="text-4xl font-black text-white tracking-tighter mb-2">{(res.prob || 0).toFixed(1)}%</p>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800/50">
                          <span className="text-[9px] text-slate-600 font-bold uppercase">Expected Gain</span>
                          <span className="text-xs font-black text-blue-400">+{(res.avgIncrease || 0).toFixed(1)} pt</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-[32px] flex items-start gap-4">
                    <MessageSquare className="text-blue-400 shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-bold text-blue-300">シミュレーターのアドバイス</p>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        最も更新確率が高いのは <span className="text-white font-bold">{upgradeResult.slotResults[0]?.slot || "不明"}</span> です。
                        {(upgradeResult.slotResults[0]?.prob || 0) < 5 ? " 現在の聖遺物が既に非常に強力なため、これ以上の更新は極めて困難です。" : " まずはここを重点的に狙うのが効率的です。"}
                        全体の期待値としては、{days}日間で合計 <span className="text-white font-bold">{(upgradeResult.slotResults?.reduce((a:any,b:any)=>a+(b.avgIncrease||0)*(b.prob||0)/100, 0) || 0).toFixed(1)}pt</span> のスコアアップが見込まれます。
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  {!result && !isSimulating && (
                    <div className="text-center space-y-4 opacity-50 py-20">
                      <div className="text-8xl">🎲</div>
                      <p className="text-xl font-bold">条件を入力して実行してください</p>
                    </div>
                  )}

                  {isSimulating && (
                    <div className="flex flex-col items-center gap-6 w-full max-w-md py-10">
                      <div className={`w-16 h-16 border-4 border-t-transparent rounded-full animate-spin border-blue-500`}></div>
                      <div className="w-full space-y-2 text-center">
                        <p className="font-bold text-lg animate-pulse">確率の海を探索中... {simProgress}%</p>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                          <div 
                            className={`h-full bg-gradient-to-r ${config.gradient} transition-all duration-300`} 
                            style={{ width: `${simProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Running 500 trials</p>
                      </div>

                      {latestGodPiece && (
                        <div className="mt-2 p-4 bg-yellow-500/10 border border-yellow-500/40 rounded-2xl w-full text-center animate-in zoom-in slide-in-from-bottom-4 duration-300 shadow-[0_0_40px_rgba(234,179,8,0.15)] relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/10 to-transparent"></div>
                          <p className="text-xs text-yellow-400 font-bold mb-1 relative z-10">✨ 神聖遺物ドロップ！ ✨</p>
                          <p className="text-2xl font-black text-white relative z-10 drop-shadow-md">{latestGodPiece.score.toFixed(1)} <span className="text-[10px] text-slate-400">pt</span></p>
                          <p className="text-[10px] font-bold text-slate-300 mt-1 relative z-10 truncate">{latestGodPiece.setName}</p>
                          <p className="text-[9px] text-slate-400 relative z-10">{latestGodPiece.part} / {latestGodPiece.main}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {result && !isSimulating && (
                    <div className="w-full space-y-8 animate-in zoom-in-95 duration-300">
                      <div className="bg-slate-900/30 p-6 rounded-[32px] border border-slate-800 mb-8">
                        <div className="flex justify-between items-center mb-6">
                          <div>
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <Zap size={14} className="text-blue-400" /> Luck Distribution Slider
                            </h3>
                            <p className="text-[10px] text-slate-500 mt-1">スライダーを動かして運勢ごとの結果を確認</p>
                          </div>
                          <div className={`px-4 py-1.5 rounded-full text-xs font-black shadow-lg ${luckPercentile <= 25 ? 'bg-emerald-600 text-white shadow-emerald-500/20' : luckPercentile <= 50 ? 'bg-blue-600 text-white shadow-blue-500/20' : 'bg-rose-600 text-white shadow-rose-500/20'}`}>
                            上位 {luckPercentile}% の運勢
                          </div>
                        </div>

                        <div className="relative px-2 pt-8 pb-4">
                          <input 
                            type="range" min="10" max="90" step="1" 
                            value={luckPercentile} 
                            onChange={e => setLuckPercentile(Number(e.target.value))}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                          <div className="absolute top-0 left-0 right-0 h-8 text-[9px] font-bold text-slate-600">
                            <span className="absolute left-0 -translate-x-1/2 flex flex-col items-center">豪運<span>(10%)</span></span>
                            <span className="absolute left-[18.75%] -translate-x-1/2 flex flex-col items-center text-emerald-500">現実的目標<span>(25%)</span></span>
                            <span className="absolute left-[50%] -translate-x-1/2 flex flex-col items-center">中央値<span>(50%)</span></span>
                            <span className="absolute left-[81.25%] -translate-x-1/2 flex flex-col items-center text-rose-400">下位25%<span>(75%)</span></span>
                            <span className="absolute left-[100%] -translate-x-1/2 flex flex-col items-center">悲運<span>(90%)</span></span>
                          </div>
                          {/* Markers */}
                          <div className="absolute top-8 left-[18.75%] w-0.5 h-4 bg-emerald-500/50 -translate-x-1/2"></div>
                          <div className="absolute top-8 left-[81.25%] w-0.5 h-4 bg-rose-500/50 -translate-x-1/2"></div>
                        </div>
                      </div>

                      {result.type === "target" && (
                        <div className="space-y-6">
                          <h3 className="text-center text-xl font-bold flex items-center justify-center gap-3">
                            目標スコア <span className={`px-4 py-1 rounded-full bg-gradient-to-r ${config.gradient} text-white`}>{targetScore}</span> 到達までの日数
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[40px] text-center relative overflow-hidden group">
                              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Standard Expectation</p>
                              <p className="text-6xl font-black text-white tracking-tighter">{result.median} <span className="text-xl font-bold text-slate-600 uppercase">Days</span></p>
                              <p className="text-xs text-slate-400 mt-3 font-medium italic">平均的な運勢（中央値）</p>
                            </div>

                            {(() => {
                              const staminaCost = gameId === "genshin" ? 20 : 40;
                              const currentLuckRes = sortedResults[Math.floor((luckPercentile / 100) * (sortedResults.length - 1))];
                              const currentDays = Math.ceil((currentLuckRes?.attempts * staminaCost) / staminaPerDay);
                              const isProfit = currentDays < result.median;
                              const diffPercent = Math.abs((1 - currentDays / result.median) * 100).toFixed(1);

                              return (
                                <div className={`p-8 rounded-[40px] border-2 transition-all duration-500 text-center relative overflow-hidden ${
                                  luckPercentile <= 25 ? "bg-emerald-500/5 border-emerald-500/30 shadow-lg shadow-emerald-500/5" :
                                  luckPercentile <= 50 ? "bg-blue-500/5 border-blue-500/30 shadow-lg shadow-blue-500/5" :
                                  "bg-rose-500/5 border-rose-500/30 shadow-lg shadow-rose-500/5"
                                }`}>
                                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${luckPercentile <= 50 ? "text-emerald-400" : "text-rose-400"}`}>
                                    {luckPercentile}% Luck Outcome
                                  </p>
                                  <p className="text-6xl font-black text-white tracking-tighter mb-2">{currentDays} <span className="text-xl font-bold text-slate-600 uppercase">Days</span></p>
                                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black ${isProfit ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                                    {isProfit ? <Zap size={14} fill="currentColor" /> : <Shield size={14} fill="currentColor" />}
                                    <span>樹脂 {diffPercent}% {isProfit ? "お得 (早まる)" : "の損 (沼る)"}</span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      )}

                      {result.type === "period" && (
                        <div className="space-y-12">
                          <div className="text-center space-y-4">
                            <h3 className="text-3xl font-black text-white tracking-tighter uppercase">{days}日間の厳選期待値</h3>
                            {(() => {
                              const currentLuckRes = sortedResults[Math.floor((luckPercentile / 100) * (sortedResults.length - 1))];
                              const currentScore = currentLuckRes?.score || 0;
                              const isHigher = currentScore > (result.median || 0);
                              const diffPercent = result.median ? Math.abs((currentScore / result.median - 1) * 100).toFixed(1) : "0.0";

                              return (
                                <div className="space-y-8">
                                  <div className="bg-slate-900/50 p-8 rounded-[40px] border border-slate-800 shadow-xl max-w-2xl mx-auto">
                                    <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${luckPercentile <= 50 ? "text-emerald-400" : "text-rose-400"}`}>
                                      {luckPercentile}% Luck Result
                                    </p>
                                    <p className="text-7xl font-black text-white tracking-tighter mb-4">
                                      {currentScore.toFixed(1)} <span className="text-xl font-bold text-slate-600 uppercase">Score</span>
                                    </p>
                                    <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-sm font-black ${isHigher ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                                      {isHigher ? <Zap size={16} fill="currentColor" /> : <Shield size={16} fill="currentColor" />}
                                      <span>期待値より {diffPercent}% {isHigher ? "高いスコア" : "低いスコア"}</span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {Object.entries(currentLuckRes?.pieces || {}).map(([slot, art]: [string, any]) => (
                                      <div key={slot} className="bg-slate-900/40 border border-slate-800 p-4 rounded-3xl group hover:border-blue-500/30 transition-all">
                                        <p className="text-[9px] text-slate-500 font-black uppercase mb-2 truncate">{slot}</p>
                                        {art ? (
                                          <div className="space-y-1">
                                            <p className="text-sm font-black text-white">{(art.score || 0).toFixed(1)} <span className="text-[10px] text-slate-500">pt</span></p>
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
                              );
                            })()}
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


                      {allGodPieces.length > 0 && (
                        <div className="w-full max-w-4xl mx-auto mt-8 bg-yellow-500/5 border border-yellow-500/20 rounded-3xl p-6">
                          <h4 className="text-sm font-bold text-yellow-500 flex items-center gap-2 mb-4">✨ 🏆 並行世界でドロップした奇跡の神聖遺物 (スコア58以上)</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                            {allGodPieces.map((art, idx) => (
                              <div key={idx} className="bg-slate-900/80 border border-yellow-500/30 p-3 rounded-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <p className="text-[10px] text-yellow-500 font-bold mb-1 truncate">{art.setName}</p>
                                <p className="text-xl font-black text-white">{art.score.toFixed(1)} <span className="text-[9px] text-slate-500">pt</span></p>
                                <p className="text-[9px] text-slate-400 mt-1">{art.part}</p>
                                <p className="text-[9px] text-slate-400 truncate">{art.main}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {result && result.pieces && Object.keys(getActiveSets(result.pieces)).length > 0 && (
                        <div className="w-full max-w-4xl mx-auto mt-8 bg-slate-800/20 border border-slate-700/50 rounded-3xl p-6">
                          <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-4"><Sword size={16} className="text-emerald-400" /> 発動中のセット効果</h4>
                          <div className="space-y-3">
                            {Object.entries(getActiveSets(result.pieces)).map(([setName, count]) => {
                              const text = SET_EFFECTS_TEXT[setName];
                              if (!text && count < 2) return null;
                              return (
                                <div key={setName} className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                                  <p className="text-sm font-black text-emerald-400 mb-2">{setName} <span className="text-xs font-normal text-slate-500 ml-2">({count}セット装備)</span></p>
                                  {count >= 2 && text?.["2pc"] && <p className="text-xs text-slate-300 mb-1"><span className="inline-block bg-slate-800 px-2 py-0.5 rounded text-slate-400 mr-2">2セット</span>{text["2pc"]}</p>}
                                  {count >= 4 && text?.["4pc"] && <p className="text-xs text-slate-300"><span className="inline-block bg-slate-800 px-2 py-0.5 rounded text-slate-400 mr-2">4セット</span>{text["4pc"]}</p>}
                                  {count >= 2 && !text && <p className="text-xs text-slate-500 italic">※セット効果の詳細は準備中です</p>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="mt-20 pb-12 border-t border-slate-800/50 pt-12 text-center">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <Link href="/blog/how-to-use" className="hover:text-emerald-400 transition-colors">使い方ガイド</Link>
            <Link href="/blog/artifact-probability" className="hover:text-emerald-400 transition-colors">厳選の沼を数値で見る</Link>
            <Link href="/blog/artifact-score-guide" className="hover:text-emerald-400 transition-colors">聖遺物スコアとは？</Link>
            <Link href="/blog/furina-artifact-guide" className="hover:text-emerald-400 transition-colors">フリーナ厳選ガイド</Link>
            <Link href="/blog/talent-vs-artifact" className="hover:text-emerald-400 transition-colors">天賦か聖遺物か</Link>
            <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
            <a href="https://github.com/bonta9puri-commits/artifact-sim-web/" target="_blank" rel="noopener" className="hover:text-white transition-colors">GitHub</a>
            <a href="https://x.com/pouwa06" target="_blank" rel="noopener" className="hover:text-sky-400 transition-colors">Twitter (X)</a>
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

      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-slate-950/80 backdrop-blur-xl border-t border-white/10 z-40 flex gap-3 animate-in fade-in slide-in-from-bottom duration-500">
        <button 
          onClick={() => setIsMobileSettingsOpen(true)}
          className="w-16 h-14 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center text-slate-400 active:scale-90 transition-all shadow-xl"
        >
          <LayoutGrid size={24} />
        </button>
        <button 
          onClick={() => {
            handleSimulate();
            setIsMobileSettingsOpen(false);
          }} 
          disabled={isSimulating}
          className={`flex-1 h-14 rounded-2xl font-black text-sm shadow-2xl transition-all flex items-center justify-center gap-3 ${
            isSimulating 
              ? 'bg-slate-800 text-slate-600' 
              : `bg-gradient-to-r ${config.gradient} text-white active:scale-[0.98] shadow-lg shadow-blue-500/20`
          }`}
        >
          {isSimulating ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white" />
          ) : (
            <Zap size={20} className="fill-current" />
          )}
          {isSimulating ? 'SIMULATING...' : 'RUN SIMULATION'}
        </button>
      </div>

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
                      className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-[10px] font-bold transition-colors"
                    >
                      復元
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
