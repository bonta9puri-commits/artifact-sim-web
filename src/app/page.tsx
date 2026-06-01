"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { GAME_CONFIGS, GameId, GameConfig } from '@/lib/game_data';
import { GENSHIN_CHARACTERS, GENSHIN_MAIN_STATS, GENSHIN_SUB_STATS, GENSHIN_SETS, GENSHIN_SLOTS } from "@/lib/genshin_data";
import { STAT_IDS } from "@/lib/stats";
import { simulateUntilScore, simulateFixedAttempts, compareRecycleEfficiency, ElixirConfig, MAIN_PROBS } from "@/lib/simulator";
import { SET_EFFECTS_TEXT, SET_BONUS_STATS, getActiveSets } from '@/lib/set_effects';
import { SET_PAIRS } from '@/lib/set_pairs';
import { toPng } from 'html-to-image';
import { BarChart, Bar, XAxis, Tooltip, ReferenceLine, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, YAxis } from 'recharts';
import { Sparkles, Zap, Shield, Sword, LayoutGrid, BookOpen, Target, Calendar, MessageSquare, ChevronLeft, ChevronRight, X, Share2, Settings2 } from 'lucide-react';

export default function Home() {
  const [lang, setLang] = useState<"ja" | "en">("ja");
  const [tutorialStep, setTutorialStep] = useState<number | null>(null);

  const tutorialSteps = [
    {
      title: lang === "ja" ? "✨ 聖遺物厳選解析システムへようこそ！" : "✨ Welcome to the Artifact Simulator!",
      content: lang === "ja" 
        ? "本ツールは、原神・崩壊スターレイル・ゼンレスゾーンゼロの厳選期間や確率を、祝聖エリクシルや廻聖のリサイクル効率まで含めて数学的に解析できるシミュレーターです。"
        : "This tool mathematically simulates your gear timeline and upgrade chances, fully factoring in Sanctifying Elixirs, Strongbox recycling, and luck distribution.",
      icon: Sparkles
    },
    {
      title: lang === "ja" ? "🎮 ゲームとキャラクターの選択" : "🎮 Select Game & Character",
      content: lang === "ja"
        ? "上部のタブからゲーム（原神/スタレ/ゼンゼロ）を選択し、キャラクターを選択してください。キャラを選ぶと、推奨されるステータス重みやセットが自動適用されます。"
        : "Switch games from the top tabs and select a character. Recommended weights, main stats, and sets will be applied automatically.",
      icon: LayoutGrid
    },
    {
      title: lang === "ja" ? "📊 4つの診断モード" : "📊 4 Simulation Modes",
      content: lang === "ja"
        ? "『目標スコア診断』『期間シミュ』『ランク診断』『更新確率診断』の4つのモードを切り替え可能。目標日数やビルドを更新できる確率など、目的に合わせて診断できます。"
        : "Switch between Target Score, Farming Sim, Build Rank, and Upgrade Chance modes to analyze different aspects of your gear progression.",
      icon: Target
    },
    {
      title: lang === "ja" ? "⚙️ 設定のカスタマイズと実行" : "⚙️ Customize & Run",
      content: lang === "ja"
        ? "狙いのセット、メインステータス、サブステ重み、エリクシル、そして『1日の消費スタミナ』を設定し、『シミュレーション開始』を押して並行世界のドロップ結果を解析しましょう！"
        : "Adjust target sets, main stats, substat weights, Elixirs, and Resin/Stamina per day, then press 'Run Simulation' to execute the mathematical analysis!",
      icon: Settings2
    }
  ];

  useEffect(() => {
    const completed = localStorage.getItem('sim_tutorial_completed_v1');
    if (!completed) {
      setTutorialStep(0);
    }
  }, []);

  const closeTutorial = () => {
    localStorage.setItem('sim_tutorial_completed_v1', 'true');
    setTutorialStep(null);
  };


  const translations: any = {
    ja: {
      target: "目標スコア診断",
      period: "期間シミュ",
      rank: "ランク診断",
      upgrade: "更新確率診断",
      settings: "設定",
      character: "キャラクター",
      targetSets: "狙いのセット (ダンジョン別)",
      mainStats: "メインステータス",
      weights: "サブステータスの重み",
      targetScore: "目標合計スコア",
      farmingDays: "厳選日数",
      currentScores: "現在の部位別スコア",
      elixir: "祝聖のエリクシル",
      strongbox: "聖遺物廻聖",
      run: "シミュレーション開始",
      simulating: "解析中...",
      outcome: "解析結果",
      share: "結果を画像でシェア",
      back: "戻る",
      luckSlider: "運勢分布スライダー",
      luckDesc: "スライダーを動かして運勢ごとの結果を確認",
      topLuck: (n: number) => `上位 ${n}% の運勢`,
      luck10: "豪運",
      luck25: "上位25%",
      luck50: "中央値",
      luck75: "下位25%",
      luck90: "悲運",
      elixirSaved: (n: number) => `エリクシルで ${n} 日短縮`,
      superiority: "ビルド実力（勝率）",
      yourScore: "あなたのスコア",
      avgScore: (n: number) => `${n}日間の平均`,
      godPieceList: "神聖遺物ドロップリスト",
      days_unit: "日",
      score_unit: "pt",
      guide: "ガイド",
      disclaimer: "当ツールはファンによる非公式プロジェクトであり、HoYoverseとは一切関係ありません。",
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
      "生の花": "生の花",
      "死の羽": "死の羽",
      "時の砂": "時の砂",
      "空の杯": "空の杯",
      "理の冠": "理の冠",
      "時の砂 (2)": "時の砂 (2)",
      "空の杯 (4)": "空の杯 (4)",
      "理の冠 (3)": "理の冠 (3)",
      "頭部": "頭部",
      "手部": "手部",
      "胴体": "胴体",
      "脚部": "脚部",
      "次元界オーブ": "次元界オーブ",
      "連結縄": "連結縄",
      "スロット1": "スロット1",
      "スロット2": "スロット2",
      "スロット3": "スロット3",
      "スロット4": "スロット4",
      "スロット5": "スロット5",
      "スロット6": "スロット6",
      "攻撃力(固定値)": "攻撃力(固定値)",
      "HP(固定値)": "HP(固定値)",
      "防御力(固定値)": "防御力(固定値)",
      "元素ダメージ": "元素ダメージ"
    },
    en: {
      target: "Target Score",
      period: "Farming Sim",
      rank: "Build Rank",
      upgrade: "Build Upgrade Chance",
      settings: "Settings",
      character: "Character",
      targetSets: "Target Sets (by Domain)",
      mainStats: "Main Stats",
      weights: "Substat Weights",
      targetScore: "Target Total Score",
      farmingDays: "Farming Days",
      currentScores: "Current Part Scores",
      elixir: "Sanctifying Elixir",
      "祝聖のエリクシル": "Sanctifying Elixir",
      "天からの贈り物": "Celestial Gift",
      "影に沈む幻": "Disenchantment in Deep Shadow",
      "旧貴族のしつけ": "Noblesse Oblige",
      "千岩牢固": "Tenacity of the Millelith",
      "ニコ・リヤン": "Nicole Reeyn",
      "ヌヴィレット": "Neuvillette",
      "フリーナ": "Furina",
      "ナヒーダ": "Nahida",
      "雷電将軍": "Raiden Shogun",
      "アルレッキーノ": "Arlecchino",
      "鍾離": "Zhongli",
      "甘雨": "Ganyu",
      "胡桃": "Hu Tao",
      "神里綾華": "Kamisato Ayaka",
      "八重神子": "Yae Miko",
      "夜蘭": "Yelan",
      "放浪者": "Wanderer",
      "ムアラニ": "Mualani",
      "キィニチ": "Kinich",
      "シロネン": "Xilonen",
      "タルタリヤ": "Tartaglia",
      "楓原万葉": "Kaedehara Kazuha",
      "珊瑚宮心海": "Sangonomiya Kokomi",
      "ニィロウ": "Nilou",
      "アルハイゼン": "Alhaitham",
      "セノ": "Cyno",
      "エウルア": "Eula",
      "荒瀧一斗": "Arataki Itto",
      "申鶴": "Shenhe",
      "ナヴィア": "Navia",
      "クロリンデ": "Clorinde",
      "エミリエ": "Emilie",
      "その他": "Others",
      strongbox: "Strongbox",
      run: "Run Simulation",
      simulating: "Analyzing...",
      outcome: "Outcome",
      share: "Share Results as Image",
      back: "Back",
      luckSlider: "Luck Probability",
      luckDesc: "Adjust slider to see outcomes by luck",
      topLuck: (n: number) => `Top ${n}% Luck`,
      luck10: "Godly",
      luck25: "Great",
      luck50: "Median",
      luck75: "Bad",
      luck90: "Terrible",
      elixirSaved: (n: number) => `${n} days saved by Elixir`,
      superiority: "Build Superiority",
      yourScore: "Your Score",
      avgScore: (n: number) => `${n}d Average`,
      godPieceList: "God Piece Drop List",
      days_unit: "days",
      score_unit: "pt",
      guide: "Guide",
      disclaimer: "This tool is a fan-made project and is not affiliated with or endorsed by HoYoverse.",
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
      "生の花": "Flower",
      "死の羽": "Plume",
      "時の砂": "Sands",
      "空の杯": "Goblet",
      "理の冠": "Circlet",
      "時の砂 (2)": "Sands (2)",
      "空の杯 (4)": "Goblet (4)",
      "理の冠 (3)": "Circlet (3)",
      "頭部": "Head",
      "手部": "Hands",
      "胴体": "Body",
      "脚部": "Feet",
      "次元界オーブ": "Planar Sphere",
      "連結縄": "Link Rope",
      "スロット1": "Disk 1",
      "スロット2": "Disk 2",
      "スロット3": "Disk 3",
      "スロット4": "Disk 4",
      "スロット5": "Disk 5",
      "スロット6": "Disk 6",
      "攻撃力(固定値)": "ATK (Flat)",
      "HP(固定値)": "HP (Flat)",
      "防御力(固定値)": "DEF (Flat)",
      "元素ダメージ": "Elemental DMG"
    }
  };

  const t = (key: string, param?: any) => {
    const entry = translations[lang][key] || key;
    return typeof entry === 'function' ? entry(param) : entry;
  };

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
  const [staminaPerDay, setStaminaPerDay] = useState(gameId === "genshin" ? 180 : 240);
  const staminaCost = gameId === "genshin" ? 20 : 40;
  
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
  const [elixirSub1, setElixirSub1] = useState<string>(STAT_IDS.CRIT_RATE);
  const [elixirSub2, setElixirSub2] = useState<string>(STAT_IDS.CRIT_DMG);

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
      // 初期値設定
      const initialMain: Record<string, string> = {};
      config.slots.forEach(s => {
        if (s === "未選択") return;
        if (gameId === "genshin") {
          if (s === "生の花") initialMain[s] = STAT_IDS.HP_FLAT;
          else if (s === "死の羽") initialMain[s] = STAT_IDS.ATK_FLAT;
          else initialMain[s] = STAT_IDS.ATK_PER;
        } else if (gameId === "starrail") {
          if (s === "頭部") initialMain[s] = STAT_IDS.HP_FLAT;
          else if (s === "手部") initialMain[s] = STAT_IDS.ATK_FLAT;
          else initialMain[s] = STAT_IDS.ATK_PER;
        } else if (gameId === "zzz") {
          if (s === "スロット1") initialMain[s] = STAT_IDS.HP_FLAT;
          else if (s === "スロット2") initialMain[s] = STAT_IDS.ATK_FLAT;
          else if (s === "スロット3") initialMain[s] = STAT_IDS.DEF_FLAT;
          else initialMain[s] = STAT_IDS.ATK_PER;
        } else {
          initialMain[s] = STAT_IDS.ATK_PER;
        }
      });
      setMainStats(initialMain);
      
      if (gameId === "genshin") {
        setTargetScore(180);
      } else {
        setTargetScore(420);
      }
      
      const initialWeights: Record<string, number> = {};
      config.subStats.forEach(s => {
        if (s === STAT_IDS.CRIT_RATE) initialWeights[s] = (gameId === "zzz") ? 1.0 : 2.0;
        else if (s === STAT_IDS.CRIT_DMG || s === STAT_IDS.ATK_PER || s === STAT_IDS.AM_MAS) initialWeights[s] = 1.0;
        else if (s === STAT_IDS.SPEED) initialWeights[s] = 1.0;
        else initialWeights[s] = 0;
      });
      setScoreWeights(initialWeights);

      const initialPartScores: Record<string, number> = {};
      config.slots.forEach(s => {
        if (s !== "未選択") {
          if (gameId === "genshin") initialPartScores[s] = 35;
          else initialPartScores[s] = 70;
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
    
    const trials = 500;
    const subPool = config.subStats;

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
      const results: any[] = [];
      const baselineResults: any[] = [];

      for (let i = 0; i < trials; i++) {
        if (i % 20 === 0) {
          setSimProgress(Math.floor((i / trials) * 100));
          await new Promise(r => setTimeout(r, 1));
        }
        const res = simulateUntilScore(gameId, targetScore, scoreWeights, subPool, useStrongbox, mainStats, targetSets, elixirConfig);
        results.push(res);
        
        if (elixirEnabled && i < 50) {
          const base = simulateUntilScore(gameId, targetScore, scoreWeights, subPool, useStrongbox, mainStats, targetSets, { ...elixirConfig, enabled: false });
          baselineResults.push(base);
        }

        if (res.godPieces && res.godPieces.length > 0) {
          collectedGods.push(...res.godPieces);
          setLatestGodPiece(res.godPieces[res.godPieces.length - 1]);
        }
      }
      results.sort((a, b) => a.attempts - b.attempts);
      baselineResults.sort((a, b) => a.attempts - b.attempts);
      setSortedResults(results);
      setLuckPercentile(50);
      collectedGods.sort((a, b) => b.score - a.score);
      setAllGodPieces(collectedGods.slice(0, 10));
      
      const medianRes = results[Math.floor(trials / 2)];
      const top10Res = results[Math.floor(trials * 0.1)];
      const bottom10Res = results[Math.floor(trials * 0.9)];
      const medianBase = baselineResults.length > 0 ? baselineResults[Math.floor(baselineResults.length / 2)] : null;
  
      const finalRes = {
        type: "target",
        median: Math.ceil((medianRes.attempts * staminaCost) / staminaPerDay),
        top10: Math.ceil((top10Res.attempts * staminaCost) / staminaPerDay),
        bottom10: Math.ceil((bottom10Res.attempts * staminaCost) / staminaPerDay),
        medianWithoutElixir: medianBase ? Math.ceil((medianBase.attempts * staminaCost) / staminaPerDay) : null,
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
      const results: {score: number, pieces: any, godPieces?: any[], scoreBeforeElixir?: number}[] = [];
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
        const avgBonus = results.reduce((acc, r) => acc + (r.score - (r.scoreBeforeElixir || r.score)), 0) / trials;

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
        
        {/* --- SNS SHARE CARD --- */}
        <div className="fixed -left-[9999px] top-0 pointer-events-none">
          <div ref={snsCardRef} className="w-[480px] min-h-[850px] bg-slate-950 p-10 flex flex-col items-center relative overflow-hidden font-sans border-[12px] border-slate-900 shadow-2xl">
            <div className={`absolute top-[-100px] right-[-100px] w-64 h-64 rounded-full blur-[100px] opacity-30 bg-gradient-to-br ${config.gradient}`}></div>
            <div className={`absolute bottom-[-100px] left-[-100px] w-80 h-80 rounded-full blur-[120px] opacity-20 bg-gradient-to-br ${config.gradient}`}></div>
            <div className="z-10 w-full text-center mb-12">
              <p className={`text-[10px] font-black tracking-[0.4em] uppercase mb-2 bg-clip-text text-transparent bg-gradient-to-r ${config.gradient}`}>
                {config.name} Simulator
              </p>
              <h2 className="text-4xl font-black text-white tracking-tighter italic">{t(characterName)}</h2>
              <div className="h-1.5 w-16 bg-white/20 mx-auto mt-6 rounded-full"></div>
            </div>
            {result && (
              <div className="z-10 w-full flex flex-col items-center mb-12">
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[50px] p-10 w-full flex flex-col items-center shadow-2xl relative ring-1 ring-white/5">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">
                    {result.type === "target" ? "Expected Days to Reach Target" : result.type === "period" ? `${days} Days Farm Result` : result.type === "upgrade" ? `${days} Days Upgrade Prob.` : "Build Performance Rank"}
                  </p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-8xl font-black text-white tracking-tighter drop-shadow-2xl">
                      {result.type === "rank" ? result.percentile.toFixed(1) : result.type === "upgrade" ? upgradeResult?.overallProb.toFixed(1) : (result.type === "target" ? result.median.toFixed(0) : result.median.toFixed(2))}
                    </span>
                    <span className="text-2xl font-black text-slate-500 uppercase tracking-widest">
                      {result.type === "rank" || result.type === "upgrade" ? "%" : result.type === "target" ? "Days" : "Score"}
                    </span>
                  </div>
                  {result.type === "target" && result.medianWithoutElixir && (
                    <p className="text-[10px] text-yellow-500/80 font-black mb-4 uppercase tracking-[0.15em] flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20">
                      <span className="animate-pulse">✨</span> 
                      {(result.medianWithoutElixir - result.median).toFixed(0)} DAYS SAVED BY ELIXIR
                    </p>
                  )}
                  <p className="text-sm font-black text-blue-400 mb-8 tracking-wider">
                    {result.type === "rank" ? "TOP PERCENTILE" : result.type === "upgrade" ? "UPGRADE CHANCE" : "ESTIMATED AVERAGE"}
                  </p>
                  {(result.type === "target" || result.type === "period") && (
                    <div className="w-full grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
                      <div className="text-center">
                        <p className="text-[9px] text-emerald-400 font-black uppercase tracking-widest mb-2">LUCK: TOP 10%</p>
                        <p className="text-3xl font-black text-white leading-none tracking-tighter">
                          {result.type === "target" 
                            ? `+${((1 - result.top10 / result.median) * 100).toFixed(0)}%`
                            : `+${((result.top10 / result.median - 1) * 100).toFixed(0)}%`
                          }
                        </p>
                      </div>
                      <div className="text-center border-l border-white/10">
                        <p className="text-[9px] text-rose-400 font-black uppercase tracking-widest mb-2">LUCK: BOTTOM 10%</p>
                        <p className="text-3xl font-black text-white leading-none tracking-tighter">
                          {result.type === "target"
                            ? `-${((result.bottom10 / result.median - 1) * 100).toFixed(0)}%`
                            : `-${((1 - result.bottom10 / result.median) * 100).toFixed(0)}%`
                          }
                        </p>
                      </div>
                    </div>
                  )}
                  {result.type === "upgrade" && upgradeResult && (
                    <div className="w-full grid grid-cols-2 gap-4 pt-8 border-t border-white/10">
                      {upgradeResult.slotResults.slice(0, 4).map((res: any) => (
                        <div key={res.slot} className="text-center">
                          <p className="text-[7px] text-slate-500 font-black uppercase mb-1 truncate">{t(res.slot)}</p>
                          <p className="text-xl font-black text-white tracking-tighter">{res.prob.toFixed(1)}%</p>
                        </div>
                      ))}
                    </div>
                  )}
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
            {result && result.pieces && (
              <div className="z-10 w-full mb-12">
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] text-center mb-6">Equipped Pieces Summary</p>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(result.pieces).map(([slot, art]: [string, any]) => {
                    if (!art) return (
                      <div key={slot} className="bg-slate-900/60 border border-white/5 p-4 rounded-3xl flex flex-col items-center justify-center min-h-[120px] opacity-30">
                        <p className="text-[7px] text-slate-600 font-black uppercase tracking-widest truncate w-full text-center">{t(slot)}</p>
                        <p className="text-[10px] font-bold text-slate-500">N/A</p>
                      </div>
                    );
                    return (
                      <div key={slot} className="bg-slate-900/60 border border-white/5 p-4 rounded-3xl flex flex-col items-center justify-between min-h-[120px] relative overflow-hidden group">
                        {art.isElixir && (
                          <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-400 to-yellow-600 text-slate-950 text-[6px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-tighter z-10 shadow-sm animate-pulse">
                            祝聖
                          </div>
                        )}
                        <p className="text-[7px] text-slate-600 font-black uppercase tracking-widest truncate w-full text-center">{t(slot)}</p>
                        <div className="flex flex-col items-center -my-1">
                          <p className={`text-xl font-black tracking-tighter ${art.isElixir ? 'text-yellow-400' : 'text-white'}`}>{art.score.toFixed(2)}</p>
                        </div>
                        <div className="w-full text-center">
                          <p className="text-[7px] text-blue-500/80 font-bold truncate w-full leading-none">{t(art.main)}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-3xl flex flex-col items-center justify-between min-h-[120px] shadow-lg shadow-emerald-500/5">
                    <p className="text-[7px] text-emerald-700 font-black uppercase tracking-widest">TARGET</p>
                    <p className="text-2xl font-black text-emerald-400 tracking-tighter">{targetScore}</p>
                    <p className="text-[7px] text-emerald-600/80 font-bold uppercase">GOAL</p>
                  </div>
                </div>
              </div>
            )}
            <div className="z-10 mt-auto w-full flex items-center justify-between border-t border-white/10 pt-10">
              <div className="text-left">
                <p className="text-[10px] text-slate-600 font-black tracking-widest mb-1">PRODUCED BY</p>
                <p className={`text-xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r ${config.gradient}`}>ARTIFACT-SIM.COM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Game Switcher Tab */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
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

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setTutorialStep(0)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 rounded-full border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-400 transition-colors"
            >
              <Sparkles size={12} className="text-blue-400" />
              {lang === 'ja' ? 'ツアー開始' : 'Quick Tour'}
            </button>
            <Link 
              href="/blog"
              className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 rounded-full border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <BookOpen size={12} />
              {t('guide')}
            </Link>
            <div className="flex bg-slate-900/80 rounded-full p-1 border border-white/5">
              <button 
                onClick={() => setLang('ja')}
                className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${lang === 'ja' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                JP
              </button>
              <button 
                onClick={() => setLang('en')}
                className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${lang === 'en' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        <header className="flex flex-col md:flex-row items-start md:items-center justify-between py-4 border-b border-white/10 mb-8 gap-4">
          <div>
            <h1 className={`text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r ${config.gradient}`}>
              {config.name} {config.equipName}Sim
            </h1>
            <p className="text-slate-400 mt-1 text-sm font-medium max-w-2xl leading-relaxed">
              {lang === 'ja' 
                ? "祝聖エリクシルの短縮効果や聖遺物廻聖（リサイクル）効率、運勢のブレまで考慮し、目標達成に必要な日数やビルド更新確率を極めて高精度に数学的診断します。" 
                : "Mathematically diagnoses your target score timeline and build upgrade chances with high precision by factoring in Sanctifying Elixirs, Strongbox recycling, and luck distribution."}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {lang === 'ja' ? '✨ エリクシル・廻聖（リサイクル）対応' : '✨ Elixir & Strongbox Supported'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {lang === 'ja' ? '📈 運勢のブレを網羅した統計シミュレータ' : '📈 Luck-Percentile Model'}
              </span>
            </div>
          </div>
          <button onClick={() => setIsDrawerOpen(true)} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700">
            <LayoutGrid size={24} />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-24 lg:pb-0">
          <div className={`lg:col-span-4 space-y-6 ${isMobileSettingsOpen ? 'fixed inset-0 z-40' : 'hidden lg:block'}`}>
            <div className={`lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${isMobileSettingsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileSettingsOpen(false)}></div>
            <div className={`bg-slate-900 border border-slate-800 rounded-t-[40px] lg:rounded-3xl p-6 shadow-2xl backdrop-blur-md transition-all duration-300 relative z-50 h-[85vh] lg:h-auto overflow-y-auto custom-scrollbar ${isMobileSettingsOpen ? 'translate-y-0 bottom-0 fixed w-full' : 'translate-y-full lg:translate-y-0 lg:static w-full'}`}>
              <div className="lg:hidden w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-6"></div>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold flex items-center gap-2">⚙️ {t('settings')}</h2>
                <button className="lg:hidden p-2 text-slate-500 hover:text-white transition-colors" onClick={() => setIsMobileSettingsOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-5">
                <div className="flex flex-col gap-2">
                  <button onClick={() => setSimMode("target")} className={`py-3 rounded-xl text-sm font-bold transition-all ${simMode === "target" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-slate-800 text-slate-500 hover:bg-slate-700"}`}>{t('target')}</button>
                  <button onClick={() => setSimMode("period")} className={`py-3 rounded-xl text-sm font-bold transition-all ${simMode === "period" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-slate-800 text-slate-500 hover:bg-slate-700"}`}>{t('period')}</button>
                  <button onClick={() => setSimMode("rank")} className={`py-3 rounded-xl text-sm font-bold transition-all ${simMode === "rank" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-slate-800 text-slate-500 hover:bg-slate-700"}`}>{t('rank')}</button>
                  <button onClick={() => setSimMode("upgrade")} className={`py-3 rounded-xl text-sm font-bold transition-all ${simMode === "upgrade" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-slate-800 text-slate-500 hover:bg-slate-700"}`}>{t('upgrade')}</button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">{t('character')}</label>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <button onClick={() => setElementFilter("ALL")} className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${elementFilter === "ALL" ? 'bg-slate-700 text-white shadow-lg' : 'bg-slate-950 text-slate-600 border border-slate-800'}`}>ALL</button>
                    {Array.from(new Set(config.characters.map(c => c.element))).filter(e => e !== "無" && e !== "その他").map(el => (
                      <button key={el} onClick={() => setElementFilter(el)} className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${elementFilter === el ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-950 text-slate-600 border border-slate-800'}`}>{el}</button>
                    ))}
                  </div>
                  <select value={characterName} onChange={e => setCharacterName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition-all">
                    {config.characters.filter(c => elementFilter === "ALL" || c.element === elementFilter).map(c => (
                      <option key={c.name} value={c.name}>{c.defaults ? `✨ ${t(c.name)}` : t(c.name)}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                  <label className="block text-sm font-medium text-slate-400 mb-3">{t('targetSets')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {targetSets.map((setName, idx) => (
                      <div key={idx} className="space-y-1">
                        <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">
                          {lang === 'ja' 
                            ? (gameId === "starrail" ? (idx === 0 ? "遺物1 (大本命)" : idx === 1 ? "遺物2 (副産物)" : idx === 2 ? "オーナメント1 (大本命)" : "オーナメント2 (副産物)") : (idx === 0 ? "セット1 (大本命)" : idx === 1 ? "セット2 (副産物)" : idx === 2 ? "別秘境セット1" : "別秘境セット2"))
                            : (gameId === "starrail" ? (idx === 0 ? "Relic 1 (Primary)" : idx === 1 ? "Relic 2 (Sub)" : idx === 2 ? "Planar 1 (Primary)" : "Planar 2 (Sub)") : (idx === 0 ? "Set 1 (Primary)" : idx === 1 ? "Set 2 (Sub)" : idx === 2 ? "Other 1" : "Other 2"))}
                        </p>
                        <select value={setName} onChange={e => {
                          const val = e.target.value;
                          const newSets = [...targetSets];
                          newSets[idx] = val;
                          const pair = SET_PAIRS[gameId][val];
                          if (pair) {
                            if (idx === 0 && !newSets[1]) newSets[1] = pair;
                            if (idx === 2 && !newSets[3]) newSets[3] = pair;
                          }
                          setTargetSets(newSets);
                        }} className="w-full bg-slate-800 text-[10px] p-2 rounded-xl border border-slate-700 text-white outline-none">
                          <option value="">{lang === 'ja' ? '未選択' : 'None'}</option>
                          {config.sets.map(s => <option key={s} value={s}>{t(s)}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                  <label className="block text-sm font-medium text-slate-400 mb-3">{t('mainStats')}</label>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {config.slots.filter(s => s !== "未選択").map(slot => {
                      const isFixed = slot.includes("花") || slot.includes("羽") || slot === "頭部" || slot === "手部" || slot === "スロット1" || slot === "スロット2" || slot === "スロット3";
                      return (
                        <div key={slot} className="flex items-center justify-between gap-4">
                          <span className="text-xs text-slate-500 whitespace-nowrap">{t(slot)}</span>
                          {isFixed ? (
                            <span className="text-xs text-slate-400 bg-slate-800/30 px-3 py-1.5 rounded border border-slate-700/50 flex-1 text-right">
                              {slot.includes("花") || slot === "頭部" || slot === "スロット1" ? t("HP(固定値)") : slot.includes("羽") || slot === "手部" || slot === "スロット2" ? t("攻撃力(固定値)") : t("防御力(固定値)")}
                            </span>
                          ) : (
                            <select value={mainStats[slot] || ""} onChange={e => setMainStats({...mainStats, [slot]: e.target.value})} className="bg-slate-800 text-xs p-1.5 rounded border border-slate-700 flex-1 outline-none">
                              {Object.keys(MAIN_PROBS[gameId][slot] || {}).map(m => <option key={m} value={m}>{t(m)}</option>)}
                            </select>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                  <label className="block text-sm font-medium text-slate-400 mb-3">{t('weights')}</label>
                  <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {config.subStats.map(sub => (
                      <div key={sub} className="flex flex-col gap-1">
                        <label className="text-[10px] text-slate-500 whitespace-nowrap">{t(sub)}</label>
                        <input type="number" step="0.1" value={scoreWeights[sub] || 0} onChange={e => setScoreWeights({...scoreWeights, [sub]: e.target.value === "" ? 0 : Number(e.target.value)})} className="bg-slate-800 text-xs p-1.5 rounded border border-slate-700 outline-none text-white w-full"/>
                      </div>
                    ))}
                  </div>
                </div>

                {simMode === "target" && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-400">{t('targetScore')}</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(gameId === "genshin" ? [160, 180, 200, 220, 240] : [360, 390, 420, 450, 480]).map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setTargetScore(val)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${targetScore === val ? `bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20` : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                    <input 
                      type="number" 
                      value={targetScore} 
                      onChange={e => setTargetScore(e.target.value === "" ? 0 : Number(e.target.value))} 
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                )}

                {(simMode === "period" || simMode === "rank" || simMode === "upgrade") && (
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">{t('farmingDays')}</label>
                    <input type="number" value={days} onChange={e => setDays(e.target.value === "" ? 0 : Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white"/>
                  </div>
                )}

                {(simMode === "rank" || simMode === "upgrade") && (
                  <div className="grid grid-cols-2 gap-2 bg-slate-950/30 p-4 rounded-2xl border border-slate-800/50">
                    <p className="col-span-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">{t('currentScores')}</p>
                    {config.slots.filter(s => s !== "未選択").map(slot => (
                      <div key={slot}>
                        <label className="block text-[10px] text-slate-500 mb-1">{t(slot)}</label>
                        <input type="number" value={userPartScores[slot] || 0} onChange={e => setUserPartScores({...userPartScores, [slot]: e.target.value === "" ? 0 : Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"/>
                      </div>
                    ))}
                  </div>
                )}

                {gameId === "genshin" && (
                  <div className="bg-slate-950/50 p-4 rounded-2xl border border-emerald-900/50">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-medium text-emerald-400 flex items-center gap-2">✨ {t('elixir')}</label>
                      <button onClick={() => setElixirEnabled(!elixirEnabled)} className={`w-10 h-5 rounded-full relative transition-colors ${elixirEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                        <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${elixirEnabled ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                    {elixirEnabled && (
                      <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold mb-1">{lang === 'ja' ? '初期所持数' : 'Initial Count'}</p>
                            <input type="number" value={elixirInitialCount} onChange={e => setElixirInitialCount(e.target.value === "" ? 0 : Number(e.target.value))} className="w-full bg-slate-800 text-xs p-2 rounded-xl border border-slate-700 text-white outline-none focus:border-emerald-500"/>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold mb-1">{lang === 'ja' ? '1Ver(42日)の獲得数' : 'Per Version (42d)'}</p>
                            <input type="number" value={elixirPerVersion} onChange={e => setElixirPerVersion(e.target.value === "" ? 0 : Number(e.target.value))} className="w-full bg-slate-800 text-xs p-2 rounded-xl border border-slate-700 text-white outline-none focus:border-emerald-500"/>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold mb-1">{lang === 'ja' ? '使用部位 (消費コスト)' : 'Target Part (Cost)'}</p>
                            <select value={elixirTargetPart} onChange={e => setElixirTargetPart(e.target.value)} className="w-full bg-slate-800 text-xs p-2 rounded-xl border border-slate-700 text-white outline-none focus:border-emerald-500">
                              <option value="生の花">{t('生の花')} (1)</option>
                              <option value="死の羽">{t('死の羽')} (1)</option>
                              <option value="時の砂">{t('時の砂')} (2)</option>
                              <option value="空の杯">{t('空の杯')} (4)</option>
                              <option value="理の冠">{t('理の冠')} (3)</option>
                            </select>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold mb-1">{lang === 'ja' ? 'セット' : 'Set'}</p>
                            <select value={elixirTargetSet} onChange={e => setElixirTargetSet(e.target.value)} className="w-full bg-slate-800 text-xs p-2 rounded-xl border border-slate-700 text-white outline-none focus:border-emerald-500">
                              {targetSets.filter(s => s && s !== "未選択").map(s => <option key={s} value={s}>{s}</option>)}
                              {targetSets.filter(s => s && s !== "未選択").length === 0 && <option value="">{lang === 'ja' ? 'ダンジョン設定を反映' : 'Use Domain Settings'}</option>}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold mb-1">{lang === 'ja' ? 'メイン' : 'Main'}</p>
                            <select value={elixirTargetMain} onChange={e => setElixirTargetMain(e.target.value)} className="w-full bg-slate-800 text-[10px] p-2 rounded-xl border border-slate-700 text-white outline-none focus:border-emerald-500">
                              {Object.keys(MAIN_PROBS["genshin"]?.[elixirTargetPart] || {}).map(m => <option key={m} value={m}>{t(m)}</option>)}
                            </select>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold mb-1">{lang === 'ja' ? 'サブ1' : 'Sub 1'}</p>
                            <select value={elixirSub1} onChange={e => setElixirSub1(e.target.value)} className="w-full bg-slate-800 text-[10px] p-2 rounded-xl border border-slate-700 text-white outline-none focus:border-emerald-500">
                              {config.subStats.map(s => <option key={s} value={s}>{t(s)}</option>)}
                            </select>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold mb-1">{lang === 'ja' ? 'サブ2' : 'Sub 2'}</p>
                            <select value={elixirSub2} onChange={e => setElixirSub2(e.target.value)} className="w-full bg-slate-800 text-[10px] p-2 rounded-xl border border-slate-700 text-white outline-none focus:border-emerald-500">
                              {config.subStats.map(s => <option key={s} value={s}>{t(s)}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-slate-950/50 p-4 rounded-2xl border border-yellow-900/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-yellow-400 flex items-center gap-2">
                        ♻️ {lang === 'ja' ? '聖遺物廻聖を利用する' : `Use ${t('strongbox')}`}
                      </label>
                    </div>
                    <button onClick={() => setUseStrongbox(!useStrongbox)} className={`w-10 h-5 rounded-full relative transition-colors ${useStrongbox ? 'bg-yellow-500' : 'bg-slate-700'}`}>
                      <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${useStrongbox ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

                <button onClick={() => handleSimulate()} disabled={isSimulating} className={`w-full py-4 rounded-2xl font-black text-sm shadow-2xl transition-all ${isSimulating ? 'bg-slate-800 text-slate-600' : `bg-gradient-to-r ${config.gradient} text-white hover:scale-[1.02] active:scale-[0.98]`}`}>
                  {isSimulating ? t('simulating').toUpperCase() : t('run').toUpperCase()}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div ref={cardRef} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col items-center relative overflow-hidden min-h-[600px]">
              {simMode === "upgrade" && result && upgradeResult ? (
                <div className="w-full space-y-12 animate-in fade-in duration-500">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{t('upgrade')}</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-[0.3em]">{lang === 'ja' ? `${days}日間の厳選による更新期待度` : `Upgrade expectation from ${days} days`}</p>
                  </div>
                  <div className="bg-slate-950/50 p-10 rounded-[50px] border border-slate-800 text-center">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-4">{lang === 'ja' ? '全体のビルド更新確率' : 'Overall Improvement Chance'}</p>
                    <p className="text-8xl font-black text-white tracking-tighter mb-4">{upgradeResult.overallProb.toFixed(1)}<span className="text-2xl text-slate-500">%</span></p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {upgradeResult.slotResults.map((res: any) => (
                      <div key={res.slot} className="bg-slate-900/50 p-6 rounded-[32px] border border-slate-800">
                        <p className="text-[10px] text-slate-500 font-black uppercase mb-4">{t(res.slot)}</p>
                        <p className="text-4xl font-black text-white tracking-tighter">{res.prob.toFixed(1)}%</p>
                        <p className="text-[9px] text-slate-600 font-bold uppercase mt-4">+{res.avgIncrease.toFixed(1)} {t('score_unit')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  {!result && !isSimulating && (
                    <div className="text-center space-y-4 opacity-50 py-20">
                      <div className="text-8xl">🎲</div>
                      <p className="text-xl font-bold">{lang === 'ja' ? '条件を入力して実行してください' : 'Enter criteria and run'}</p>
                    </div>
                  )}
                  {isSimulating && (
                    <div className="flex flex-col items-center gap-6 w-full max-w-md py-10">
                      <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin border-blue-500"></div>
                      <div className="w-full text-center">
                        <p className="font-bold text-lg animate-pulse">{t('simulating')} {simProgress}%</p>
                      </div>
                    </div>
                  )}
                  {result && !isSimulating && (
                    <div className="w-full space-y-4 animate-in zoom-in-95 duration-300">
                      <div className="bg-slate-900/30 p-5 rounded-[24px] border border-slate-800 mb-4">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Zap size={14} className="text-blue-400" /> {t('luckSlider')}
                          </h3>
                          <div className={`px-4 py-1.5 rounded-full text-xs font-black ${luckPercentile <= 25 ? 'bg-emerald-600' : luckPercentile <= 50 ? 'bg-blue-600' : 'bg-rose-600'}`}>
                            {t('topLuck', luckPercentile)}
                          </div>
                        </div>
                        <div className="relative px-2 pt-8 pb-4">
                          <input type="range" min="10" max="90" step="1" value={luckPercentile} onChange={e => setLuckPercentile(Number(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"/>
                          <div className="absolute top-0 left-0 right-0 h-8 text-[9px] font-bold text-slate-600">
                            <span className="absolute left-0 -translate-x-1/2">{t('luck10')}</span>
                            <span className="absolute left-[18.75%] -translate-x-1/2 text-emerald-500">{t('luck25')}</span>
                            <span className="absolute left-[50%] -translate-x-1/2">{t('luck50')}</span>
                            <span className="absolute left-[81.25%] -translate-x-1/2 text-rose-400">{t('luck75')}</span>
                            <span className="absolute left-[100%] -translate-x-1/2">{t('luck90')}</span>
                          </div>
                        </div>
                      </div>

                      {result.type === "target" && (
                        <div className="space-y-6">
                          <h3 className="text-center text-xl font-bold">{lang === 'ja' ? '目標到達までの日数' : 'Estimated Days to Target'}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[40px] text-center">
                              <p className="text-[10px] text-slate-500 font-black uppercase mb-1">{t('luck50')}</p>
                              <p className="text-6xl font-black text-white tracking-tighter">{result.median} <span className="text-xl font-bold text-slate-600 uppercase">{t('days_unit')}</span></p>
                            </div>
                            {(() => {
                              const currentLuckRes = sortedResults[Math.floor((luckPercentile / 100) * (sortedResults.length - 1))];
                              const currentDays = Math.ceil((currentLuckRes?.attempts * staminaCost) / staminaPerDay);
                              return (
                                <div className="bg-slate-800/30 p-8 rounded-[40px] border border-white/5 text-center">
                                  <p className="text-[10px] text-slate-500 font-black uppercase mb-1">{t('topLuck', luckPercentile)}</p>
                                  <p className="text-6xl font-black text-white tracking-tighter">{currentDays} <span className="text-xl font-bold text-slate-600 uppercase">{t('days_unit')}</span></p>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      )}

                      {result.type === "period" && (
                        <div className="space-y-12">
                          <div className="text-center space-y-4">
                            <h3 className="text-3xl font-black text-white uppercase">{lang === 'ja' ? `${days}日間の厳選期待値` : `${days} Days Expected Score`}</h3>
                            {(() => {
                              const currentLuckRes = sortedResults[Math.floor((luckPercentile / 100) * (sortedResults.length - 1))];
                              const currentScore = currentLuckRes?.score || 0;
                              return (
                                <div className="bg-slate-900/50 p-8 rounded-[40px] border border-slate-800 shadow-xl max-w-2xl mx-auto">
                                  <p className="text-7xl font-black text-white tracking-tighter">{currentScore.toFixed(2)} <span className="text-xl font-bold text-slate-600 uppercase">{t('score_unit')}</span></p>
                                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-8">
                                    {Object.entries(currentLuckRes?.pieces || {}).map(([slot, art]: [string, any]) => (
                                      <div key={slot} className="bg-slate-900/40 border border-slate-800 p-4 rounded-3xl relative overflow-hidden">
                                        {art?.isElixir && <div className="absolute top-0 right-0 bg-yellow-500 text-slate-950 text-[6px] font-black px-1.5 py-0.5 rounded-bl-lg uppercase">祝聖</div>}
                                        <p className="text-[9px] text-slate-500 font-black uppercase mb-2 truncate">{t(slot)}</p>
                                        <p className="text-sm font-black text-white">{art?.score.toFixed(1)}</p>
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
                            <h3 className="text-xl font-bold text-white">{t('topLuck', result.percentile.toFixed(1))}</h3>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800/30 p-6 rounded-[32px] border border-white/5 text-center">
                              <p className="text-[10px] text-slate-500 font-black uppercase mb-2">{t('yourScore')}</p>
                              <p className="text-5xl font-black text-white tracking-tighter">{result.userScore}</p>
                            </div>
                            <div className="bg-slate-800/30 p-6 rounded-[32px] border border-white/5 text-center">
                              <p className="text-[10px] text-slate-500 font-black uppercase mb-2">{t('avgScore', days)}</p>
                              <p className="text-5xl font-black text-white tracking-tighter">{result.median.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-8 border-t border-slate-800/50 mt-6 w-full">
                <button onClick={downloadImage} className="flex items-center gap-2 px-8 py-3 bg-white text-slate-950 font-black text-sm rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all">
                  <Share2 size={18} />
                  <span>{t('share')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-20 pb-12 border-t border-slate-800/50 pt-12 text-center">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
             <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
             <a href="https://github.com/bonta9puri-commits/artifact-sim-web/" target="_blank" rel="noopener" className="hover:text-white transition-colors">GitHub</a>
          </div>
          <div className="space-y-2 max-w-2xl mx-auto">
            <p className="text-[9px] text-slate-500 leading-relaxed mb-4">{t('disclaimer')}</p>
            <p className="text-[9px] text-slate-600 font-medium tracking-widest">© 2026 ARTIFACT-SIM.COM. ALL RIGHTS RESERVED.</p>
          </div>
        </footer>
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="relative w-80 bg-slate-900 h-full border-l border-slate-800 p-8 shadow-2xl flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-black">Menu</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              <div className="mb-6 space-y-3">
                <button 
                  onClick={() => { setTutorialStep(0); setIsDrawerOpen(false); }}
                  className="w-full flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl group hover:bg-blue-500/20 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles size={20} className="text-blue-400" />
                    <div>
                      <p className="text-sm font-black text-white">{lang === 'ja' ? 'クイックツアー' : 'Quick Tour'}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Interactive Guide</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
                </button>
                <Link 
                  href="/blog" 
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl group hover:bg-emerald-500/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen size={20} className="text-emerald-500" />
                    <div>
                      <p className="text-sm font-black text-white">{t('guide')}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Usage & Knowledge</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-emerald-500 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Sim History</p>
              {history.length === 0 && <p className="text-center text-slate-600 py-10 italic">履歴はありません</p>}
              {[...history].reverse().map((item, i) => (
                <div key={i} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-blue-400">{item.result?.type === "target" ? "🎯 目標診断" : "⏳ 期間シミュ"}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-300 truncate mb-3">{item.character}</div>
                  <button onClick={() => { setResult(item.result); setIsDrawerOpen(false); }} className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-[10px] font-bold">復元</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MOBILE FLOATING BAR */}
      <div className="lg:hidden fixed bottom-6 left-4 right-4 z-40 flex gap-3">
        <button 
          onClick={() => setIsMobileSettingsOpen(true)}
          className="flex-1 bg-slate-900/90 border border-white/10 backdrop-blur-xl text-white py-4 rounded-2xl font-black text-xs shadow-2xl flex items-center justify-center gap-2"
        >
          <Settings2 size={16} /> {t('settings').toUpperCase()}
        </button>
        <button 
          onClick={() => handleSimulate()}
          disabled={isSimulating}
          className={`flex-[2] bg-gradient-to-r ${config.gradient} text-white py-4 rounded-2xl font-black text-xs shadow-2xl flex items-center justify-center gap-2 disabled:opacity-50`}
        >
          <Zap size={16} /> {isSimulating ? t('simulating').toUpperCase() : t('run').toUpperCase()}
        </button>
      </div>
    </main>
  );
}
