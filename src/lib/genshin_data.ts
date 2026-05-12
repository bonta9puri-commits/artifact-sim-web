import { CharacterData } from './game_data';
import { STAT_IDS } from './stats';

export const GENSHIN_CHARACTERS: CharacterData[] = [
  { 
    name: "ニコ・リヤン", 
    element: "炎", 
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 2.0, [STAT_IDS.CRIT_DMG]: 1.0, [STAT_IDS.ATK_PER]: 1.0 },
      mainStats: { "時の砂": STAT_IDS.ATK_PER, "空の杯": STAT_IDS.PYRO_DMG, "理の冠": STAT_IDS.CRIT_RATE },
      targetSets: ["天からの贈り物", "旧貴族のしつけ"],
      baseStats: { rate: 5, dmg: 50, atk: 311, hp: 0, def: 0, er: 120, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "ヌヴィレット", 
    element: "水", 
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 2, [STAT_IDS.CRIT_DMG]: 1, [STAT_IDS.HP_PER]: 1, [STAT_IDS.EM]: 0.3 },
      mainStats: { "時の砂": STAT_IDS.HP_PER, "空の杯": STAT_IDS.HYDRO_DMG, "理の冠": STAT_IDS.CRIT_DMG },
      targetSets: ["ファントムハンター", "黄金の劇団"],
      baseStats: { rate: 5, dmg: 88.4, atk: 0, hp: 100, def: 0, er: 120, em: 40, scalingMode: "hp" }
    }
  },
  { 
    name: "フリーナ", 
    element: "水", 
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 2, [STAT_IDS.CRIT_DMG]: 1, [STAT_IDS.HP_PER]: 1, [STAT_IDS.ER]: 0.8 },
      mainStats: { "時の砂": STAT_IDS.HP_PER, "空の杯": STAT_IDS.HP_PER, "理の冠": STAT_IDS.CRIT_RATE },
      targetSets: ["黄金の劇団"],
      baseStats: { rate: 24.2, dmg: 50, atk: 0, hp: 80, def: 0, er: 160, em: 0, scalingMode: "hp" }
    }
  },
  { 
    name: "ナヒーダ", 
    element: "草", 
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 1.6, [STAT_IDS.CRIT_DMG]: 0.8, [STAT_IDS.EM]: 1, [STAT_IDS.ATK_PER]: 0.2 },
      mainStats: { "時の砂": STAT_IDS.EM, "空の杯": STAT_IDS.EM, "理の冠": STAT_IDS.CRIT_RATE },
      targetSets: ["深林の記憶", "金メッキの夢"],
      baseStats: { rate: 5, dmg: 50, atk: 0, hp: 0, def: 0, er: 120, em: 250, scalingMode: "em" as any }
    }
  },
  { 
    name: "雷電将軍", 
    element: "雷", 
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 2, [STAT_IDS.CRIT_DMG]: 1, [STAT_IDS.ER]: 1, [STAT_IDS.ATK_PER]: 0.8 },
      mainStats: { "時の砂": STAT_IDS.ER, "空の杯": STAT_IDS.ATK_PER, "理の冠": STAT_IDS.CRIT_RATE },
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
  { 
    name: "タルタリヤ", 
    element: "水", 
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 2.0, [STAT_IDS.CRIT_DMG]: 1.0, [STAT_IDS.ATK_PER]: 1.0 },
      mainStats: { "時の砂": STAT_IDS.ATK_PER, "空の杯": STAT_IDS.HYDRO_DMG, "理の冠": STAT_IDS.CRIT_RATE },
      targetSets: ["水仙の夢", "沈淪の心"],
      baseStats: { rate: 5, dmg: 50, atk: 311, hp: 0, def: 0, er: 120, em: 0, scalingMode: "atk" }
    }
  },
  { name: "その他", element: "無" }
];

export const GENSHIN_SETS = [
  "剣闘士のフィナーレ", "大地を流浪する楽団", "翠緑の影", "愛される少女", "悠久の磐岩", "逆飛びの流星", "火を渡る賢者", "燃え盛る炎の魔女", "沈淪の心", "氷風を彷徨う勇士", "雷鳴を轟かせる男", "雷を鎮める尊者", 
  "旧貴族のしつけ", "血染めの騎士道", "千岩牢固", "蒼白の炎", "追憶のしめ縄", "絶縁の旗印", "華館夢醒形骸記", "海染硨磲", "辰砂往生録", "来歆の余響", 
  "深林の記憶", "金メッキの夢", "砂上の楼閣の史話", "楽園の絶花", "水仙の夢", "花海甘露の光", "ファントムハンター", "黄金の劇団", 
  "残響の森で囁かれる夜話", "在りし日の歌", "諧律奇想の断章", "遂げられなかった想い", 
  "黒曜の秘典", "灰燼の都に立つ英雄の絵巻", "暁の星と月の歌", "風立ちの日", "天からの贈り物", "影に沈む幻", "月を紡ぐ夜の歌", "天穹の顕現せし夜", "その他"
];

export const GENSHIN_SLOTS = ["生の花", "死の羽", "時の砂", "空の杯", "理の冠"];

export const GENSHIN_MAIN_STATS = [
  STAT_IDS.HP_FLAT, STAT_IDS.ATK_FLAT, STAT_IDS.DEF_FLAT,
  STAT_IDS.HP_PER, STAT_IDS.ATK_PER, STAT_IDS.DEF_PER, STAT_IDS.EM, STAT_IDS.ER,
  STAT_IDS.CRIT_RATE, STAT_IDS.CRIT_DMG, STAT_IDS.HEAL_BONUS,
  STAT_IDS.PYRO_DMG, STAT_IDS.HYDRO_DMG, STAT_IDS.ANEMO_DMG, STAT_IDS.ELECTRO_DMG,
  STAT_IDS.DENDRO_DMG, STAT_IDS.CRYO_DMG, STAT_IDS.GEO_DMG, STAT_IDS.PHYSICAL_DMG
];

export const GENSHIN_SUB_STATS = [
  STAT_IDS.CRIT_RATE, STAT_IDS.CRIT_DMG, STAT_IDS.ATK_PER, STAT_IDS.HP_PER, STAT_IDS.DEF_PER, 
  STAT_IDS.ER, STAT_IDS.EM, STAT_IDS.ATK_FLAT, STAT_IDS.HP_FLAT, STAT_IDS.DEF_FLAT
];
