"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { GENSHIN_CHARACTERS, GENSHIN_SETS, GENSHIN_SLOTS, GENSHIN_MAIN_STATS, GENSHIN_SUB_STATS } from '@/lib/genshin_data';
import { simulateUntilScore, simulateFixedAttempts, MAIN_PROBS } from '@/lib/simulator';
import { getActiveSets } from '@/lib/set_effects';
import { toPng } from 'html-to-image';
import { Sword, Shield, Zap, Target, Share2, Sparkles, ChevronRight, Flame } from 'lucide-react';

export default function NicoleSpecialPage() {
  const character = GENSHIN_CHARACTERS.find(c => c.name === "ニコ・リヤン")!;
  const [days, setDays] = useState(90);
  const [targetScore, setTargetScore] = useState(240);
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const snsCardRef = useRef<HTMLDivElement>(null);

  // Defaults for Nicole
  const initialWeights = character.defaults?.weights || {};
  const [scoreWeights, setScoreWeights] = useState(initialWeights);
  const [mainStats, setMainStats] = useState(character.defaults?.mainStats || {});
  const [targetSets, setTargetSets] = useState(character.defaults?.targetSets || []);

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const simResult = simulateUntilScore(
        "genshin",
        targetScore,
        scoreWeights,
        GENSHIN_SUB_STATS, // subPool
        false, // useRecycle
        mainStats,
        targetSets,
        null // elixirConfig
      );
      
      setResult({
        ...simResult,
        type: "target",
        characterName: character.name
      });
      setIsSimulating(false);
    }, 800);
  };

  const downloadImage = async () => {
    if (!snsCardRef.current) return;
    try {
      const dataUrl = await toPng(snsCardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `nicole-reiyan-sim.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('oops, something went wrong!', err);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-slate-200 overflow-x-hidden font-sans selection:bg-orange-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-orange-600/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="text-center mb-24 space-y-6 animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            <Sparkles size={12} className="animate-spin-slow" /> New Character Special Report
          </div>
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white leading-none">
            NICOLE <span className="text-orange-500">REIYAN</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 font-medium tracking-wide max-w-2xl mx-auto">
            魔導の導き手 - 炎元素シールドサポーターの頂点へ。<br/>
            彼女の力を最大限に引き出す、聖遺物厳選の極意。
          </p>
          <div className="flex justify-center gap-4 pt-8">
             <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center mb-2 text-orange-500 shadow-2xl">
                  <Flame size={32} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pyro</span>
             </div>
             <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center mb-2 text-blue-400 shadow-2xl">
                  <Zap size={32} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Support</span>
             </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
          <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[40px] p-10 hover:border-orange-500/30 transition-all group">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3 italic">
              <Sword className="text-orange-500" /> ATK Scaling Supporter
            </h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              ニコ・リヤンのシールド量と攻撃力バフは、彼女自身の「攻撃力」に依存します。
              ベネットと異なり「基礎攻撃力」だけでなく「聖遺物の攻撃力%」も参照するため、厳選の価値が極めて高いキャラクターです。
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-widest">Priority 1</p>
                <p className="text-lg font-black text-white">攻撃力%</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-widest">Priority 2</p>
                <p className="text-lg font-black text-white">元チャ効率</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[40px] p-10 hover:border-blue-500/30 transition-all group">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3 italic">
              <Shield className="text-blue-500" /> Best-in-Slot Build
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-white/5">
                <span className="text-xs text-slate-400">推奨セット</span>
                <span className="text-sm font-black text-orange-400">旧貴族のしつけ 4セット</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-white/5">
                <span className="text-xs text-slate-400">推奨砂</span>
                <span className="text-sm font-black text-white">元素チャージ効率</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-white/5">
                <span className="text-xs text-slate-400">推奨杯/冠</span>
                <span className="text-sm font-black text-white">攻撃力% / 攻撃力%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Simulation Section */}
        <div id="simulate" className="max-w-4xl mx-auto space-y-12">
          <div className="text-center">
            <h3 className="text-4xl font-black text-white mb-4 italic tracking-tighter">ARTIFACT SIMULATOR</h3>
            <p className="text-slate-500 text-sm font-medium tracking-[0.2em] uppercase">目標達成までの道のりを数値で証明する</p>
          </div>

          <div className="bg-slate-900/20 border border-white/5 rounded-[50px] p-8 md:p-12 backdrop-blur-3xl shadow-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-4">目標スコアを設定</label>
                  <input 
                    type="range" min="150" max="300" step="10" 
                    value={targetScore} onChange={e => setTargetScore(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-orange-500"
                  />
                  <div className="flex justify-between mt-4">
                    <span className="text-xs font-bold text-slate-600">Standard</span>
                    <span className="text-3xl font-black text-white tracking-tighter italic">{targetScore} <span className="text-sm text-slate-500">pt</span></span>
                    <span className="text-xs font-bold text-slate-600">Perfect</span>
                  </div>
                </div>

                <button 
                  onClick={handleSimulate}
                  disabled={isSimulating}
                  className="w-full py-6 rounded-3xl bg-gradient-to-r from-orange-600 to-orange-400 text-white font-black text-lg shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSimulating ? "解析中..." : (
                    <>
                      <Zap size={24} />
                      シミュレーション開始
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-950/80 rounded-[40px] border border-white/5 p-8 text-center">
                {result ? (
                   <div className="animate-in fade-in zoom-in duration-500">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">目標達成までの推定日数</p>
                      <p className="text-7xl font-black text-white tracking-tighter italic mb-4">{result.median.toFixed(0)} <span className="text-xl text-slate-500">Days</span></p>
                      <div className="h-1 w-12 bg-orange-500/30 mx-auto mb-6 rounded-full"></div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        上位10%の運があれば <span className="text-emerald-400 font-bold">{result.top10.toFixed(0)}日</span> で到達可能です。
                      </p>
                   </div>
                ) : (
                  <div className="py-12 opacity-30">
                    <Target size={48} className="mx-auto mb-4 text-slate-500" />
                    <p className="text-sm font-bold text-slate-600">結果がここに表示されます</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SNS Card Hidden Area */}
        <div className="fixed -left-[9999px] top-0">
          <div ref={snsCardRef} className="w-[1200px] h-[630px] bg-[#050505] p-20 flex flex-col items-center justify-between relative overflow-hidden">
            {/* Background for Card */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/20 blur-[150px]"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/15 blur-[150px]"></div>
            
            <div className="z-10 w-full flex justify-between items-start">
               <div>
                  <h4 className="text-orange-500 text-sm font-black tracking-[0.5em] uppercase mb-4">Character Special Report</h4>
                  <h1 className="text-9xl font-black text-white italic tracking-tighter leading-none uppercase">NICOLE</h1>
                  <h2 className="text-6xl font-black text-slate-700 italic tracking-tighter -mt-2 uppercase">REIYAN</h2>
               </div>
               <div className="text-right">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Produced by</p>
                  <p className="text-white text-2xl font-black italic tracking-tighter">ARTIFACT-SIM.COM</p>
               </div>
            </div>

            <div className="z-10 w-full grid grid-cols-2 gap-12 items-center">
               <div className="bg-white/5 border border-white/10 rounded-[60px] p-16 flex flex-col items-center shadow-3xl backdrop-blur-2xl">
                  <p className="text-slate-500 text-sm font-black uppercase tracking-[0.3em] mb-4">Estimated Farming Period</p>
                  <p className="text-[160px] font-black text-white leading-none tracking-tighter italic">
                    {result ? result.median.toFixed(0) : "---"} <span className="text-4xl text-slate-600 uppercase">Days</span>
                  </p>
                  <p className="text-orange-500 text-xl font-black mt-4 tracking-widest uppercase">Target Score: {targetScore}pt</p>
               </div>
               <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-slate-900 border border-white/10 rounded-3xl flex items-center justify-center text-orange-500">
                      <Flame size={40} />
                    </div>
                    <div>
                      <p className="text-white text-2xl font-black italic">PYRO SUPPORTER</p>
                      <p className="text-slate-500 text-xs font-bold tracking-widest">ATK REFERENCED SHIELD & BUFF</p>
                    </div>
                  </div>
                  <div className="h-px w-full bg-white/10"></div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <p className="text-[10px] text-slate-600 font-black uppercase mb-1">Luck Top 10%</p>
                        <p className="text-3xl font-black text-emerald-400">{result ? result.top10.toFixed(0) : "---"} Days</p>
                     </div>
                     <div>
                        <p className="text-[10px] text-slate-600 font-black uppercase mb-1">Bottom 10%</p>
                        <p className="text-3xl font-black text-rose-500">{result ? result.bottom10.toFixed(0) : "---"} Days</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        {result && (
          <div className="mt-20 flex justify-center animate-in fade-in slide-in-from-bottom-5 duration-700">
            <button 
              onClick={downloadImage}
              className="px-12 py-5 rounded-full bg-white text-slate-950 font-black text-lg shadow-3xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
            >
              <Share2 size={24} />
              結果をシェアして伝説を始める
            </button>
          </div>
        )}

        <footer className="mt-40 border-t border-white/5 pt-20 text-center space-y-4">
           <Link href="/" className="text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
             ← Back to Main Simulator
           </Link>
           <p className="text-[10px] text-slate-700 font-bold uppercase tracking-[0.2em]">© 2026 ARTIFACT-SIM.COM</p>
        </footer>
      </div>
    </main>
  );
}
