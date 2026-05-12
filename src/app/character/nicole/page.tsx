"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { GENSHIN_CHARACTERS, GENSHIN_SETS, GENSHIN_SLOTS, GENSHIN_MAIN_STATS, GENSHIN_SUB_STATS } from '@/lib/genshin_data';
import { GAME_CONFIGS } from '@/lib/game_data';
import { simulateUntilScore, simulateFixedAttempts, compareRecycleEfficiency, MAIN_PROBS } from '@/lib/simulator';
import { SET_EFFECTS_TEXT, SET_BONUS_STATS, getActiveSets } from '@/lib/set_effects';
import { SET_PAIRS } from '@/lib/set_pairs';
import { toPng } from 'html-to-image';
import { 
  Sword, Shield, Zap, Target, Share2, Sparkles, 
  Flame, Calendar, MessageSquare, ChevronLeft, X, LayoutGrid, Settings2, ChevronDown, ChevronUp
} from 'lucide-react';

export default function NicoleSpecialPage() {
  const gameId = "genshin";
  const config = GAME_CONFIGS[gameId];
  const character = GENSHIN_CHARACTERS.find(c => c.name === "ニコ・リヤン")!;
  
  const [simMode, setSimMode] = useState<"target" | "period" | "rank" | "upgrade">("target");
  const [targetScore, setTargetScore] = useState(160);
  const [days, setDays] = useState(90);
  const [staminaPerDay, setStaminaPerDay] = useState(180);
  
  // Nicole Defaults & State
  const [scoreWeights, setScoreWeights] = useState(character.defaults?.weights || { "会心率": 2.0, "会心ダメージ": 1.0, "攻撃力%": 1.0 });
  const [mainStats, setMainStats] = useState(character.defaults?.mainStats || { "時の砂": "攻撃力%", "空の杯": "炎元素ダメージ", "理の冠": "会心率" });
  const [targetSets, setTargetSets] = useState(character.defaults?.targetSets || ["旧貴族のしつけ", "千岩牢固", "", ""]);
  const [userPartScores, setUserPartScores] = useState<Record<string, number>>({});
  
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [upgradeResult, setUpgradeResult] = useState<any>(null);
  const [allGodPieces, setAllGodPieces] = useState<any[]>([]);
  
  const cardRef = useRef<HTMLDivElement>(null);

  // Initialize for Upgrade Mode
  useEffect(() => {
    const initial: any = {};
    config.slots.forEach(s => { if(s !== "未選択") initial[s] = 35; });
    setUserPartScores(initial);
  }, []);

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      let simResult: any;
      let godPieces: any[] = [];

      if (simMode === "target") {
        const trials = 500;
        const results = [];
        for (let i = 0; i < trials; i++) {
          const res = simulateUntilScore(gameId, targetScore, scoreWeights, GENSHIN_SUB_STATS, false, mainStats, targetSets, null);
          results.push(res);
          if (res.godPieces && res.godPieces.length > 0) godPieces.push(...res.godPieces);
        }
        results.sort((a, b) => a.attempts - b.attempts);
        const medianRes = results[Math.floor(trials / 2)];
        const top10Res = results[Math.floor(trials * 0.1)];
        const bottom10Res = results[Math.floor(trials * 0.9)];
        
        simResult = {
          type: "target",
          median: Math.ceil((medianRes.attempts * 20) / staminaPerDay),
          top10: Math.ceil((top10Res.attempts * 20) / staminaPerDay),
          bottom10: Math.ceil((bottom10Res.attempts * 20) / staminaPerDay),
          pieces: medianRes.pieces
        };
      } else if (simMode === "period") {
        const totalAttempts = Math.floor(days * (staminaPerDay / 20));
        const trials = 1000;
        const results = [];
        for (let i = 0; i < trials; i++) {
          const r = simulateFixedAttempts(gameId, totalAttempts, staminaPerDay, scoreWeights, GENSHIN_SUB_STATS, false, mainStats, targetSets, null);
          results.push(r);
        }
        results.sort((a, b) => a.score - b.score);
        simResult = {
          type: "period",
          median: results[Math.floor(trials * 0.5)].score,
          top10: results[Math.floor(trials * 0.9)].score,
          bottom10: results[Math.floor(trials * 0.1)].score,
          pieces: results[Math.floor(trials * 0.5)].pieces,
          allResults: results
        };
        godPieces = results[Math.floor(trials * 0.5)].godPieces;
      } else if (simMode === "rank") {
        const totalAttempts = Math.floor(days * (staminaPerDay / 20));
        const userTotal = Object.values(userPartScores).reduce((a, b) => a + b, 0);
        const trials = 1000;
        let winCount = 0;
        for (let i = 0; i < trials; i++) {
          const r = simulateFixedAttempts(gameId, totalAttempts, staminaPerDay, scoreWeights, GENSHIN_SUB_STATS, false, mainStats, targetSets, null);
          if (r.score > userTotal) winCount++;
        }
        simResult = { type: "rank", winRate: (winCount / trials) * 100, userTotal };
      } else if (simMode === "upgrade") {
        const totalAttempts = Math.floor(days * (staminaPerDay / 20));
        const trials = 500;
        let overallUpgrades = 0;
        const partUpgrades: any = {};
        config.slots.forEach(s => { if(s !== "未選択") partUpgrades[s] = 0; });

        for (let i = 0; i < trials; i++) {
          const r = simulateFixedAttempts(gameId, totalAttempts, staminaPerDay, scoreWeights, GENSHIN_SUB_STATS, false, mainStats, targetSets, null);
          let improved = false;
          Object.entries(r.pieces).forEach(([slot, art]: [string, any]) => {
            if (art && art.score > (userPartScores[slot] || 0)) {
              partUpgrades[slot]++;
              improved = true;
            }
          });
          if (improved) overallUpgrades++;
        }
        
        const upgradeData = {
          overallProb: (overallUpgrades / trials) * 100,
          parts: Object.fromEntries(Object.entries(partUpgrades).map(([s, c]) => [s, (Number(c) / trials) * 100]))
        };
        setUpgradeResult(upgradeData);
        simResult = { type: "upgrade" };
      }

      setResult(simResult);
      if (godPieces.length > 0) setAllGodPieces(godPieces.slice(0, 5));
      setIsSimulating(false);
    }, 800);
  };

  const downloadImage = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `nicole-sim-${simMode}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('image generation failed', err);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-slate-200 overflow-x-hidden font-sans selection:bg-orange-500/30 pb-20">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-orange-600/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-12">
           <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest group">
             <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Multi-Sim
           </Link>
           <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-[0.3em]">
             <Sparkles size={12} className="animate-spin-slow" /> Official Special Edition
           </div>
        </div>

        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white leading-none mb-4">
            NICOLE <span className="text-orange-500 uppercase">Reiyan</span>
          </h1>
          <p className="text-slate-400 font-medium tracking-wide italic">Guide of Magic - 特別解析システム</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Settings Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900/60 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl shadow-2xl">
              <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2 italic">
                <LayoutGrid size={20} className="text-orange-500" /> 設定パネル
              </h2>
              
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                   {[
                     { id: "target", label: "🎯 目標スコア診断", icon: Target },
                     { id: "period", label: "⏳ 期間シミュ", icon: Calendar },
                     { id: "rank", label: "🏆 ランク診断", icon: MessageSquare },
                     { id: "upgrade", label: "📈 更新確率診断", icon: Zap }
                   ].map(m => (
                     <button 
                       key={m.id}
                       onClick={() => setSimMode(m.id as any)}
                       className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition-all ${simMode === m.id ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-800/50 text-slate-500 hover:bg-slate-800'}`}
                     >
                       <m.icon size={14} />
                       {m.label}
                     </button>
                   ))}
                </div>

                <div className="h-px bg-white/5"></div>

                {/* Sub Settings based on Mode */}
                {simMode === "target" && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">目標スコア</label>
                    <input 
                      type="number" value={targetScore} onChange={e => setTargetScore(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-white font-black outline-none focus:border-orange-500 transition-all"
                    />
                  </div>
                )}

                {simMode !== "target" && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">厳選日数</label>
                    <input 
                      type="number" value={days} onChange={e => setDays(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-white font-black outline-none focus:border-orange-500 transition-all"
                    />
                  </div>
                )}

                {(simMode === "rank" || simMode === "upgrade") && (
                   <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">現在の部位別スコア</label>
                      <div className="grid grid-cols-2 gap-2">
                        {config.slots.filter(s => s !== "未選択").map(slot => (
                          <div key={slot} className="bg-slate-950/50 p-2 rounded-xl border border-white/5">
                            <p className="text-[8px] text-slate-600 font-bold mb-1 truncate">{slot}</p>
                            <input 
                              type="number" value={userPartScores[slot] || 0} 
                              onChange={e => setUserPartScores({...userPartScores, [slot]: Number(e.target.value)})}
                              className="w-full bg-transparent text-xs font-black text-white outline-none"
                            />
                          </div>
                        ))}
                      </div>
                   </div>
                )}

                {/* Advanced Settings Toggle */}
                <div className="pt-4">
                  <button 
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-orange-500 transition-colors"
                  >
                    <span className="flex items-center gap-2"><Settings2 size={12} /> 詳細設定 (ウェイト・セット)</span>
                    {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  
                  {showAdvanced && (
                    <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                       <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                         <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3">サブステータスの重み</label>
                         <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                           {GENSHIN_SUB_STATS.filter(s => s !== "未選択").map(sub => (
                             <div key={sub} className="space-y-1">
                               <label className="text-[8px] text-slate-500 uppercase">{sub}</label>
                               <input 
                                 type="number" step="0.1"
                                 value={scoreWeights[sub] || 0} 
                                 onChange={e => setScoreWeights({...scoreWeights, [sub]: Number(e.target.value)})}
                                 className="w-full bg-slate-900 text-xs p-1.5 rounded border border-white/5 text-white outline-none"
                               />
                             </div>
                           ))}
                         </div>
                       </div>

                       <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                          <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3">メインステータス</label>
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {config.slots.filter(s => !s.includes("花") && !s.includes("羽") && s !== "未選択").map(slot => (
                              <div key={slot} className="flex items-center justify-between gap-4">
                                <span className="text-[9px] text-slate-500 uppercase">{slot}</span>
                                <select 
                                  value={mainStats[slot] || ""} 
                                  onChange={e => setMainStats({...mainStats, [slot]: e.target.value})}
                                  className="bg-slate-900 text-[10px] p-1.5 rounded border border-white/5 text-white outline-none flex-1"
                                >
                                  {Object.keys(MAIN_PROBS[gameId][slot] || {}).map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                              </div>
                            ))}
                          </div>
                       </div>

                       <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                          <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3">狙いのセット</label>
                          <div className="grid grid-cols-2 gap-2">
                             {targetSets.map((s, i) => (
                               <select 
                                 key={i} value={s} 
                                 onChange={e => {
                                   const next = [...targetSets];
                                   next[i] = e.target.value;
                                   setTargetSets(next);
                                 }}
                                 className="bg-slate-900 text-[9px] p-2 rounded border border-white/5 text-white outline-none"
                               >
                                 <option value="">未選択</option>
                                 {GENSHIN_SETS.map(set => <option key={set} value={set}>{set}</option>)}
                               </select>
                             ))}
                          </div>
                       </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleSimulate}
                  disabled={isSimulating}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-400 text-white font-black text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSimulating ? "RUNNING..." : "シミュレーション開始"}
                </button>
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-8">
            <div ref={cardRef} className="bg-slate-900/40 border border-white/5 rounded-[40px] p-8 md:p-12 min-h-[600px] flex flex-col items-center relative overflow-hidden backdrop-blur-3xl shadow-3xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 blur-[80px] rounded-full"></div>
              
              {!result && !isSimulating && (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                  <Flame size={64} className="text-slate-700 mb-6" />
                  <p className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">Ready for Analysis</p>
                </div>
              )}

              {isSimulating && (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 rounded-full border-4 border-white/5"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
                    <Flame size={32} className="absolute inset-0 m-auto text-orange-500 animate-pulse" />
                  </div>
                  <p className="mt-8 text-xs font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Processing Parallel Worlds</p>
                </div>
              )}

              {result && !isSimulating && (
                <div className="w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
                  {/* Mode-Specific Display */}
                  {result.type === "target" && (
                    <div className="text-center space-y-6">
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Target Achievement Estimation</p>
                        <h3 className="text-7xl md:text-9xl font-black text-white italic tracking-tighter">
                          {result.median.toFixed(0)} <span className="text-2xl text-slate-600 uppercase italic">Days</span>
                        </h3>
                      </div>
                      <div className="flex justify-center gap-12">
                         <div className="text-center">
                            <p className="text-[9px] text-slate-500 font-bold mb-1 uppercase">Top 10% Luck</p>
                            <p className="text-2xl font-black text-emerald-400 italic">{result.top10.toFixed(0)}d</p>
                         </div>
                         <div className="text-center border-l border-white/10 pl-12">
                            <p className="text-[9px] text-slate-500 font-bold mb-1 uppercase">Bottom 10%</p>
                            <p className="text-2xl font-black text-rose-500 italic">{result.bottom10.toFixed(0)}d</p>
                         </div>
                      </div>
                    </div>
                  )}

                  {result.type === "period" && (
                    <div className="text-center space-y-6">
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Expected Score in {days} Days</p>
                        <h3 className="text-7xl md:text-9xl font-black text-white italic tracking-tighter">
                          {result.median.toFixed(1)} <span className="text-2xl text-slate-600 uppercase italic">pt</span>
                        </h3>
                      </div>
                      <div className="flex justify-center gap-12">
                         <div className="text-center">
                            <p className="text-[9px] text-slate-500 font-bold mb-1 uppercase">Max Potential</p>
                            <p className="text-2xl font-black text-emerald-400 italic">{result.top10.toFixed(1)}pt</p>
                         </div>
                         <div className="text-center border-l border-white/10 pl-12">
                            <p className="text-[9px] text-slate-500 font-bold mb-1 uppercase">Min Result</p>
                            <p className="text-2xl font-black text-rose-500 italic">{result.bottom10.toFixed(1)}pt</p>
                         </div>
                      </div>
                    </div>
                  )}

                  {result.type === "rank" && (
                    <div className="text-center space-y-8">
                       <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Probability of Surpassing Current Score</p>
                       <div className="relative inline-block">
                          <svg className="w-48 h-48 -rotate-90">
                            <circle cx="96" cy="96" r="80" fill="none" stroke="currentColor" strokeWidth="12" className="text-white/5" />
                            <circle cx="96" cy="96" r="80" fill="none" stroke="currentColor" strokeWidth="12" strokeDasharray={502} strokeDashoffset={502 - (502 * result.winRate / 100)} className="text-orange-500 transition-all duration-1000" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                             <p className="text-4xl font-black text-white tracking-tighter italic">{result.winRate.toFixed(1)}%</p>
                          </div>
                       </div>
                    </div>
                  )}

                  {result.type === "upgrade" && upgradeResult && (
                    <div className="space-y-8">
                       <div className="text-center">
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mb-2">Overall Upgrade Chance</p>
                          <p className="text-7xl font-black text-white italic tracking-tighter">{upgradeResult.overallProb.toFixed(1)}%</p>
                       </div>
                       <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          {Object.entries(upgradeResult.parts).map(([slot, prob]: [string, any]) => (
                            <div key={slot} className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                               <p className="text-[8px] text-slate-500 font-bold mb-1 truncate">{slot}</p>
                               <p className="text-lg font-black text-white italic">{prob.toFixed(1)}%</p>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}

                  {/* Common Footer in Card */}
                  <div className="pt-12 border-t border-white/5 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-4">
                      <Flame size={16} className="text-orange-500" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Artifact Simulation System</span>
                    </div>
                    {allGodPieces.length > 0 && (
                      <div className="w-full grid grid-cols-5 gap-2">
                         {allGodPieces.map((p, i) => (
                           <div key={i} className="bg-orange-500/5 border border-orange-500/10 p-2 rounded-lg text-center">
                              <p className="text-[8px] text-orange-500 font-black mb-0.5">{p.score.toFixed(1)}pt</p>
                              <p className="text-[6px] text-slate-600 truncate">{p.part}</p>
                           </div>
                         ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {result && (
              <div className="mt-8 flex flex-col md:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <button 
                  onClick={downloadImage}
                  className="px-10 py-4 rounded-full bg-white text-slate-950 font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <Share2 size={18} /> 結果を画像でシェア
                </button>
                <button className="px-10 py-4 rounded-full bg-slate-900 border border-white/10 text-white font-black text-sm hover:bg-slate-800 transition-all">
                  ニコ・リヤンの育成ガイドを見る
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
