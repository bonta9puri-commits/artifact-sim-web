import { CharacterData } from './game_data';

export const GENSHIN_CHARACTERS: CharacterData[] = [
  { 
    name: "ヌヴィレット", 
    element: "水", 
    defaults: {
      weights: { "会心率": 2, "会心ダメージ": 1, "HP%": 1, "元素熟知": 0.3 },
      mainStats: { "時の砂": "HP%", "空の杯": "水元素ダメージ", "理の冠": "会心ダメージ" },
      targetSets: ["ファントムハンター", "黄金の劇団"],
      baseStats: { rate: 5, dmg: 88.4, atk: 0, hp: 100, def: 0, er: 120, em: 40, scalingMode: "hp" }
    }
  },
  { 
    name: "フリーナ", 
    element: "水", 
    defaults: {
      weights: { "会心率": 2, "会心ダメージ": 1, "HP%": 1, "元素チャージ効率": 0.8 },
      mainStats: { "時の砂": "HP%", "空の杯": "HP%", "理の冠": "会心率" },
      targetSets: ["黄金の劇団"],
      baseStats: { rate: 24.2, dmg: 50, atk: 0, hp: 80, def: 0, er: 160, em: 0, scalingMode: "hp" }
    }
  },
  { 
    name: "ナヒーダ", 
    element: "草", 
    defaults: {
      weights: { "会心率": 1.6, "会心ダメージ": 0.8, "元素熟知": 1, "攻撃力%": 0.2 },
      mainStats: { "時の砂": "元素熟知", "空の杯": "元素熟知", "理の冠": "会心率" },
      targetSets: ["深林の記憶", "金メッキの夢"],
      baseStats: { rate: 5, dmg: 50, atk: 0, hp: 0, def: 0, er: 120, em: 250, scalingMode: "em" as any }
    }
  },
  { 
    name: "雷電将軍", 
    element: "雷", 
    defaults: {
      weights: { "会心率": 2, "会心ダメージ": 1, "元素チャージ効率": 1, "攻撃力%": 0.8 },
      mainStats: { "時の砂": "元素チャージ効率", "空の杯": "攻撃力%", "理の冠": "会心率" },
      targetSets: ["絶縁の旗印"],
      baseStats: { rate: 5, dmg: 50, atk: 50, hp: 0, def: 0, er: 250, em: 0, scalingMode: "atk" }
    }
  },
  { name: "アルレッキーノ", element: "炎" },
  { name: "鍾離", element: "岩" },
  { name: "甘雨", element: "氷" },
  { name: "胡桃", element: "炎" },
  { name: "神里綾華", element: "氷" },
  { name: "八重神子", element: "雷" },
  { name: "夜蘭", element: "水" },
  { name: "放浪者", element: "風" },
  { name: "ムアラニ", element: "水" },
  { name: "キィニチ", element: "草" },
  { name: "その他", element: "無" }
];

export const GENSHIN_SETS = [
  "剣闘士のフィナーレ", "大地を流浪する楽団", "翠緑の影", "氷風を彷徨う勇士",
  "沈淪の心", "逆飛びの流星", "悠久の磐岩", "千岩牢固", "蒼白の炎",
  "追憶のしめ縄", "絶縁の旗印", "華館夢醒形骸記", "海染硨磲", "辰砂往生録",
  "来歆の余響", "深林の記憶", "金メッキの夢", "砂上の楼閣の史話", "楽園の絶花",
  "水仙の夢", "花海甘露の光", "ファントムハンター", "黄金の劇団", "残響の森の夜話", "往日の歌", "諧律の奇想曲", "未完成の叙事詩", "黒い黒晶の断章", "その他"
];

export const GENSHIN_SLOTS = ["生の花", "死の羽", "時の砂", "空の杯", "理の冠"];

export const GENSHIN_MAIN_STATS = [
  "HP(固定値)", "攻撃力(固定値)", "防御力(固定値)",
  "HP%", "攻撃力%", "防御力%", "元素熟知", "元素チャージ効率",
  "会心率", "会心ダメージ", "与える治癒効果",
  "炎元素ダメージ", "水元素ダメージ", "風元素ダメージ", "雷元素ダメージ",
  "草元素ダメージ", "氷元素ダメージ", "岩元素ダメージ", "物理ダメージ"
];

export const GENSHIN_SUB_STATS = [
  "会心率", "会心ダメージ", "攻撃力%", "HP%", "防御力%", 
  "元素チャージ効率", "元素熟知", "攻撃力(固定値)", "HP(固定値)", "防御力(固定値)"
];
