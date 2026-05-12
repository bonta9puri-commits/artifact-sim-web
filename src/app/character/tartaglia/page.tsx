"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { GENSHIN_CHARACTERS, GENSHIN_SETS, GENSHIN_SLOTS, GENSHIN_MAIN_STATS, GENSHIN_SUB_STATS } from '@/lib/genshin_data';
import { GAME_CONFIGS } from '@/lib/game_data';
import { simulateUntilScore, simulateFixedAttempts, compareRecycleEfficiency, MAIN_PROBS } from '@/lib/simulator';
import { toPng } from 'html-to-image';
import { 
  Sword, Shield, Zap, Target, Share2, Sparkles, 
  Droplets, Calendar, MessageSquare, ChevronLeft, LayoutGrid, Settings2, ChevronDown, ChevronUp, Waves
} from 'lucide-react';

export default function TartagliaSpecialPage() {
  const gameId = "genshin";
  const config = GAME_CONFIGS[gameId];
  const character = GENSHIN_CHARACTERS.find(c => c.name === "タルタリヤ")!;
  
  const [simMode, setSimMode] = useState<"target" | "period" | "rank" | "upgrade">("target");
  const [targetScore, setTargetScore] = useState(180);
  const [days, setDays] = useState(30);
  const [staminaPerDay, setStaminaPerDay] = useState(180);
  
  // Tartaglia Defaults
  const [scoreWeights, setScoreWeights] = useState(character.defaults?.weights || {});
  const [mainStats, setMainStats] = useState(character.defaults?.mainStats || {});
  const [targetSets, setTargetSets] = useState(character.defaults?.targetSets || ["水仙の夢", "沈淪の心", "", ""]);
  const [userPartScores, setUserPartScores] = useState<Record<string, number>>({});
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [upgradeResult, setUpgradeResult] = useState<any>(null);
  const [allGodPieces, setAllGodPieces] = useState<any[]>([]);
  
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initial: any = {};
    config.slots.forEach(s => { if(s !== "未選択") initial[s] = 30; });
    setUserPartScores(initial);
  }, []);

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      let simResult: any;
      let godPieces: any[] = [];

      if (simMode === "target") {
        const fullSim = simulateUntilScore(gameId, targetScore, scoreWeights, GENSHIN_SUB_STATS, false, mainStats, targetSets, null);
        simResult = { ...fullSim, type: "target" };
        godPieces = fullSim.godPieces;
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
      link.download = `tartaglia-sim-${simMode}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('image generation failed', err);
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden font-sans selection:bg-sky-500/30 pb-20">
      {/* Hydro Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-sky-600/10 blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-900/20 blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 pointer-events-none"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-12">
           <Link href="/" className="flex items-center gap-2 text-sky-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest group">
             <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Hub
           </Link>
           <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-black uppercase tracking-[0.3em]">
             <Droplets size={12} className="animate-bounce" /> Tartaglia Main Exclusive
           </div>
        </div>

        <div className="text-center mb-16 space-y-4">
          <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Fatui Harbinger: Childe</div>
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white leading-none">
            TARTAGLIA <span className="text-sky-500 uppercase">Ajax</span>
          </h1>
          <p className="text-sky-400/60 font-medium tracking-[0.1em] uppercase text-sm">最凶の執行官 - 限界突破厳選システム</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Settings Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900/80 border border-white/5 rounded-[32px] p-8 backdrop-blur-2xl shadow-2xl">
              <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2 italic border-b border-white/5 pb-4">
                <LayoutGrid size={20} className="text-sky-500" /> コマンドパネル
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
                       className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition-all ${simMode === m.id ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/20' : 'bg-slate-800/50 text-slate-500 hover:bg-slate-800'}`}
                     >
                       <m.icon size={14} />
                       {m.label}
                     </button>
                   ))}
                </div>

                {simMode === "target" && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">目標スコア</label>
                    <input 
                      type="number" value={targetScore} onChange={e => setTargetScore(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-white font-black outline-none focus:border-sky-500 transition-all"
                    />
                  </div>
                )}

                {simMode !== "target" && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">厳選日数</label>
                    <input 
                      type="number" value={days} onChange={e => setDays(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-white font-black outline-none focus:border-sky-500 transition-all"
                    />
                  </div>
                )}

                {(simMode === "rank" || simMode === "upgrade") && (
                   <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">現在のパーツスコア</label>
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

                <div className="pt-4 border-t border-white/5">
                  <button 
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-sky-500 transition-colors"
                  >
                    <span className="flex items-center gap-2"><Settings2 size={12} /> 戦術設定 (ウェイト)</span>
                    {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  
                  {showAdvanced && (
                    <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                       <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                         <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3">サブステ優先度</label>
                         <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                           {GENSHIN_SUB_STATS.filter(s => s !== "未選択").map(sub => (
                             <div key={sub} className="space-y-1">
                               <label className="text-[8px] text-slate-500 uppercase">{sub}</label>
                               <input 
                                 type="number" step="0.1"
                                 value={scoreWeights[sub] || 0} 
                                 onChange={e => setScoreWeights({...scoreWeights, [sub]: Number(e.target.value)})}
                                 className="w-full bg-slate-900 text-xs p-1.5 rounded border border-white/5 text-white outline-none focus:border-sky-500"
                               />
                             </div>
                           ))}
                         </div>
                       </div>
                       
                       <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                          <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3">狙いのセット</label>
                          <div className="grid grid-cols-1 gap-2">
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
                  className="w-full py-4 rounded-2xl bg-sky-600 text-white font-black text-sm shadow-xl shadow-sky-900/40 hover:bg-sky-500 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSimulating ? "解析中..." : "作戦開始"}
                </button>
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-8">
            <div ref={cardRef} className="bg-slate-900/60 border border-sky-500/10 rounded-[40px] p-8 md:p-12 min-h-[600px] flex flex-col items-center relative overflow-hidden backdrop-blur-3xl shadow-inner">
              {/* Card BG Decorations */}
              <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-sky-600/10 blur-[100px] rounded-full"></div>
              <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-blue-900/10 blur-[80px] rounded-full"></div>

              {!result && !isSimulating && (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20">
                  <Waves size={80} className="text-sky-500 mb-6 animate-pulse" />
                  <p className="text-xs font-black text-sky-300 uppercase tracking-[0.5em]">System Idle / Waiting for Input</p>
                </div>
              )}

              {isSimulating && (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="relative w-32 h-32">
                    <div className="absolute inset-0 rounded-full border-[8px] border-white/5"></div>
                    <div className="absolute inset-0 rounded-full border-[8px] border-sky-500 border-t-transparent animate-spin"></div>
                    <Zap size={40} className="absolute inset-0 m-auto text-sky-500 animate-pulse" />
                  </div>
                  <p className="mt-10 text-xs font-black text-sky-400 uppercase tracking-[0.4em] animate-pulse italic">Calculating Probabilities...</p>
                </div>
              )}

              {result && !isSimulating && (
                <div className="w-full space-y-12 animate-in fade-in zoom-in-95 duration-700">
                  {/* Mode Display */}
                  {result.type === "target" && (
                    <div className="text-center space-y-8">
                      <div className="space-y-2">
                        <p className="text-[11px] text-sky-500 font-black uppercase tracking-[0.4em]">Target Achievement Period</p>
                        <h3 className="text-8xl md:text-[140px] font-black text-white italic tracking-tighter leading-none">
                          {result.median.toFixed(0)} <span className="text-2xl text-slate-600 uppercase not-italic">Days</span>
                        </h3>
                      </div>
                      <div className="flex justify-center gap-16">
                         <div className="text-center">
                            <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-widest">God Luck (Top 10%)</p>
                            <p className="text-4xl font-black text-sky-400 italic tracking-tighter">{result.top10.toFixed(0)}d</p>
                         </div>
                         <div className="text-center border-l border-white/10 pl-16">
                            <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-widest">Unlucky (Bottom 10%)</p>
                            <p className="text-4xl font-black text-rose-500 italic tracking-tighter">{result.bottom10.toFixed(0)}d</p>
                         </div>
                      </div>
                    </div>
                  )}

                  {result.type === "period" && (
                    <div className="text-center space-y-8">
                      <div className="space-y-2">
                        <p className="text-[11px] text-sky-500 font-black uppercase tracking-[0.4em]">Expected Combat Score ({days}d)</p>
                        <h3 className="text-8xl md:text-[140px] font-black text-white italic tracking-tighter leading-none">
                          {result.median.toFixed(1)} <span className="text-2xl text-slate-600 uppercase not-italic">pt</span>
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-8 max-w-md mx-auto">
                         <div className="bg-sky-500/10 p-4 rounded-3xl border border-sky-500/20">
                            <p className="text-[10px] text-sky-500 font-bold mb-1 uppercase">Max Potential</p>
                            <p className="text-3xl font-black text-white italic">{result.top10.toFixed(1)}pt</p>
                         </div>
                         <div className="bg-slate-900/50 p-4 rounded-3xl border border-white/5">
                            <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase">Minimum</p>
                            <p className="text-3xl font-black text-slate-400 italic">{result.bottom10.toFixed(1)}pt</p>
                         </div>
                      </div>
                    </div>
                  )}

                  {result.type === "rank" && (
                    <div className="text-center space-y-10 py-10">
                       <p className="text-[11px] text-sky-500 font-black uppercase tracking-[0.4em]">Combat Record Superiority</p>
                       <div className="relative inline-block group">
                          <div className="absolute inset-0 bg-sky-500/20 blur-[60px] group-hover:bg-sky-500/40 transition-all rounded-full"></div>
                          <svg className="w-64 h-64 -rotate-90 relative">
                            <circle cx="128" cy="128" r="100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="20" />
                            <circle cx="128" cy="128" r="100" fill="none" stroke="currentColor" strokeWidth="20" strokeDasharray={628} strokeDashoffset={628 - (628 * result.winRate / 100)} className="text-sky-500 transition-all duration-1000 ease-out shadow-sky-500 shadow-2xl" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                             <p className="text-[10px] text-sky-300 font-black uppercase tracking-widest mb-1">Win Rate</p>
                             <p className="text-6xl font-black text-white tracking-tighter italic">{result.winRate.toFixed(1)}%</p>
                          </div>
                       </div>
                    </div>
                  )}

                  {result.type === "upgrade" && upgradeResult && (
                    <div className="space-y-12">
                       <div className="text-center">
                          <p className="text-[11px] text-sky-500 font-black uppercase tracking-[0.4em] mb-4">Total Reinforcement Probability</p>
                          <div className="text-8xl md:text-[120px] font-black text-white italic tracking-tighter leading-none">{upgradeResult.overallProb.toFixed(1)}%</div>
                       </div>
                       <div className="grid grid-cols-5 gap-3">
                          {Object.entries(upgradeResult.parts).map(([slot, prob]: [string, any]) => (
                            <div key={slot} className="bg-sky-900/10 p-4 rounded-3xl border border-sky-500/10 text-center">
                               <p className="text-[8px] text-sky-500/60 font-black mb-2 truncate uppercase">{slot.replace("(固定値)", "")}</p>
                               <p className="text-xl font-black text-white italic">{prob.toFixed(1)}%</p>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}

                  {/* Card Footer */}
                  <div className="pt-12 border-t border-white/5 w-full flex flex-col items-center gap-6">
                    <div className="flex items-center gap-3">
                      <div className="h-px w-8 bg-sky-500/30"></div>
                      <span className="text-[10px] font-black text-sky-600 uppercase tracking-[0.6em]">Fatui Intelligence Bureau</span>
                      <div className="h-px w-8 bg-sky-500/30"></div>
                    </div>
                    {allGodPieces.length > 0 && (
                      <div className="w-full grid grid-cols-5 gap-3">
                         {allGodPieces.map((p, i) => (
                           <div key={i} className="bg-sky-500/5 border border-sky-500/10 p-3 rounded-2xl text-center group hover:bg-sky-500/20 transition-all">
                              <p className="text-[10px] text-sky-400 font-black mb-1 italic">{p.score.toFixed(1)}</p>
                              <p className="text-[8px] text-slate-500 font-bold truncate uppercase">{p.part}</p>
                           </div>
                         ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            {result && (
              <div className="mt-10 flex flex-col md:flex-row justify-center gap-5 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                <button 
                  onClick={downloadImage}
                  className="px-12 py-5 rounded-full bg-white text-slate-950 font-black text-md shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4"
                >
                  <Share2 size={24} className="text-sky-600" />
                  解析結果をシェア
                </button>
                <button className="px-12 py-5 rounded-full bg-slate-900 border border-sky-500/20 text-sky-400 font-black text-md hover:bg-sky-900/40 hover:border-sky-500/50 transition-all flex items-center gap-2">
                  <Sword size={20} />
                  タルタリヤの最適装備を見る
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
