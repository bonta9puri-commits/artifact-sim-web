"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { GENSHIN_CHARACTERS, GENSHIN_SETS, GENSHIN_SLOTS, GENSHIN_MAIN_STATS, GENSHIN_SUB_STATS } from '@/lib/genshin_data';
import { GAME_CONFIGS } from '@/lib/game_data';
import { STAT_IDS } from '@/lib/stats';
import { simulateUntilScore, simulateFixedAttempts, compareRecycleEfficiency, MAIN_PROBS } from '@/lib/simulator';
import { toPng } from 'html-to-image';
import { 
  Sword, Shield, Zap, Target, Share2, Sparkles, 
  Droplets, Calendar, MessageSquare, ChevronLeft, LayoutGrid, Settings2, ChevronDown, ChevronUp, Waves, X
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
  const [sortedResults, setSortedResults] = useState<any[]>([]);
  const [luckPercentile, setLuckPercentile] = useState(25);
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);

  const [lang, setLang] = useState<"ja" | "en">("ja");

  const translations: any = {
    ja: {
      target: "目標スコア診断",
      period: "期間シミュ",
      rank: "ランク診断",
      upgrade: "更新確率診断",
      run: "作戦開始",
      simulating: "解析中...",
      targetScore: "目標スコア",
      days: "厳選日数",
      currentScores: "現在のパーツスコア",
      advanced: "戦術設定 (ウェイト)",
      substats: "サブステ優先度",
      targetSets: "狙いのセット",
      luckSlider: "運勢分布スライダー",
      luckDesc: "スライダーを動かして運勢ごとの結果を確認",
      topLuck: (n: number) => `上位 ${n}% の運勢`,
      luck10: "豪運",
      luck25: "上位25%",
      luck50: "中央値",
      luck75: "下位25%",
      luck90: "悲運",
      targetReach: (s: number) => `目標スコア ${s} 到達までの日数`,
      standardExpectation: "標準的な期待値",
      medianLuck: "平均的な運勢（中央値）",
      outcome: "解析結果",
      luckGood: "✨ 運勢が良い！",
      luckBad: "🚨 運勢が悪い...",
      periodResult: (d: number) => `${d}日間の厳選期待値`,
      buildScore: "推定ビルドスコア",
      superiority: "ビルド実力（勝率）",
      yourScore: "あなたのスコア",
      avgScore: (d: number) => `${d}日間の平均`,
      godPieceList: "神聖遺物ドロップリスト (平行世界)",
      share: "結果をシェア",
      guide: "タルタリヤの最適装備を見る",
      backHome: "ホームへ戻る",
      specialPage: "タルタリヤ専用",
      title: "TARTAGLIA",
      subtitle: "水属性・聖遺物解析システム",
      upgradeProb: "更新期待度",
      upgradeOverall: "全体の更新期待度",
      recommended: "狙い目",
      difficult: "難関",
      days_unit: "日",
      piece_miss: "取得失敗",
      score_unit: "pt",
      [STAT_IDS.CRIT_RATE]: "会心率",
      [STAT_IDS.CRIT_DMG]: "会心ダメージ",
      [STAT_IDS.ATK_PER]: "攻撃力%",
      [STAT_IDS.HP_PER]: "HP%",
      [STAT_IDS.DEF_PER]: "防御力%",
      [STAT_IDS.ER]: "元素チャージ効率",
      [STAT_IDS.EM]: "元素熟知",
      [STAT_IDS.ATK_FLAT]: "攻撃力(固定値)",
      [STAT_IDS.HP_FLAT]: "HP(固定値)",
      [STAT_IDS.DEF_FLAT]: "防御力(固定値)",
      [STAT_IDS.PYRO_DMG]: "炎元素ダメージ",
      [STAT_IDS.HYDRO_DMG]: "水元素ダメージ",
      [STAT_IDS.ANEMO_DMG]: "風元素ダメージ",
      [STAT_IDS.ELECTRO_DMG]: "雷元素ダメージ",
      [STAT_IDS.DENDRO_DMG]: "草元素ダメージ",
      [STAT_IDS.CRYO_DMG]: "氷元素ダメージ",
      [STAT_IDS.GEO_DMG]: "岩元素ダメージ",
      [STAT_IDS.PHYSICAL_DMG]: "物理ダメージ",
      [STAT_IDS.HEAL_BONUS]: "与える治癒効果",
      "時の砂": "時の砂",
      "空の杯": "空の杯",
      "理の冠": "理の冠",
      "祝聖のエリクシル": "祝聖のエリクシル"
    },
    en: {
      target: "Target Score",
      period: "Farming Sim",
      rank: "Build Rank",
      upgrade: "Build Upgrade Chance",
      run: "Run Simulation",
      simulating: "Analyzing...",
      targetScore: "Target Score",
      days: "Farming Days",
      currentScores: "Current Part Scores",
      advanced: "Strategy (Weights)",
      substats: "Substat Priority",
      targetSets: "Target Sets",
      luckSlider: "Luck Probability",
      luckDesc: "Adjust slider to see outcomes by probability",
      topLuck: (n: number) => `Top ${n}% Luck`,
      luck10: "Godly",
      luck25: "Great",
      luck50: "Median",
      luck75: "Bad",
      luck90: "Terrible",
      targetReach: (s: number) => `Estimated Days to reach ${s}pt`,
      standardExpectation: "Standard Expectation",
      medianLuck: "Median Luck",
      outcome: "Outcome",
      luckGood: "✨ High Luck!",
      luckBad: "🚨 Low Luck...",
      periodResult: (d: number) => `${d} Days Expected Score`,
      buildScore: "Est. Build Score",
      superiority: "Build Superiority",
      yourScore: "Your Score",
      avgScore: (d: number) => `${d}d Average`,
      godPieceList: "God Pieces (Parallel Worlds)",
      share: "Share Results",
      guide: "View Tartaglia Build Guide",
      backHome: "Back to Home",
      specialPage: "Tartaglia Special",
      title: "TARTAGLIA",
      subtitle: "Artifact Analysis System",
      upgradeProb: "Build Upgrade Chance",
      upgradeOverall: "Overall Upgrade Chance",
      recommended: "Hot",
      difficult: "Hard",
      days_unit: "days",
      piece_miss: "MISS",
      score_unit: "pt",
      [STAT_IDS.CRIT_RATE]: "CRIT Rate",
      [STAT_IDS.CRIT_DMG]: "CRIT DMG",
      [STAT_IDS.ATK_PER]: "ATK%",
      [STAT_IDS.HP_PER]: "HP%",
      [STAT_IDS.DEF_PER]: "DEF%",
      [STAT_IDS.ER]: "Energy Recharge",
      [STAT_IDS.EM]: "Elemental Mastery",
      [STAT_IDS.ATK_FLAT]: "ATK (Flat)",
      [STAT_IDS.HP_FLAT]: "HP (Flat)",
      [STAT_IDS.DEF_FLAT]: "DEF (Flat)",
      [STAT_IDS.PYRO_DMG]: "Pyro DMG Bonus",
      [STAT_IDS.HYDRO_DMG]: "Hydro DMG Bonus",
      [STAT_IDS.ANEMO_DMG]: "Anemo DMG Bonus",
      [STAT_IDS.ELECTRO_DMG]: "Electro DMG Bonus",
      [STAT_IDS.DENDRO_DMG]: "Dendro DMG Bonus",
      [STAT_IDS.CRYO_DMG]: "Cryo DMG Bonus",
      [STAT_IDS.GEO_DMG]: "Geo DMG Bonus",
      [STAT_IDS.PHYSICAL_DMG]: "Physical DMG Bonus",
      [STAT_IDS.HEAL_BONUS]: "Healing Bonus",
      "時の砂": "Sands",
      "空の杯": "Goblet",
      "理の冠": "Circlet",
      "祝聖のエリクシル": "Sanctifying Elixir",
      "天からの贈り物": "Celestial Gift",
      "影に沈む幻": "Disenchantment in Deep Shadow",
      "旧貴族のしつけ": "Noblesse Oblige",
      "千岩牢固": "Tenacity of the Millelith",
      "ニコ・リヤン": "Nicole Reeyn"
    }
  };

  const t = (key: string, param?: any) => {
    const entry = translations[lang][key] || key;
    return typeof entry === 'function' ? entry(param) : entry;
  };
  
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initial: any = {};
    config.slots.forEach(s => { if(s !== "未選択") initial[s] = 30; });
    setUserPartScores(initial);
  }, []);

  const handleSimulate = () => {
    setIsSimulating(true);
    setResult(null);
    setAllGodPieces([]);
    setSortedResults([]);

    setTimeout(async () => {
      let simResult: any;
      let godPieces: any[] = [];
      const trials = 500;
      const subPool = GENSHIN_SUB_STATS;

      if (simMode === "upgrade") {
        const attempts = Math.floor(days * (staminaPerDay / 20));
        let overallUpgrades = 0;
        const partUpgrades: any = {};
        config.slots.forEach(s => { if(s !== "未選択") partUpgrades[s] = 0; });

        for (let i = 0; i < trials; i++) {
          const r = simulateFixedAttempts(gameId, attempts, staminaPerDay, scoreWeights, subPool, false, mainStats, targetSets, null);
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
          slotResults: Object.entries(partUpgrades).map(([slot, count]: [any, any]) => ({
            slot,
            prob: (count / trials) * 100
          })).sort((a, b) => b.prob - a.prob)
        };
        setUpgradeResult(upgradeData);
        simResult = { type: "upgrade" };
      } else if (simMode === "target") {
        const results = [];
        for (let i = 0; i < trials; i++) {
          const res = simulateUntilScore(gameId, targetScore, scoreWeights, subPool, false, mainStats, targetSets, null);
          results.push(res);
          if (res.godPieces && res.godPieces.length > 0) godPieces.push(...res.godPieces);
        }
        results.sort((a, b) => a.attempts - b.attempts);
        setSortedResults(results);
        setLuckPercentile(25);
        
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
      } else {
        const totalAttempts = Math.floor(days * (staminaPerDay / 20));
        const results = [];
        let winCount = 0;
        const userTotal = Object.values(userPartScores).reduce((a, b) => a + b, 0);

        for (let i = 0; i < trials; i++) {
          const r = simulateFixedAttempts(gameId, totalAttempts, staminaPerDay, scoreWeights, subPool, false, mainStats, targetSets, null);
          results.push(r);
          if (r.godPieces && r.godPieces.length > 0) godPieces.push(...r.godPieces);
          if (simMode === "rank" && r.score > userTotal) winCount++;
        }

        if (simMode === "period") {
          results.sort((a, b) => b.score - a.score);
          setSortedResults(results);
          setLuckPercentile(25);
          const medianRes = results[Math.floor(trials * 0.5)];
          simResult = {
            type: "period",
            median: medianRes.score,
            top10: results[Math.floor(trials * 0.1)].score,
            bottom10: results[Math.floor(trials * 0.9)].score,
            pieces: medianRes.pieces
          };
        } else {
          results.sort((a, b) => b.score - a.score);
          setSortedResults(results);
          setLuckPercentile(50);
          simResult = {
            type: "rank",
            winRate: (winCount / trials) * 100,
            userScore: userTotal,
            median: results[Math.floor(trials / 2)].score
          };
        }
      }

      setResult(simResult);
      godPieces.sort((a, b) => b.score - a.score);
      setAllGodPieces(godPieces.slice(0, 10));
      setIsSimulating(false);
    }, 100);
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
             <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> {t('backHome')}
           </Link>
           <div className="flex items-center gap-4">
              <div className="flex bg-slate-900/80 rounded-full p-1 border border-white/5">
                <button 
                  onClick={() => setLang('ja')}
                  className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${lang === 'ja' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  JP
                </button>
                <button 
                  onClick={() => setLang('en')}
                  className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${lang === 'en' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  EN
                </button>
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-black uppercase tracking-[0.3em]">
                <Droplets size={12} className="animate-bounce" /> {t('specialPage')}
              </div>
           </div>
        </div>

        <div className="text-center mb-16 space-y-4">
          <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Fatui Harbinger: Childe</div>
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white leading-none">
            {t('title')} <span className="text-sky-500 uppercase">Ajax</span>
          </h1>
          <p className="text-sky-400/60 font-medium tracking-[0.1em] uppercase text-sm">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Settings Column */}
          <div className={`lg:col-span-4 space-y-6 ${isMobileSettingsOpen ? 'fixed inset-0 z-50 p-6 bg-slate-950 overflow-y-auto' : 'hidden lg:block'}`}>
            {isMobileSettingsOpen && (
              <div className="flex justify-between items-center mb-6 lg:hidden">
                <h2 className="text-xl font-black italic">SETTINGS</h2>
                <button onClick={() => setIsMobileSettingsOpen(false)} className="p-2 text-slate-500 hover:text-white"><X size={24} /></button>
              </div>
            )}
            <div className="bg-slate-900/80 border border-white/5 rounded-[32px] p-8 backdrop-blur-2xl shadow-2xl">
              <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2 italic border-b border-white/5 pb-4">
                <LayoutGrid size={20} className="text-sky-500" /> {t('advanced')}
              </h2>
              
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                   {[
                     { id: "target", label: t('target'), icon: Target },
                     { id: "period", label: t('period'), icon: Calendar },
                     { id: "rank", label: t('rank'), icon: MessageSquare },
                     { id: "upgrade", label: t('upgrade'), icon: Zap }
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
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{t('targetScore')}</label>
                    <input 
                      type="number" value={targetScore} onChange={e => setTargetScore(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-white font-black outline-none focus:border-sky-500 transition-all"
                    />
                  </div>
                )}

                {simMode !== "target" && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{t('days')}</label>
                    <input 
                      type="number" value={days} onChange={e => setDays(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl p-3 text-white font-black outline-none focus:border-sky-500 transition-all"
                    />
                  </div>
                )}

                {(simMode === "rank" || simMode === "upgrade") && (
                   <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('currentScores')}</label>
                      <div className="grid grid-cols-2 gap-2">
                        {config.slots.filter(s => s !== "未選択").map(slot => (
                          <div key={slot} className="bg-slate-950/50 p-2 rounded-xl border border-white/5">
                            <p className="text-[8px] text-slate-600 font-bold mb-1 truncate">{t(slot)}</p>
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
                    <span className="flex items-center gap-2"><Settings2 size={12} /> {t('advanced')}</span>
                    {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  
                  {showAdvanced && (
                    <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                       <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                         <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3">{t('substats')}</label>
                         <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                           {GENSHIN_SUB_STATS.map(sub => (
                             <div key={sub} className="space-y-1">
                               <label className="text-[8px] text-slate-500 uppercase">{t(sub)}</label>
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
                          <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3">{t('targetSets')}</label>
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
                                 <option value="">None</option>
                                 {GENSHIN_SETS.map(set => <option key={set} value={set}>{t(set)}</option>)}
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
                  {isSimulating ? t('simulating') : t('run')}
                </button>
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-8">
            <div ref={cardRef} className="bg-slate-900/60 border border-sky-500/10 rounded-[40px] p-6 md:p-10 min-h-[600px] flex flex-col items-center relative overflow-hidden backdrop-blur-3xl shadow-inner">
              <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-sky-600/10 blur-[100px] rounded-full"></div>
              <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-blue-900/10 blur-[80px] rounded-full"></div>

              {simMode === "upgrade" && result && result.type === "upgrade" && upgradeResult ? (
                <div className="w-full space-y-10 animate-in fade-in duration-500">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{t('upgradeProb')}</h3>
                    <p className="text-xs text-sky-500 font-bold uppercase tracking-[0.3em]">{t('periodResult', days)}</p>
                  </div>

                  <div className="bg-sky-600/5 p-10 rounded-[50px] border border-sky-500/10 text-center relative overflow-hidden group">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-4">{t('upgradeOverall')}</p>
                    <p className="text-8xl font-black text-white tracking-tighter mb-4">
                      {upgradeResult.overallProb.toFixed(1)}<span className="text-2xl text-slate-500">%</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {upgradeResult.slotResults.map((res: any) => (
                      <div key={res.slot} className="bg-slate-900/50 p-6 rounded-[32px] border border-white/5 hover:border-sky-500/30 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest truncate">{t(res.slot)}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${res.prob > 20 ? 'bg-sky-500/10 text-sky-400' : 'bg-slate-800 text-slate-600'}`}>
                            {res.prob > 20 ? t('recommended') : t('difficult')}
                          </span>
                        </div>
                        <p className="text-4xl font-black text-white tracking-tighter mb-2">{res.prob.toFixed(1)}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  {!result && !isSimulating && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 py-20">
                      <Waves size={64} className="text-sky-500 mb-6" />
                      <p className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">{lang === 'ja' ? '条件を入力して実行してください' : 'Enter criteria and execute'}</p>
                    </div>
                  )}

                  {isSimulating && (
                    <div className="flex flex-col items-center gap-6 w-full max-w-md py-10">
                      <div className="relative w-24 h-24">
                        <div className="absolute inset-0 rounded-full border-4 border-white/5"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-sky-500 border-t-transparent animate-spin"></div>
                        <Zap size={32} className="absolute inset-0 m-auto text-sky-500 animate-pulse" />
                      </div>
                      <p className="mt-8 text-xs font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse italic">{lang === 'ja' ? '可能性を演算中...' : 'Calculating possibilities...'}</p>
                    </div>
                  )}

                  {result && !isSimulating && (
                    <div className="w-full space-y-8 animate-in zoom-in-95 duration-500">
                      <div className="bg-slate-900/40 p-6 rounded-[32px] border border-white/5">
                        <div className="flex justify-between items-center mb-6">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-sky-600/10 flex items-center justify-center border border-sky-500/20">
                                 <Zap size={18} className="text-sky-500" />
                              </div>
                              <div>
                                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('luckSlider')}</h3>
                                 <p className="text-[10px] text-slate-600">{t('luckDesc')}</p>
                              </div>
                           </div>
                           <div className={`px-4 py-1.5 rounded-full text-xs font-black shadow-lg ${luckPercentile <= 25 ? 'bg-sky-600 text-white shadow-sky-500/20' : luckPercentile <= 50 ? 'bg-white text-slate-950 shadow-white/10' : 'bg-slate-800 text-slate-400'}`}>
                              {t('topLuck', luckPercentile)}
                           </div>
                        </div>
                        <div className="relative px-2 pt-8 pb-4">
                           <input 
                              type="range" min="10" max="90" step="1" 
                              value={luckPercentile} 
                              onChange={e => setLuckPercentile(Number(e.target.value))}
                              className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-sky-500"
                           />
                           <div className="absolute top-0 left-0 right-0 h-8 text-[9px] font-bold text-slate-600 flex justify-between">
                              <span className="flex flex-col items-center">{t('luck10')}<span>(10%)</span></span>
                              <span className="flex flex-col items-center text-sky-500">{t('luck25')}<span>(25%)</span></span>
                              <span className="flex flex-col items-center">{t('luck50')}<span>(50%)</span></span>
                              <span className="flex flex-col items-center text-rose-500">{t('luck75')}<span>(75%)</span></span>
                              <span className="flex flex-col items-center">{t('luck90')}<span>(90%)</span></span>
                           </div>
                        </div>
                      </div>

                      {result.type === "target" && (
                        <div className="space-y-8 text-center">
                          <h3 className="text-xl font-black text-white italic tracking-tight flex items-center justify-center gap-3">
                            {t('targetReach', targetScore)}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-900/50 border border-white/5 p-8 rounded-[40px] text-center group">
                              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{t('standardExpectation')}</p>
                              <p className="text-6xl font-black text-white tracking-tighter italic">{result.median} <span className="text-xl font-bold text-slate-600 uppercase not-italic">{t('days_unit')}</span></p>
                              <p className="text-xs text-slate-500 mt-3 italic">{t('medianLuck')}</p>
                            </div>
                            {(() => {
                              const currentLuckRes = sortedResults[Math.floor((luckPercentile / 100) * (sortedResults.length - 1))];
                              const currentDays = Math.ceil((currentLuckRes?.attempts * 20) / staminaPerDay);
                              const isProfit = currentDays < result.median;
                              return (
                                <div className={`p-8 rounded-[40px] border-2 transition-all duration-500 text-center relative overflow-hidden ${
                                  luckPercentile <= 25 ? "bg-sky-500/5 border-sky-500/30" : luckPercentile <= 50 ? "bg-white/5 border-white/20" : "bg-rose-500/5 border-rose-500/30"
                                }`}>
                                  <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">{t('outcome')}</p>
                                  <p className="text-6xl font-black text-white tracking-tighter italic">{currentDays} <span className="text-xl font-bold text-slate-600 uppercase not-italic">{t('days_unit')}</span></p>
                                  <div className={`mt-4 inline-flex items-center gap-2 px-4 py-1 rounded-full text-[10px] font-black ${isProfit ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                                    {isProfit ? t('luckGood') : t('luckBad')}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      )}

                      {result.type === "period" && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
                          <h3 className="text-center text-xl font-bold italic tracking-tighter uppercase mb-6">{lang === 'ja' ? `${days}日間の厳選期待値` : `${days} Days Expected Score`}</h3>
                            {(() => {
                              const currentLuckRes = sortedResults[Math.floor((luckPercentile / 100) * (sortedResults.length - 1))];
                              const currentScore = currentLuckRes?.score || 0;
                              return (
                                <div className="space-y-10">
                                  <div className="bg-sky-600/10 p-10 rounded-[50px] border border-sky-500/20 shadow-2xl max-w-2xl mx-auto relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-sky-500 mb-2 relative z-10">{t('buildScore')}</p>
                                    <p className="text-8xl font-black text-white tracking-tighter relative z-10 italic">
                                      {currentScore.toFixed(1)} <span className="text-2xl text-slate-600 uppercase not-italic">{t('score_unit')}</span>
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {Object.entries(currentLuckRes?.pieces || {}).map(([slot, art]: [string, any]) => (
                                      <div key={slot} className="bg-slate-900/60 border border-white/5 p-4 rounded-3xl group hover:border-sky-500/30 transition-all">
                                        <p className="text-[9px] text-slate-500 font-black uppercase mb-2 truncate">{t(slot)}</p>
                                        {art ? (
                                          <div className="space-y-1">
                                            <p className="text-sm font-black text-white italic">{(art.score || 0).toFixed(1)} <span className="text-[10px] text-slate-600 not-italic">{t('score_unit')}</span></p>
                                            <p className="text-[9px] text-sky-400 font-bold truncate">{art.setName}</p>
                                            <p className="text-[8px] text-slate-600 truncate">{t(art.main)}</p>
                                          </div>
                                        ) : <p className="text-[10px] text-slate-800 font-black">{t('piece_miss')}</p>}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}
                        </div>
                      )}

                      {result.type === "rank" && (
                        <div className="space-y-8 py-10">
                           <div className="text-center">
                              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mb-4 italic">{t('superiority')}</p>
                              <p className="text-8xl font-black text-white italic tracking-tighter leading-none">{result.winRate.toFixed(1)}%</p>
                              <p className="text-xs text-slate-500 mt-4 italic">{lang === 'ja' ? `あなたのスコアが上位 ${(100 - result.winRate).toFixed(1)}% に位置しています` : `Your score is in the top ${(100 - result.winRate).toFixed(1)}%`}</p>
                           </div>
                           <div className="bg-slate-900/50 p-6 rounded-[32px] border border-white/5 flex justify-around text-center">
                              <div>
                                 <p className="text-[9px] text-slate-500 uppercase font-black mb-1">{t('yourScore')}</p>
                                 <p className="text-3xl font-black text-sky-500 italic">{result.userScore.toFixed(1)}</p>
                              </div>
                              <div className="w-px bg-white/5"></div>
                              <div>
                                 <p className="text-[9px] text-slate-500 uppercase font-black mb-1">{t('avgScore', days)}</p>
                                 <p className="text-3xl font-black text-white italic">{result.median.toFixed(1)}</p>
                              </div>
                           </div>
                        </div>
                      )}

                      {/* God Pieces Section */}
                      {allGodPieces.length > 0 && (
                        <div className="mt-12 w-full pt-10 border-t border-white/5">
                           <h4 className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em] flex items-center gap-3 mb-6">
                              <Sparkles size={14} className="animate-pulse" /> {t('godPieceList')}
                           </h4>
                           <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                              {allGodPieces.map((p, i) => (
                                <div key={i} className="bg-slate-900/80 border border-sky-500/10 p-3 rounded-2xl group hover:border-sky-500/40 transition-all relative overflow-hidden">
                                   <div className="absolute top-0 right-0 w-8 h-8 bg-sky-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                   <p className={`text-lg font-black italic mb-1 ${p.score >= 58 ? 'text-sky-400' : 'text-white'}`}>{p.score.toFixed(1)}{t('score_unit')}</p>
                                   <p className="text-[9px] text-slate-500 font-bold truncate">{p.setName}</p>
                                   <p className="text-[8px] text-slate-600 uppercase tracking-tighter">{t(p.part)} / {t(p.main)}</p>
                                   {p.score >= 58 && (
                                     <div className="mt-2 text-[7px] font-black text-sky-500 bg-sky-500/10 px-1.5 py-0.5 rounded-full inline-block">GOD PIECE</div>
                                   )}
                                </div>
                              ))}
                           </div>
                        </div>
                      )}
                    </div>
                  )}
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
                  {t('share')}
                </button>
                <button className="px-12 py-5 rounded-full bg-slate-900 border border-sky-500/20 text-sky-400 font-black text-md hover:bg-sky-900/40 hover:border-sky-500/50 transition-all flex items-center gap-2">
                  <Sword size={20} />
                  {t('guide')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE FLOATING BAR */}
      <div className="lg:hidden fixed bottom-6 left-4 right-4 z-40 flex gap-3">
        <button 
          onClick={() => setIsMobileSettingsOpen(true)}
          className="flex-1 bg-slate-900/90 border border-white/10 backdrop-blur-xl text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-2xl flex items-center justify-center gap-2"
        >
          <Settings2 size={14} /> {t('settings')}
        </button>
        <button 
          onClick={() => handleSimulate()}
          disabled={isSimulating}
          className={`flex-[2] bg-gradient-to-r from-sky-600 to-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-2xl flex items-center justify-center gap-2 disabled:opacity-50`}
        >
          <Zap size={14} /> {isSimulating ? t('simulating') : t('run')}
        </button>
      </div>
    </main>
  );
}
