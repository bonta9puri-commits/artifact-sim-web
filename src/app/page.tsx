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
import { BarChart, Bar, XAxis, Tooltip, ReferenceLine, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, YAxis, AreaChart, Area } from 'recharts';
import { Link2, Sparkles, Zap, Shield, Sword, LayoutGrid, BookOpen, Target, Calendar, MessageSquare, ChevronLeft, ChevronRight, X, Share2, Settings2, ChevronDown, ChevronUp } from 'lucide-react';

function toKatakana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) + 0x60);
  });
}

interface SearchableSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

function SearchableSelect({ value, onChange, options, placeholder = "選択してください..." }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter(opt => {
    if (!search) return true;
    const query = toKatakana(search.toLowerCase());
    const label = toKatakana(opt.label.toLowerCase());
    const val = toKatakana(opt.value.toLowerCase());
    return label.includes(query) || val.includes(query);
  });

  const selectedOpt = options.find(o => o.value === value);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); setSearch(""); }}
        className="w-full bg-slate-850 border border-slate-700 rounded-xl p-3 text-left text-white outline-none focus:border-blue-500 transition-all flex justify-between items-center text-xs"
      >
        <span className="truncate">{selectedOpt ? selectedOpt.label : placeholder}</span>
        <span className="text-[10px] text-slate-500">▼</span>
      </button>
      
      {isOpen && (
        <div className="absolute z-[999] mt-1 w-full bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 space-y-2 max-h-80 flex flex-col">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="検索..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white outline-none focus:border-blue-500 shrink-0"
            autoFocus
          />
          <div className="overflow-y-auto pr-1 space-y-1 custom-scrollbar text-xs flex-1">
            {filtered.length === 0 ? (
              <div className="text-slate-500 p-2 text-center">該当なし</div>
            ) : (
              filtered.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg transition-colors truncate block ${opt.value === value ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [lang, setLang] = useState<"ja" | "en">("ja");
  const [showShareToast, setShowShareToast] = useState(false);

  const charJaToEnMap: Record<string, string> = {
    "ヌヴィレット": "neuvillette",
    "フリーナ": "furina",
    "ナヒーダ": "nahida",
    "雷電将軍": "raiden",
    "鍾離": "zhongli",
    "甘雨": "ganyu",
    "胡桃": "hutao",
    "神里綾華": "ayaka",
    "八重神子": "yae",
    "夜蘭": "yelan",
    "放浪者": "wanderer",
    "ムアラニ": "mualani",
    "キィニチ": "kinich",
    "シロネン": "xilonen",
    "タルタリヤ": "tartaglia",
    "楓原万葉": "kazuha",
    "珊瑚宮心海": "kokomi",
    "ニィロウ": "nilou",
    "アルハイゼン": "alhaitham",
    "セノ": "cyno",
    "エウルア": "eula",
    "荒瀧一斗": "itto",
    "申鶴": "shenhe",
    "ナヴィア": "navia",
    "クロリンデ": "clorinde",
    "エミリエ": "emilie",
    "ニコ・リヤン": "nicole"
  };

  const copyShareLink = () => {
    if (typeof window === 'undefined') return;
    const charKey = charJaToEnMap[characterName] || characterName.toLowerCase();
    const params = new URLSearchParams();
    params.set('game', gameId);
    params.set('char', charKey);
    params.set('score', targetScore.toString());
    params.set('resin', staminaPerDay.toString());
    params.set('recycle', useStrongbox ? '1' : '0');

    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    });
  };

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
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    char: true,
    main: false,
    sub: false,
    sim: false
  });

  const getMainStatsSummary = () => {
    const parts = gameId === "genshin" ? ["時の砂", "空の杯", "理の冠"] : gameId === "starrail" ? ["胴体", "脚部", "次元界オーブ", "連結縄"] : ["スロット4", "スロット5", "スロット6"];
    const summary = parts.map(p => {
      const stat = mainStats[p];
      return stat ? t(stat).substring(0, 4) : "";
    }).filter(Boolean).join("/");
    return summary || (lang === 'ja' ? "固定のみ" : "Fixed Only");
  };

  const getChartData = () => {
    if (!sortedResults || sortedResults.length === 0 || !result) return [];
    const pointsCount = 20;
    const chartData = [];
    
    if (result.type === "target") {
      for (let i = 0; i <= pointsCount; i++) {
        const percent = Math.round((i / pointsCount) * 100);
        const idx = Math.min(sortedResults.length - 1, Math.floor((percent / 100) * (sortedResults.length - 1)));
        const res = sortedResults[idx];
        const d = res ? Math.ceil((res.attempts * staminaCost) / staminaPerDay) : 0;
        chartData.push({
          percent, 
          value: d, 
        });
      }
      return chartData;
    } else if (result.type === "period") {
      const sortedByScore = [...sortedResults].sort((a, b) => a.score - b.score);
      for (let i = 0; i <= pointsCount; i++) {
        const percent = Math.round((i / pointsCount) * 100);
        const idx = Math.min(sortedByScore.length - 1, Math.floor((percent / 100) * (sortedByScore.length - 1)));
        const res = sortedByScore[idx];
        chartData.push({
          percent, 
          value: res ? Number(res.score.toFixed(1)) : 0, 
        });
      }
      return chartData;
    } else if (result.type === "rank") {
      const sortedByScore = [...sortedResults].sort((a, b) => a.score - b.score);
      for (let i = 0; i <= pointsCount; i++) {
        const percent = Math.round((i / pointsCount) * 100);
        const idx = Math.min(sortedByScore.length - 1, Math.floor((percent / 100) * (sortedByScore.length - 1)));
        const res = sortedByScore[idx];
        chartData.push({
          percent,
          value: res ? Number(res.score.toFixed(1)) : 0,
        });
      }
      return chartData;
    }
    return [];
  };
  
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

    // 設定のロード (URLパラメータ & localStorage)
  useEffect(() => {
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const urlGame = urlParams?.get('game');
    
    // URLのgameIdが現在のgameIdと異なる場合は、gameIdを切り替えて次のuseEffectサイクルに引き渡す
    if (urlGame && urlGame !== gameId && ["genshin", "starrail", "zzz"].includes(urlGame)) {
      setGameId(urlGame as GameId);
      return;
    }

    const savedSettings = localStorage.getItem(`sim_settings_${gameId}`);
    let loadedSettings: any = {};
    if (savedSettings) {
      try {
        loadedSettings = JSON.parse(savedSettings);
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }

    // URLパラメータの適用 (最優先)
    const urlChar = urlParams?.get('char');
    const urlScore = urlParams?.get('score');
    const urlResin = urlParams?.get('resin');
    const urlRecycle = urlParams?.get('recycle');

    if (urlScore) loadedSettings.targetScore = Number(urlScore);
    if (urlResin) loadedSettings.staminaPerDay = Number(urlResin);
    if (urlRecycle) setUseStrongbox(urlRecycle === '1');

    if (urlChar) {
      const charEnToJaMap: Record<string, string> = {
        "neuvillette": "ヌヴィレット",
        "furina": "フリーナ",
        "nahida": "ナヒーダ",
        "raiden": "雷電将軍",
        "raiden_shogun": "雷電将軍",
        "zhongli": "鍾離",
        "ganyu": "甘雨",
        "hutao": "胡桃",
        "hu_tao": "胡桃",
        "ayaka": "神里綾華",
        "yae": "八重神子",
        "yelan": "夜蘭",
        "wanderer": "放浪者",
        "mualani": "ムアラニ",
        "kinich": "キィニチ",
        "xilonen": "シロネン",
        "tartaglia": "タルタリヤ",
        "kazuha": "楓原万葉",
        "kokomi": "珊瑚宮心海",
        "nilou": "ニィロウ",
        "alhaitham": "アルハイゼン",
        "cyno": "セノ",
        "eula": "エウルア",
        "itto": "荒瀧一斗",
        "shenhe": "申鶴",
        "navia": "ナヴィア",
        "clorinde": "クロリンデ",
        "emilie": "エミリエ",
        "nicole": "ニコ・リヤン"
      };
      const charKey = urlChar.toLowerCase();
      const mappedJaName = charEnToJaMap[charKey];
      const configForGame = GAME_CONFIGS[gameId];
      if (mappedJaName && configForGame.characters.some(c => c.name === mappedJaName)) {
        setCharacterName(mappedJaName);
      } else {
        const found = configForGame.characters.find(c => c.name.toLowerCase() === charKey);
        if (found) setCharacterName(found.name);
      }
    }

    // 各ステートへの反映
    if (loadedSettings.targetScore) setTargetScore(loadedSettings.targetScore);
    if (loadedSettings.scoreWeights) setScoreWeights(loadedSettings.scoreWeights);
    if (loadedSettings.mainStats) setMainStats(loadedSettings.mainStats);
    if (loadedSettings.userPartScores) setUserPartScores(loadedSettings.userPartScores);
    if (loadedSettings.staminaPerDay) setStaminaPerDay(loadedSettings.staminaPerDay);

    if (!savedSettings) {
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
      
      setTargetScore(gameId === "genshin" ? 180 : 420);
      
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
      setStaminaPerDay(gameId === "genshin" ? 180 : 240);
    }
  }, [gameId, config]);

    // 設定の保存
  useEffect(() => {
    const settings = { targetScore, scoreWeights, mainStats, userPartScores, staminaPerDay };
    localStorage.setItem(`sim_settings_${gameId}`, JSON.stringify(settings));
  }, [gameId, targetScore, scoreWeights, mainStats, userPartScores, staminaPerDay]);

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

      const sortedMinus10 = [...results].sort((a, b) => a.attemptsMinus10 - b.attemptsMinus10);
      const medianMinus10 = Math.ceil((sortedMinus10[Math.floor(trials / 2)].attemptsMinus10 * staminaCost) / staminaPerDay);
      const worst5Days = Math.ceil((results[Math.floor(trials * 0.95)].attempts * staminaCost) / staminaPerDay);
  
      const finalRes = {
        type: "target",
        median: Math.ceil((medianRes.attempts * staminaCost) / staminaPerDay),
        top10: Math.ceil((top10Res.attempts * staminaCost) / staminaPerDay),
        bottom10: Math.ceil((bottom10Res.attempts * staminaCost) / staminaPerDay),
        medianWithoutElixir: medianBase ? Math.ceil((medianBase.attempts * staminaCost) / staminaPerDay) : null,
        medianMinus10,
        worst5Days,
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
        const worst5Score = results[Math.floor(trials * 0.95)].score;
        const avgBonus = results.reduce((acc, r) => acc + (r.score - (r.scoreBeforeElixir || r.score)), 0) / trials;

        const finalRes = {
          type: "period",
          median: medianRes.score,
          top10: top10Res.score,
          bottom10: bottom10Res.score,
          worst5Score,
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
                            ? `${result.top10} ${t('days_unit')}`
                            : `${result.top10.toFixed(1)} ${t('score_unit')}`
                          }
                        </p>
                      </div>
                      <div className="text-center border-l border-white/10">
                        <p className="text-[9px] text-rose-400 font-black uppercase tracking-widest mb-2">LUCK: BOTTOM 10%</p>
                        <p className="text-3xl font-black text-white leading-none tracking-tighter">
                          {result.type === "target"
                            ? `${result.bottom10} ${t('days_unit')}`
                            : `${result.bottom10.toFixed(1)} ${t('score_unit')}`
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
            {/* --- CONDITIONS SUMMARY ON CARD --- */}
            {result && (
              <div className="z-10 w-full mb-8 bg-white/5 border border-white/10 rounded-[24px] p-5 flex flex-wrap justify-around items-center gap-3 backdrop-blur-xl">
                {result.type === "target" ? (
                  <div className="text-center">
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">{lang === "ja" ? "目標スコア" : "Target Score"}</p>
                    <p className="text-xs font-black text-white">{targetScore} {t('score_unit')}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">{lang === "ja" ? "厳選日数" : "Farming Days"}</p>
                    <p className="text-xs font-black text-white">{days} {t('days_unit')}</p>
                  </div>
                )}

                <div className="w-px h-6 bg-white/10"></div>

                <div className="text-center">
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">
                    {gameId === "genshin" 
                      ? (lang === "ja" ? "1日の消費樹脂" : "Resin / Day")
                      : gameId === "starrail"
                        ? (lang === "ja" ? "1日の消費開拓力" : "Stamina / Day")
                        : (lang === "ja" ? "1日の消費バッテリー" : "Battery / Day")}
                  </p>
                  <p className="text-xs font-black text-white">{staminaPerDay}</p>
                </div>

                <div className="w-px h-6 bg-white/10"></div>

                <div className="text-center">
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">{lang === "ja" ? "聖遺物廻聖" : "Strongbox"}</p>
                  <p className={`text-xs font-black ${useStrongbox ? "text-emerald-400" : "text-slate-400"}`}>{useStrongbox ? "ON" : "OFF"}</p>
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
              
              <div className="space-y-4">
                {/* モード切り替え (アコーディオンから出して常時表示) */}
                <div className="flex flex-col gap-2 bg-slate-950/30 p-2.5 rounded-2xl border border-slate-800/80">
                  <div className="grid grid-cols-2 gap-1.5">
                    <button type="button" onClick={() => setSimMode("target")} className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${simMode === "target" ? "bg-blue-600 text-white shadow-lg" : "bg-slate-800 text-slate-400 hover:bg-slate-750"}`}>{t('target')}</button>
                    <button type="button" onClick={() => setSimMode("period")} className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${simMode === "period" ? "bg-blue-600 text-white shadow-lg" : "bg-slate-800 text-slate-400 hover:bg-slate-750"}`}>{t('period')}</button>
                    <button type="button" onClick={() => setSimMode("rank")} className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${simMode === "rank" ? "bg-blue-600 text-white shadow-lg" : "bg-slate-800 text-slate-400 hover:bg-slate-750"}`}>{t('rank')}</button>
                    <button type="button" onClick={() => setSimMode("upgrade")} className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${simMode === "upgrade" ? "bg-blue-600 text-white shadow-lg" : "bg-slate-800 text-slate-400 hover:bg-slate-750"}`}>{t('upgrade')}</button>
                  </div>
                </div>

                {/* アコーディオン 1: 🎮 キャラクター設定 */}
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/50">
                  <button
                    type="button"
                    onClick={() => setOpenSections(prev => ({ ...prev, char: !prev.char }))}
                    className="w-full flex justify-between items-center p-3.5 bg-slate-900/80 hover:bg-slate-850 transition-all text-left border-b border-slate-800"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-white">① 🎮 {t('character')} & セット</span>
                      {!openSections.char && (
                        <span className="text-[10px] text-slate-500 font-medium truncate max-w-[200px]">
                          {t(characterName)} / {targetSets.filter(s => s && s !== "未選択").map(s => t(s)).join(', ') || (lang === 'ja' ? 'その他' : 'Other')}
                        </span>
                      )}
                    </div>
                    {openSections.char ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </button>
                  {openSections.char && (
                    <div className="p-4 space-y-4 bg-slate-950/20">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-2">{t('character')}</label>
                        <div className="flex flex-wrap gap-1 mb-2.5">
                          <button type="button" onClick={() => setElementFilter("ALL")} className={`px-2.5 py-1 rounded-full text-[9px] font-bold transition-all ${elementFilter === "ALL" ? 'bg-slate-700 text-white shadow-lg' : 'bg-slate-950 text-slate-600 border border-slate-800'}`}>ALL</button>
                          {Array.from(new Set(config.characters.map(c => c.element))).filter(e => e !== "無" && e !== "その他").map(el => (
                            <button type="button" key={el} onClick={() => setElementFilter(el)} className={`px-2.5 py-1 rounded-full text-[9px] font-bold transition-all ${elementFilter === el ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-950 text-slate-600 border border-slate-800'}`}>{el}</button>
                          ))}
                        </div>
                        <SearchableSelect
                          value={characterName}
                          onChange={(val) => setCharacterName(val)}
                          options={config.characters.filter(c => elementFilter === "ALL" || c.element === elementFilter).map(c => ({
                            value: c.name,
                            label: c.defaults ? `✨ ${t(c.name)}` : t(c.name)
                          }))}
                          placeholder={lang === 'ja' ? "キャラクターを選択..." : "Select Character..."}
                        />
                      </div>

                      <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                        <label className="block text-[11px] font-bold text-slate-400 mb-2.5">{t('targetSets')}</label>
                        <div className="grid grid-cols-1 gap-2.5">
                          {targetSets.map((setName, idx) => (
                            <div key={idx} className="space-y-1">
                              <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest leading-none">
                                {lang === 'ja' 
                                  ? (gameId === "starrail" ? (idx === 0 ? "遺物1 (本命)" : idx === 1 ? "遺物2 (副産物)" : idx === 2 ? "オーナメント1 (本命)" : "オーナメント2 (副産物)") : (idx === 0 ? "セット1 (本命)" : idx === 1 ? "セット2 (副産物)" : idx === 2 ? "別秘境セット1" : "別秘境セット2"))
                                  : (gameId === "starrail" ? (idx === 0 ? "Relic 1 (Primary)" : idx === 1 ? "Relic 2 (Sub)" : idx === 2 ? "Planar 1 (Primary)" : "Planar 2 (Sub)") : (idx === 0 ? "Set 1 (Primary)" : idx === 1 ? "Set 2 (Sub)" : idx === 2 ? "Other 1" : "Other 2"))}
                              </p>
                              <SearchableSelect
                                value={setName}
                                onChange={(val) => {
                                  const newSets = [...targetSets];
                                  newSets[idx] = val;
                                  const pair = SET_PAIRS[gameId][val];
                                  if (pair) {
                                    if (idx === 0 && !newSets[1]) newSets[1] = pair;
                                    if (idx === 2 && !newSets[3]) newSets[3] = pair;
                                  }
                                  setTargetSets(newSets);
                                }}
                                options={[
                                  { value: "", label: lang === 'ja' ? '未選択 (None)' : 'None' },
                                  ...config.sets.map(s => ({ value: s, label: t(s) }))
                                ]}
                                placeholder={lang === 'ja' ? "セットを選択..." : "Select Set..."}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* アコーディオン 2: 🔮 メインステータス */}
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/50">
                  <button
                    type="button"
                    onClick={() => setOpenSections(prev => ({ ...prev, main: !prev.main }))}
                    className="w-full flex justify-between items-center p-3.5 bg-slate-900/80 hover:bg-slate-850 transition-all text-left border-b border-slate-800"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-white">② 🔮 {t('mainStats')}</span>
                      {!openSections.main && (
                        <span className="text-[10px] text-slate-500 font-medium truncate max-w-[200px]">
                          {getMainStatsSummary()}
                        </span>
                      )}
                    </div>
                    {openSections.main ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </button>
                  {openSections.main && (
                    <div className="p-4 bg-slate-950/20">
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                        {config.slots.filter(s => s !== "未選択").map(slot => {
                          const isFixed = slot.includes("花") || slot.includes("羽") || slot === "頭部" || slot === "手部" || slot === "スロット1" || slot === "スロット2" || slot === "スロット3";
                          return (
                            <div key={slot} className="flex items-center justify-between gap-4 py-1 border-b border-slate-900 last:border-0">
                              <span className="text-xs text-slate-400 whitespace-nowrap">{t(slot)}</span>
                              {isFixed ? (
                                <span className="text-xs text-slate-500 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 flex-1 text-right max-w-[160px]">
                                  {slot.includes("花") || slot === "頭部" || slot === "スロット1" ? t("HP(固定値)") : slot.includes("羽") || slot === "手部" || slot === "スロット2" ? t("攻撃力(固定値)") : t("防御力(固定値)")}
                                </span>
                              ) : (
                                <select value={mainStats[slot] || ""} onChange={e => setMainStats({...mainStats, [slot]: e.target.value})} className="bg-slate-800 text-xs p-2 rounded-xl border border-slate-700 flex-1 outline-none text-white max-w-[160px]">
                                  {Object.keys(MAIN_PROBS[gameId][slot] || {}).map(m => <option key={m} value={m}>{t(m)}</option>)}
                                </select>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* アコーディオン 3: ⚖️ サブ重み・廻聖・エリクシル */}
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/50">
                  <button
                    type="button"
                    onClick={() => setOpenSections(prev => ({ ...prev, sub: !prev.sub }))}
                    className="w-full flex justify-between items-center p-3.5 bg-slate-900/80 hover:bg-slate-850 transition-all text-left border-b border-slate-800"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-white">③ ⚖️ サブ重み・廻聖・エリクシル</span>
                      {!openSections.sub && (
                        <span className="text-[10px] text-slate-500 font-medium truncate max-w-[200px]">
                          廻聖:{useStrongbox ? "ON" : "OFF"} / {gameId === "genshin" ? `エリクシル:${elixirEnabled ? "ON" : "OFF"}` : ""}
                        </span>
                      )}
                    </div>
                    {openSections.sub ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </button>
                  {openSections.sub && (
                    <div className="p-4 space-y-4 bg-slate-950/20">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-2">{t('weights')}</label>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                          {config.subStats.map(sub => (
                            <div key={sub} className="flex flex-col gap-0.5 bg-slate-900/30 p-2 rounded-lg border border-slate-850">
                              <label className="text-[9px] text-slate-500 whitespace-nowrap truncate">{t(sub)}</label>
                              <input inputMode="decimal" pattern="[0-9.]*" type="number" step="0.1" value={scoreWeights[sub] || 0} onChange={e => setScoreWeights({...scoreWeights, [sub]: e.target.value === "" ? 0 : Number(e.target.value)})} className="bg-slate-850 text-xs p-1 rounded border border-slate-700 outline-none text-white w-full text-center"/>
                            </div>
                          ))}
                        </div>
                      </div>

                      {gameId === "genshin" && (
                        <div className="bg-slate-950/50 p-3 rounded-xl border border-emerald-950/60">
                          <div className="flex items-center justify-between mb-3">
                            <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">✨ {t('elixir')}</label>
                            <button type="button" onClick={() => setElixirEnabled(!elixirEnabled)} className={`w-8 h-4 rounded-full relative transition-colors ${elixirEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                              <div className={`w-2.5 h-2.5 bg-white rounded-full absolute top-0.5 transition-all ${elixirEnabled ? 'left-5' : 'left-0.5'}`} />
                            </button>
                          </div>
                          {elixirEnabled && (
                            <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                              <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                  <p className="text-[9px] text-slate-500 font-bold mb-1">{lang === 'ja' ? '初期所持数' : 'Initial Count'}</p>
                                  <input inputMode="numeric" pattern="[0-9]*" type="number" value={elixirInitialCount} onChange={e => setElixirInitialCount(e.target.value === "" ? 0 : Number(e.target.value))} className="w-full bg-slate-800 text-xs p-2 rounded-xl border border-slate-700 text-white outline-none focus:border-emerald-500 text-center"/>
                                </div>
                                <div>
                                  <p className="text-[9px] text-slate-500 font-bold mb-1">{lang === 'ja' ? '1Ver獲得数' : 'Per Ver (42d)'}</p>
                                  <input inputMode="numeric" pattern="[0-9]*" type="number" value={elixirPerVersion} onChange={e => setElixirPerVersion(e.target.value === "" ? 0 : Number(e.target.value))} className="w-full bg-slate-800 text-xs p-2 rounded-xl border border-slate-700 text-white outline-none focus:border-emerald-500 text-center"/>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                  <p className="text-[9px] text-slate-500 font-bold mb-1">{lang === 'ja' ? '部位' : 'Part'}</p>
                                  <select value={elixirTargetPart} onChange={e => setElixirTargetPart(e.target.value)} className="w-full bg-slate-800 text-xs p-2 rounded-xl border border-slate-700 text-white outline-none focus:border-emerald-500">
                                    <option value="生の花">{t('生の花')} (1)</option>
                                    <option value="死の羽">{t('死の羽')} (1)</option>
                                    <option value="時の砂">{t('時の砂')} (2)</option>
                                    <option value="空の杯">{t('空の杯')} (4)</option>
                                    <option value="理の冠">{t('理の冠')} (3)</option>
                                  </select>
                                </div>
                                <div>
                                  <p className="text-[9px] text-slate-500 font-bold mb-1">{lang === 'ja' ? 'セット' : 'Set'}</p>
                                  <select value={elixirTargetSet} onChange={e => setElixirTargetSet(e.target.value)} className="w-full bg-slate-800 text-xs p-2 rounded-xl border border-slate-700 text-white outline-none focus:border-emerald-500">
                                    {targetSets.filter(s => s && s !== "未選択").map(s => <option key={s} value={s}>{s}</option>)}
                                    {targetSets.filter(s => s && s !== "未選択").length === 0 && <option value="">{lang === 'ja' ? 'ダンジョン準拠' : 'Use Domain'}</option>}
                                  </select>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-1.5">
                                <div>
                                  <p className="text-[8px] text-slate-500 font-bold mb-1">{lang === 'ja' ? 'メイン' : 'Main'}</p>
                                  <select value={elixirTargetMain} onChange={e => setElixirTargetMain(e.target.value)} className="w-full bg-slate-800 text-[10px] p-2 rounded-xl border border-slate-700 text-white outline-none focus:border-emerald-500">
                                    {Object.keys(MAIN_PROBS["genshin"]?.[elixirTargetPart] || {}).map(m => <option key={m} value={m}>{t(m)}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <p className="text-[8px] text-slate-500 font-bold mb-1">{lang === 'ja' ? 'サブ1' : 'Sub 1'}</p>
                                  <select value={elixirSub1} onChange={e => setElixirSub1(e.target.value)} className="w-full bg-slate-800 text-[10px] p-2 rounded-xl border border-slate-700 text-white outline-none focus:border-emerald-500">
                                    {config.subStats.map(s => <option key={s} value={s}>{t(s)}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <p className="text-[8px] text-slate-500 font-bold mb-1">{lang === 'ja' ? 'サブ2' : 'Sub 2'}</p>
                                  <select value={elixirSub2} onChange={e => setElixirSub2(e.target.value)} className="w-full bg-slate-800 text-[10px] p-2 rounded-xl border border-slate-700 text-white outline-none focus:border-emerald-500">
                                    {config.subStats.map(s => <option key={s} value={s}>{t(s)}</option>)}
                                  </select>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="bg-slate-950/50 p-3.5 rounded-xl border border-yellow-950/60">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-yellow-500 flex items-center gap-1.5">
                            ♻️ {lang === 'ja' ? '聖遺物廻聖を利用' : `Use ${t('strongbox')}`}
                          </label>
                          <button type="button" onClick={() => setUseStrongbox(!useStrongbox)} className={`w-8 h-4 rounded-full relative transition-colors ${useStrongbox ? 'bg-yellow-500' : 'bg-slate-700'}`}>
                            <div className={`w-2.5 h-2.5 bg-white rounded-full absolute top-0.5 transition-all ${useStrongbox ? 'left-5' : 'left-0.5'}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* アコーディオン 4: 🎯 目標・シミュレーション設定 */}
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/50">
                  <button
                    type="button"
                    onClick={() => setOpenSections(prev => ({ ...prev, sim: !prev.sim }))}
                    className="w-full flex justify-between items-center p-3.5 bg-slate-900/80 hover:bg-slate-850 transition-all text-left border-b border-slate-800"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-white">④ 🎯 目標・現在スコア</span>
                      {!openSections.sim && (
                        <span className="text-[10px] text-slate-500 font-medium truncate max-w-[200px]">
                          {simMode === "target" ? `${t('targetScore')}: ${targetScore}pt` : `${t('farmingDays')}: ${days}日`}
                        </span>
                      )}
                    </div>
                    {openSections.sim ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </button>
                  {openSections.sim && (
                    <div className="p-4 space-y-4 bg-slate-950/20">
                      {simMode === "target" && (
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-400">{t('targetScore')}</label>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {(gameId === "genshin" ? [160, 180, 200, 220, 240] : [360, 390, 420, 450, 480]).map(val => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setTargetScore(val)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${targetScore === val ? `bg-blue-600 border-blue-500 text-white shadow-md` : 'bg-slate-850 border-slate-700 text-slate-400 hover:text-slate-200'}`}
                              >
                                {val}
                              </button>
                            ))}
                          </div>
                          <input inputMode="numeric" pattern="[0-9]*" 
                            type="number" 
                            value={targetScore} 
                            onChange={e => setTargetScore(e.target.value === "" ? 0 : Number(e.target.value))} 
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition-all text-xs"
                          />
                        </div>
                      )}

                      {(simMode === "period" || simMode === "rank" || simMode === "upgrade") && (
                        <div>
                          <label className="block text-xs font-bold text-slate-400 mb-2">{t('farmingDays')}</label>
                          <input inputMode="numeric" pattern="[0-9]*" type="number" value={days} onChange={e => setDays(e.target.value === "" ? 0 : Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-xs"/>
                        </div>
                      )}

                      {(simMode === "rank" || simMode === "upgrade") && (
                        <div className="grid grid-cols-2 gap-2 bg-slate-950/30 p-3 rounded-xl border border-slate-800/50">
                          <p className="col-span-2 text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">{t('currentScores')}</p>
                          {config.slots.filter(s => s !== "未選択").map(slot => (
                            <div key={slot}>
                              <label className="block text-[9px] text-slate-500 mb-0.5">{t(slot)}</label>
                              <input inputMode="decimal" pattern="[0-9.]*" type="number" value={userPartScores[slot] || 0} onChange={e => setUserPartScores({...userPartScores, [slot]: e.target.value === "" ? 0 : Number(e.target.value)})} className="w-full bg-slate-850 border border-slate-750 rounded-lg p-2 text-xs text-white text-center"/>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* シミュレーション開始ボタン */}
                <button type="button" onClick={() => handleSimulate()} disabled={isSimulating} className={`w-full py-3.5 mt-2 rounded-2xl font-black text-sm shadow-2xl transition-all ${isSimulating ? 'bg-slate-800 text-slate-600' : `bg-gradient-to-r ${config.gradient} text-white hover:scale-[1.01] active:scale-[0.99]`}`}>
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
                      <div className="bg-slate-900/30 p-5 rounded-[24px] border border-slate-800 mb-4 w-full">
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

                      {/* 累積確率曲線グラフ (AreaChart) */}
                      {getChartData().length > 0 && (
                        <div className="bg-slate-900/30 border border-slate-800 rounded-[24px] p-5 mb-4 w-full animate-in fade-in duration-300">
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-2.5">
                            {result.type === "target" 
                              ? (lang === "ja" ? "必要日数の累積確率分布 (左ほど豪運、右ほど悲運)" : "Cumulative Probability vs Days (Left = Lucky, Right = Unlucky)")
                              : (lang === "ja" ? "獲得スコアの累積確率分布 (左ほど悲運、右ほど豪運)" : "Cumulative Probability vs Score (Left = Unlucky, Right = Lucky)")
                            }
                          </p>
                          <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={getChartData()} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="colorPercent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <XAxis 
                                  dataKey="value" 
                                  stroke="#475569" 
                                  fontSize={9} 
                                  tickLine={false}
                                  axisLine={false}
                                />
                                <YAxis 
                                  stroke="#475569" 
                                  fontSize={9} 
                                  tickLine={false}
                                  axisLine={false}
                                  tickFormatter={(v) => `${v}%`}
                                />
                                <Tooltip
                                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '10px', color: '#cbd5e1' }}
                                  labelFormatter={(label) => result.type === "target" ? `${label} 日` : `${label} pt`}
                                  formatter={(value) => [`${value}%`, result.type === "target" ? (lang === 'ja' ? "達成確率 (この日数以内で完了)" : "Success Probability") : (lang === 'ja' ? "達成確率 (このスコア以上になる確率)" : "Probability")]}
                                />
                                <Area type="monotone" dataKey="percent" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPercent)" />
                                <ReferenceLine 
                                  x={(() => {
                                    const currentLuckRes = sortedResults[Math.floor((luckPercentile / 100) * (sortedResults.length - 1))];
                                    if (result.type === "target") {
                                      return currentLuckRes ? Math.ceil((currentLuckRes.attempts * staminaCost) / staminaPerDay) : 0;
                                    } else {
                                      return currentLuckRes ? Number(currentLuckRes.score.toFixed(1)) : 0;
                                    }
                                  })()} 
                                  stroke="#ef4444" 
                                  strokeWidth={1.5}
                                  strokeDasharray="3 3"
                                  label={{ 
                                    value: lang === "ja" ? "選択した運勢" : "Selected Luck", 
                                    position: 'top', 
                                    fill: '#f87171', 
                                    fontSize: 8,
                                    fontWeight: 'bold'
                                  }} 
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                      {result.type === "target" && (
                        <div className="space-y-6 w-full">
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

                          {/* マイルストーン & 悲運の安心保証表示 */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-[24px] p-5 text-xs space-y-2">
                              <h4 className="font-black text-blue-400 flex items-center gap-1.5 uppercase tracking-wider">
                                <Target size={14} className="text-blue-400" />
                                {lang === 'ja' ? '📈 育成マイルストーン' : '📈 Upgrade Milestone'}
                              </h4>
                              <p className="text-slate-300 leading-relaxed font-medium">
                                {lang === 'ja' 
                                  ? `目標スコアの10pt手前 (${targetScore - 10} pt) までは、平均して約 ${result.medianMinus10} 日で到達可能です。そこから最後の 10 pt を伸ばすのに、追加で約 ${result.median - result.medianMinus10} 日かかります (聖遺物厳選における典型的な停滞期です)。`
                                  : `Reaching 10pt below target (${targetScore - 10} pt) takes about ${result.medianMinus10} days. Finishing the final 10 pt will require another ${result.median - result.medianMinus10} days (a classic plateau in gear farming).`
                                }
                              </p>
                            </div>
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[24px] p-5 text-xs space-y-2">
                              <h4 className="font-black text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                                <Shield size={14} className="text-emerald-400" />
                                {lang === 'ja' ? '🛡️ ハマり（悲運）の安心保証' : '🛡️ Bad Luck Protection'}
                              </h4>
                              <p className="text-slate-300 leading-relaxed font-medium">
                                {lang === 'ja'
                                  ? `極端に運が悪い下位 5% の「悲運」状態が続いた場合でも、約 ${result.worst5Days} 日厳選を続ければ、95% の高確率で目標スコアを達成可能です。いつかは必ず終わります！`
                                  : `Even if you experience terrible RNG (bottom 5% percentile), you are 95% guaranteed to achieve your target score within ${result.worst5Days} days.`
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {result.type === "period" && (
                        <div className="space-y-12 w-full">
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

                          {/* 期間シミュ向けマイルストーン */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-left">
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-[24px] p-5 text-xs space-y-2">
                              <h4 className="font-black text-blue-400 flex items-center gap-1.5 uppercase tracking-wider">
                                <Target size={14} className="text-blue-400" />
                                {lang === 'ja' ? '📈 スコアの伸び代と上振れ幅' : '📈 Score Potential'}
                              </h4>
                              <p className="text-slate-300 leading-relaxed font-medium">
                                {lang === 'ja'
                                  ? `運勢が「豪運 (上位10%)」まで上振れた場合、合計スコアは ${result.top10?.toFixed(1)} pt まで伸びるポテンシャルがあります。期待値（中央値）より約 ${(result.top10 - result.median)?.toFixed(1)} pt 高くなります。`
                                  : `If you hit a lucky streak (top 10% luck), your score could reach up to ${result.top10?.toFixed(1)} pt, which is ${(result.top10 - result.median)?.toFixed(1)} pt higher than the median.`
                                }
                              </p>
                            </div>
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[24px] p-5 text-xs space-y-2">
                              <h4 className="font-black text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                                <Shield size={14} className="text-emerald-400" />
                                {lang === 'ja' ? '🛡️ 最低保証スコアの目安' : '🛡️ Minimum Score Guarantee'}
                              </h4>
                              <p className="text-slate-300 leading-relaxed font-medium">
                                {lang === 'ja'
                                  ? `運勢が極めて悪い下位 5% の「悲運」状態であっても、${days} 日間厳選を行えば 95% の高確率で合計 ${result.worst5Score?.toFixed(1)} pt 以上の聖遺物セットを確保できます。`
                                  : `Even under terrible RNG (bottom 5% percentile), you are 95% guaranteed to secure at least ${result.worst5Score?.toFixed(1)} pt total score within ${days} days.`
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {result.type === "rank" && (
                        <div className="space-y-8 w-full">
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
                <button onClick={copyShareLink} type="button" className="flex items-center gap-2 px-8 py-3 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-black text-sm rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all">
                  <Link2 size={18} className="text-blue-400" />
                  <span>{lang === 'ja' ? '設定をURLとして保存・共有' : 'Save & Share Settings via URL'}</span>
                </button>
                <a 
                  href="https://www.youtube.com/channel/UCl9ZmeECCvInf8XiNSWduuA" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 px-8 py-3 bg-[#ff0000] hover:bg-[#cc0000] text-white font-black text-sm rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all"
                >
                  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.388.555A3.002 3.002 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.47 20.5 12 20.5 12 20.5s7.53 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>{lang === 'ja' ? 'YouTubeチャンネル' : 'YouTube Channel'}</span>
                </a>
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
        {/* --- TOAST NOTIFICATION --- */}
        {showShareToast && (
          <div className="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-emerald-500/30 text-slate-200 px-6 py-4 rounded-3xl text-[11px] font-bold shadow-2xl flex flex-col gap-1.5 z-[120] animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-sm w-[90%] text-center backdrop-blur-md">
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-black tracking-wide">
              <Zap size={14} className="animate-pulse" />
              <span>{lang === 'ja' ? '現在の設定を含むリンクをコピーしました！' : 'Link with current settings copied!'}</span>
            </div>
            <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
              {lang === 'ja' 
                ? 'このURLをブックマークすれば、いつでもこの設定から再開できます。' 
                : 'Bookmark this URL to resume from these settings anytime.'}
            </p>
          </div>
        )}
        
        {/* --- TUTORIAL OVERLAY --- */}
        {tutorialStep !== null && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-slate-900/95 border border-white/10 rounded-[32px] p-8 max-w-md w-full shadow-2xl text-center backdrop-blur-md relative overflow-hidden flex flex-col items-center">
              <div className={`absolute top-[-50px] right-[-50px] w-36 h-36 rounded-full blur-[80px] opacity-20 bg-gradient-to-br ${config.gradient}`}></div>
              
              <button 
                onClick={closeTutorial} 
                className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors"
                title={lang === "ja" ? "スキップ" : "Skip"}
              >
                <X size={20} />
              </button>

              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/10`}>
                {React.createElement(tutorialSteps[tutorialStep].icon, { size: 32 })}
              </div>

              <h3 className="text-xl font-black text-white mb-4 tracking-tight">
                {tutorialSteps[tutorialStep].title}
              </h3>
              
              <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                {tutorialSteps[tutorialStep].content}
              </p>

              {/* Progress Dots */}
              <div className="flex gap-1.5 mb-6">
                {tutorialSteps.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${tutorialStep === idx ? 'bg-blue-500 w-4' : 'bg-slate-700'}`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between w-full mt-auto gap-4">
                <button 
                  onClick={closeTutorial}
                  className="text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider"
                >
                  {lang === "ja" ? "スキップ" : "Skip"}
                </button>
                
                <div className="flex gap-2">
                  {tutorialStep > 0 && (
                    <button 
                      onClick={() => setTutorialStep(tutorialStep - 1)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-700"
                    >
                      {lang === "ja" ? "戻る" : "Back"}
                    </button>
                  )}
                  
                  <button 
                    onClick={() => {
                      if (tutorialStep < tutorialSteps.length - 1) {
                        setTutorialStep(tutorialStep + 1);
                      } else {
                        closeTutorial();
                      }
                    }}
                    className={`px-5 py-2 bg-gradient-to-r ${config.gradient} text-white rounded-xl text-xs font-black transition-all shadow-md`}
                  >
                    {tutorialStep < tutorialSteps.length - 1 
                      ? (lang === "ja" ? "次へ" : "Next")
                      : (lang === "ja" ? "スタート！" : "Start!")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
  );
}
