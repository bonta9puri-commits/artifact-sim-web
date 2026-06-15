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
  { 
    name: "アルレッキーノ", 
    element: "炎",
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 2.0, [STAT_IDS.CRIT_DMG]: 1.0, [STAT_IDS.ATK_PER]: 1.0, [STAT_IDS.EM]: 0.3 },
      mainStats: { "時の砂": STAT_IDS.ATK_PER, "空の杯": STAT_IDS.PYRO_DMG, "理の冠": STAT_IDS.CRIT_RATE },
      targetSets: ["諧律奇想の断章", "剣闘士のフィナーレ"],
      baseStats: { rate: 36.3, dmg: 50, atk: 1016, hp: 0, def: 0, er: 110, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "鍾離", 
    element: "岩",
    defaults: {
      weights: { [STAT_IDS.HP_PER]: 2.0, [STAT_IDS.DEF_PER]: 0.5, [STAT_IDS.CRIT_RATE]: 0.8, [STAT_IDS.CRIT_DMG]: 0.4 },
      mainStats: { "時の砂": STAT_IDS.HP_PER, "空の杯": STAT_IDS.HP_PER, "理の冠": STAT_IDS.HP_PER },
      targetSets: ["千岩牢固"],
      baseStats: { rate: 5, dmg: 50, atk: 0, hp: 120, def: 0, er: 120, em: 0, scalingMode: "hp" }
    }
  },
  { 
    name: "甘雨", 
    element: "氷",
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 1.5, [STAT_IDS.CRIT_DMG]: 2.0, [STAT_IDS.ATK_PER]: 1.0, [STAT_IDS.EM]: 0.8 },
      mainStats: { "時の砂": STAT_IDS.ATK_PER, "空の杯": STAT_IDS.CRYO_DMG, "理の冠": STAT_IDS.CRIT_DMG },
      targetSets: ["氷風を彷徨う勇士", "大地を流浪する楽団"],
      baseStats: { rate: 5, dmg: 88.4, atk: 311, hp: 0, def: 0, er: 120, em: 80, scalingMode: "atk" }
    }
  },
  { 
    name: "胡桃", 
    element: "炎",
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 2.0, [STAT_IDS.CRIT_DMG]: 1.0, [STAT_IDS.HP_PER]: 1.0, [STAT_IDS.EM]: 0.8, [STAT_IDS.ATK_PER]: 0.2 },
      mainStats: { "時の砂": STAT_IDS.HP_PER, "空の杯": STAT_IDS.PYRO_DMG, "理の冠": STAT_IDS.CRIT_DMG },
      targetSets: ["燃え盛る炎の魔女", "追憶のしめ縄"],
      baseStats: { rate: 5, dmg: 88.4, atk: 100, hp: 100, def: 0, er: 110, em: 80, scalingMode: "hp" }
    }
  },
  { 
    name: "神里綾華", 
    element: "氷",
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 1.5, [STAT_IDS.CRIT_DMG]: 2.0, [STAT_IDS.ATK_PER]: 1.0, [STAT_IDS.ER]: 0.5 },
      mainStats: { "時の砂": STAT_IDS.ATK_PER, "空の杯": STAT_IDS.CRYO_DMG, "理の冠": STAT_IDS.CRIT_DMG },
      targetSets: ["氷風を彷徨う勇士"],
      baseStats: { rate: 5, dmg: 132.5, atk: 1016, hp: 0, def: 0, er: 120, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "八重神子", 
    element: "雷",
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 2.0, [STAT_IDS.CRIT_DMG]: 1.0, [STAT_IDS.ATK_PER]: 0.8, [STAT_IDS.EM]: 0.5 },
      mainStats: { "時の砂": STAT_IDS.ATK_PER, "空の杯": STAT_IDS.ELECTRO_DMG, "理の冠": STAT_IDS.CRIT_RATE },
      targetSets: ["黄金の劇団", "金メッキの夢"],
      baseStats: { rate: 24.2, dmg: 116.2, atk: 948, hp: 0, def: 0, er: 120, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "夜蘭", 
    element: "水",
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 2.0, [STAT_IDS.CRIT_DMG]: 1.0, [STAT_IDS.HP_PER]: 1.0, [STAT_IDS.ER]: 0.8 },
      mainStats: { "時の砂": STAT_IDS.HP_PER, "空の杯": STAT_IDS.HYDRO_DMG, "理の冠": STAT_IDS.CRIT_RATE },
      targetSets: ["絶縁の旗印", "沈淪の心"],
      baseStats: { rate: 24.2, dmg: 138.2, atk: 0, hp: 14450, def: 0, er: 130, em: 0, scalingMode: "hp" }
    }
  },
  { 
    name: "放浪者", 
    element: "風",
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 2.0, [STAT_IDS.CRIT_DMG]: 1.0, [STAT_IDS.ATK_PER]: 1.0 },
      mainStats: { "時の砂": STAT_IDS.ATK_PER, "空の杯": STAT_IDS.ANEMO_DMG, "理の冠": STAT_IDS.CRIT_RATE },
      targetSets: ["砂上の楼閣の史話", "しめ縄"],
      baseStats: { rate: 29.2, dmg: 50, atk: 1005, hp: 0, def: 0, er: 110, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "楓原万葉", 
    element: "風",
    defaults: {
      weights: { [STAT_IDS.EM]: 2.0, [STAT_IDS.ER]: 1.5, [STAT_IDS.CRIT_RATE]: 0.5, [STAT_IDS.ATK_PER]: 0.5 },
      mainStats: { "時の砂": STAT_IDS.EM, "空の杯": STAT_IDS.EM, "理の冠": STAT_IDS.EM },
      targetSets: ["翠緑の影"],
      baseStats: { rate: 5, dmg: 50, atk: 0, hp: 0, def: 0, er: 140, em: 250, scalingMode: "em" as any }
    }
  },
  { 
    name: "珊瑚宮心海", 
    element: "水",
    defaults: {
      weights: { [STAT_IDS.HP_PER]: 2.0, [STAT_IDS.ATK_PER]: 0.5, [STAT_IDS.ER]: 1.5, [STAT_IDS.EM]: 0.2 },
      mainStats: { "時の砂": STAT_IDS.HP_PER, "空の杯": STAT_IDS.HYDRO_DMG, "理の冠": STAT_IDS.HEAL_BONUS },
      targetSets: ["海染硨磲"],
      baseStats: { rate: -95, dmg: 50, atk: 0, hp: 13471, def: 0, er: 130, em: 0, scalingMode: "hp" }
    }
  },
  { 
    name: "ニィロウ", 
    element: "水",
    defaults: {
      weights: { [STAT_IDS.HP_PER]: 2.0, [STAT_IDS.EM]: 1.0, [STAT_IDS.ER]: 0.8 },
      mainStats: { "時の砂": STAT_IDS.HP_PER, "空の杯": STAT_IDS.HP_PER, "理の冠": STAT_IDS.HP_PER },
      targetSets: ["花海甘露の光", "千岩牢固"],
      baseStats: { rate: 5, dmg: 50, atk: 0, hp: 15185, def: 0, er: 120, em: 0, scalingMode: "hp" }
    }
  },
  { 
    name: "アルハイゼン", 
    element: "草",
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 2.0, [STAT_IDS.CRIT_DMG]: 1.0, [STAT_IDS.EM]: 1.2, [STAT_IDS.ATK_PER]: 0.5 },
      mainStats: { "時の砂": STAT_IDS.EM, "空の杯": STAT_IDS.DENDRO_DMG, "理の冠": STAT_IDS.CRIT_RATE },
      targetSets: ["金メッキの夢", "深林の記憶"],
      baseStats: { rate: 5, dmg: 138.2, atk: 850, hp: 0, def: 0, er: 120, em: 150, scalingMode: "em" as any }
    }
  },
  { 
    name: "セノ", 
    element: "雷",
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 2.0, [STAT_IDS.CRIT_DMG]: 1.0, [STAT_IDS.EM]: 1.0, [STAT_IDS.ATK_PER]: 0.8 },
      mainStats: { "時の砂": STAT_IDS.EM, "空の杯": STAT_IDS.ELECTRO_DMG, "理の冠": STAT_IDS.CRIT_DMG },
      targetSets: ["金メッキの夢", "雷鳴を轟かせる男"],
      baseStats: { rate: 36.3, dmg: 88.4, atk: 900, hp: 0, def: 0, er: 120, em: 100, scalingMode: "atk" }
    }
  },
  { 
    name: "エウルア", 
    element: "氷",
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 2.0, [STAT_IDS.CRIT_DMG]: 1.0, [STAT_IDS.ATK_PER]: 1.0, [STAT_IDS.ER]: 0.5 },
      mainStats: { "時の砂": STAT_IDS.ATK_PER, "空の杯": STAT_IDS.PHYSICAL_DMG, "理の冠": STAT_IDS.CRIT_RATE },
      targetSets: ["蒼白の炎", "血染めの騎士道"],
      baseStats: { rate: 5, dmg: 88.4, atk: 311, hp: 0, def: 0, er: 120, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "荒瀧一斗", 
    element: "岩",
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 2.0, [STAT_IDS.CRIT_DMG]: 1.0, [STAT_IDS.DEF_PER]: 1.2, [STAT_IDS.ER]: 0.5 },
      mainStats: { "時の砂": STAT_IDS.DEF_PER, "空の杯": STAT_IDS.GEO_DMG, "理の冠": STAT_IDS.CRIT_RATE },
      targetSets: ["華館夢醒形骸記"],
      baseStats: { rate: 29.2, dmg: 138.4, atk: 0, hp: 0, def: 959, er: 120, em: 0, scalingMode: "def" }
    }
  },
  { 
    name: "申鶴", 
    element: "氷",
    defaults: {
      weights: { [STAT_IDS.ATK_PER]: 2.0, [STAT_IDS.ER]: 1.5, [STAT_IDS.HP_PER]: 0.5 },
      mainStats: { "時の砂": STAT_IDS.ATK_PER, "空の杯": STAT_IDS.ATK_PER, "理の冠": STAT_IDS.ATK_PER },
      targetSets: ["剣闘士のフィナーレ", "しめ縄"],
      baseStats: { rate: 5, dmg: 50, atk: 900, hp: 0, def: 0, er: 140, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "ナヴィア", 
    element: "岩",
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 2.0, [STAT_IDS.CRIT_DMG]: 1.0, [STAT_IDS.ATK_PER]: 1.0, [STAT_IDS.ER]: 0.5 },
      mainStats: { "時の砂": STAT_IDS.ATK_PER, "空の杯": STAT_IDS.GEO_DMG, "理の冠": STAT_IDS.CRIT_RATE },
      targetSets: ["残響の森で囁かれる夜話"],
      baseStats: { rate: 5, dmg: 88.4, atk: 1022, hp: 0, def: 0, er: 120, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "クロリンデ", 
    element: "雷",
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 1.5, [STAT_IDS.CRIT_DMG]: 2.0, [STAT_IDS.ATK_PER]: 1.0, [STAT_IDS.EM]: 0.3 },
      mainStats: { "時の砂": STAT_IDS.ATK_PER, "空の杯": STAT_IDS.ELECTRO_DMG, "理の冠": STAT_IDS.CRIT_DMG },
      targetSets: ["諧律奇想の断章"],
      baseStats: { rate: 24.2, dmg: 50, atk: 1000, hp: 0, def: 0, er: 110, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "エミリエ", 
    element: "草",
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 2.0, [STAT_IDS.CRIT_DMG]: 1.0, [STAT_IDS.ATK_PER]: 1.0, [STAT_IDS.ER]: 0.5 },
      mainStats: { "時の砂": STAT_IDS.ATK_PER, "空の杯": STAT_IDS.DENDRO_DMG, "理の冠": STAT_IDS.CRIT_RATE },
      targetSets: ["遂げられなかった想い"],
      baseStats: { rate: 24.2, dmg: 50, atk: 950, hp: 0, def: 0, er: 120, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "ムアラニ", 
    element: "水",
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 1.0, [STAT_IDS.CRIT_DMG]: 2.0, [STAT_IDS.HP_PER]: 1.2, [STAT_IDS.EM]: 0.8 },
      mainStats: { "時の砂": STAT_IDS.HP_PER, "空の杯": STAT_IDS.HYDRO_DMG, "理の冠": STAT_IDS.CRIT_DMG },
      targetSets: ["黒曜の秘典"],
      baseStats: { rate: 24.2, dmg: 138.2, atk: 0, hp: 15400, def: 0, er: 110, em: 0, scalingMode: "hp" }
    }
  },
  { 
    name: "キィニチ", 
    element: "草",
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 1.0, [STAT_IDS.CRIT_DMG]: 2.0, [STAT_IDS.ATK_PER]: 1.0, [STAT_IDS.ER]: 0.5 },
      mainStats: { "時の砂": STAT_IDS.ATK_PER, "空の杯": STAT_IDS.DENDRO_DMG, "理の冠": STAT_IDS.CRIT_DMG },
      targetSets: ["黒曜の秘典"],
      baseStats: { rate: 5, dmg: 88.4, atk: 950, hp: 0, def: 0, er: 120, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "シロネン", 
    element: "岩",
    defaults: {
      weights: { [STAT_IDS.DEF_PER]: 2.0, [STAT_IDS.ER]: 1.5, [STAT_IDS.HP_PER]: 0.5 },
      mainStats: { "時の砂": STAT_IDS.DEF_PER, "空の杯": STAT_IDS.DEF_PER, "理の冠": STAT_IDS.DEF_PER },
      targetSets: ["灰燼の都に立つ英雄の絵巻"],
      baseStats: { rate: 5, dmg: 50, def: 950, hp: 0, er: 130, em: 0, scalingMode: "def" }
    }
  },
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
  {
    name: "ウェンティ",
    element: "風",
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 1.0, [STAT_IDS.CRIT_DMG]: 0.5, [STAT_IDS.EM]: 2.0, [STAT_IDS.ER]: 1.5, [STAT_IDS.ATK_PER]: 0.8 },
      mainStats: { "時の砂": STAT_IDS.EM, "空の杯": STAT_IDS.ANEMO_DMG, "理の冠": STAT_IDS.EM },
      targetSets: ["翠緑の影"],
      baseStats: { rate: 5, dmg: 50, atk: 0, hp: 0, def: 0, er: 132, em: 150, scalingMode: "em" as any }
    }
  },
  {
    name: "クレー",
    element: "炎",
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 2.0, [STAT_IDS.CRIT_DMG]: 1.0, [STAT_IDS.ATK_PER]: 1.0, [STAT_IDS.EM]: 0.5 },
      mainStats: { "時の砂": STAT_IDS.ATK_PER, "空の杯": STAT_IDS.PYRO_DMG, "理の冠": STAT_IDS.CRIT_RATE },
      targetSets: ["燃え盛る炎の魔女", "剣闘士のフィナーレ"],
      baseStats: { rate: 5, dmg: 78.8, atk: 311, hp: 0, def: 0, er: 120, em: 0, scalingMode: "atk" }
    }
  },
  {
    name: "ディルック",
    element: "炎",
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 2.0, [STAT_IDS.CRIT_DMG]: 1.0, [STAT_IDS.ATK_PER]: 1.0, [STAT_IDS.EM]: 0.8 },
      mainStats: { "時の砂": STAT_IDS.ATK_PER, "空の杯": STAT_IDS.PYRO_DMG, "理の冠": STAT_IDS.CRIT_RATE },
      targetSets: ["燃え盛る炎の魔女"],
      baseStats: { rate: 24.2, dmg: 50, atk: 311, hp: 0, def: 0, er: 120, em: 80, scalingMode: "atk" }
    }
  },
  {
    name: "刻晴",
    element: "雷",
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 2.0, [STAT_IDS.CRIT_DMG]: 1.0, [STAT_IDS.ATK_PER]: 1.0, [STAT_IDS.EM]: 0.5 },
      mainStats: { "時の砂": STAT_IDS.ATK_PER, "空の杯": STAT_IDS.ELECTRO_DMG, "理の冠": STAT_IDS.CRIT_DMG },
      targetSets: ["雷鳴を轟かせる男", "剣闘士のフィナーレ"],
      baseStats: { rate: 5, dmg: 88.4, atk: 311, hp: 0, def: 0, er: 120, em: 0, scalingMode: "atk" }
    }
  },
  {
    name: "モナ",
    element: "水",
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 2.0, [STAT_IDS.CRIT_DMG]: 1.0, [STAT_IDS.ER]: 1.2, [STAT_IDS.ATK_PER]: 0.8 },
      mainStats: { "時の砂": STAT_IDS.ER, "空の杯": STAT_IDS.HYDRO_DMG, "理の冠": STAT_IDS.CRIT_RATE },
      targetSets: ["絶縁の旗印", "旧貴族のしつけ"],
      baseStats: { rate: 5, dmg: 50, atk: 250, hp: 0, def: 0, er: 200, em: 0, scalingMode: "atk" }
    }
  },
  {
    name: "アルベド",
    element: "岩",
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 2.0, [STAT_IDS.CRIT_DMG]: 1.0, [STAT_IDS.DEF_PER]: 1.2 },
      mainStats: { "時の砂": STAT_IDS.DEF_PER, "空の杯": STAT_IDS.GEO_DMG, "理の冠": STAT_IDS.CRIT_RATE },
      targetSets: ["華館夢醒形骸記"],
      baseStats: { rate: 5, dmg: 78.8, atk: 0, hp: 0, def: 120, er: 120, em: 0, scalingMode: "def" }
    }
  },
  {
    name: "魈",
    element: "風",
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 2.0, [STAT_IDS.CRIT_DMG]: 1.0, [STAT_IDS.ATK_PER]: 1.0, [STAT_IDS.ER]: 0.6 },
      mainStats: { "時の砂": STAT_IDS.ATK_PER, "空の杯": STAT_IDS.ANEMO_DMG, "理の冠": STAT_IDS.CRIT_RATE },
      targetSets: ["辰砂往生録"],
      baseStats: { rate: 24.2, dmg: 50, atk: 311, hp: 0, def: 0, er: 130, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "神里綾人", 
    element: "水",
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 2.0, [STAT_IDS.CRIT_DMG]: 1.0, [STAT_IDS.ATK_PER]: 1.0, [STAT_IDS.HP_PER]: 0.2 },
      mainStats: { "時の砂": STAT_IDS.ATK_PER, "空の杯": STAT_IDS.HYDRO_DMG, "理の冠": STAT_IDS.CRIT_RATE },
      targetSets: ["来歆の余響", "沈淪の心"],
      baseStats: { rate: 38.3, dmg: 50, atk: 900, hp: 0, def: 0, er: 100, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "宵宮", 
    element: "炎",
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 2.0, [STAT_IDS.CRIT_DMG]: 1.0, [STAT_IDS.ATK_PER]: 1.0, [STAT_IDS.EM]: 0.5 },
      mainStats: { "時の砂": STAT_IDS.ATK_PER, "空の杯": STAT_IDS.PYRO_DMG, "理の冠": STAT_IDS.CRIT_RATE },
      targetSets: ["追憶のしめ縄", "燃え盛る炎の魔女"],
      baseStats: { rate: 24.2, dmg: 116.2, atk: 931, hp: 0, def: 0, er: 110, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "ティナリ", 
    element: "草",
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 2.0, [STAT_IDS.CRIT_DMG]: 1.0, [STAT_IDS.EM]: 1.2, [STAT_IDS.ATK_PER]: 0.6 },
      mainStats: { "時の砂": STAT_IDS.EM, "空の杯": STAT_IDS.DENDRO_DMG, "理の冠": STAT_IDS.CRIT_DMG },
      targetSets: ["金メッキの夢", "深林の記憶"],
      baseStats: { rate: 49.1, dmg: 50, atk: 850, hp: 0, def: 0, er: 120, em: 130, scalingMode: "em" as any }
    }
  },
  { 
    name: "ディシア", 
    element: "炎",
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 2.0, [STAT_IDS.CRIT_DMG]: 1.0, [STAT_IDS.ATK_PER]: 1.0, [STAT_IDS.HP_PER]: 1.5, [STAT_IDS.ER]: 0.8 },
      mainStats: { "時の砂": STAT_IDS.HP_PER, "空の杯": STAT_IDS.PYRO_DMG, "理の冠": STAT_IDS.CRIT_RATE },
      targetSets: ["花海甘露の光", "絶縁の旗印"],
      baseStats: { rate: 38.3, dmg: 50, atk: 873, hp: 15675, def: 0, er: 130, em: 0, scalingMode: "hp" }
    }
  },
  { 
    name: "白朮", 
    element: "草",
    defaults: {
      weights: { [STAT_IDS.HP_PER]: 2.0, [STAT_IDS.ER]: 1.5, [STAT_IDS.DEF_PER]: 0.5 },
      mainStats: { "時の砂": STAT_IDS.HP_PER, "空の杯": STAT_IDS.HP_PER, "理の冠": STAT_IDS.HP_PER },
      targetSets: ["深林の記憶", "千岩牢固"],
      baseStats: { rate: 5, dmg: 50, atk: 0, hp: 13348, def: 0, er: 140, em: 0, scalingMode: "hp" }
    }
  },
  { 
    name: "ジン", 
    element: "風",
    defaults: {
      weights: { [STAT_IDS.ATK_PER]: 2.0, [STAT_IDS.ER]: 1.5, [STAT_IDS.CRIT_RATE]: 0.8, [STAT_IDS.CRIT_DMG]: 0.4 },
      mainStats: { "時の砂": STAT_IDS.ATK_PER, "空の杯": STAT_IDS.ANEMO_DMG, "理の冠": STAT_IDS.HEAL_BONUS },
      targetSets: ["翠緑の影", "旧貴族のしつけ"],
      baseStats: { rate: 5, dmg: 50, atk: 850, hp: 0, def: 0, er: 130, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "行秋", 
    element: "水",
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 2.0, [STAT_IDS.CRIT_DMG]: 1.0, [STAT_IDS.ATK_PER]: 0.8, [STAT_IDS.ER]: 1.2 },
      mainStats: { "時の砂": STAT_IDS.ER, "空の杯": STAT_IDS.HYDRO_DMG, "理の冠": STAT_IDS.CRIT_RATE },
      targetSets: ["絶縁の旗印", "沈淪の心"],
      baseStats: { rate: 5, dmg: 50, atk: 700, hp: 0, def: 0, er: 180, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "ベネット", 
    element: "炎",
    defaults: {
      weights: { [STAT_IDS.HP_PER]: 2.0, [STAT_IDS.ER]: 1.8, [STAT_IDS.ATK_PER]: 0.2 },
      mainStats: { "時の砂": STAT_IDS.ER, "空の杯": STAT_IDS.HP_PER, "理の冠": STAT_IDS.HEAL_BONUS },
      targetSets: ["旧貴族のしつけ"],
      baseStats: { rate: 5, dmg: 50, atk: 0, hp: 12397, def: 0, er: 180, em: 0, scalingMode: "hp" }
    }
  },
  { 
    name: "香菱", 
    element: "炎",
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 2.0, [STAT_IDS.CRIT_DMG]: 1.0, [STAT_IDS.ER]: 1.5, [STAT_IDS.EM]: 0.8, [STAT_IDS.ATK_PER]: 0.8 },
      mainStats: { "時の砂": STAT_IDS.ER, "空の杯": STAT_IDS.PYRO_DMG, "理の冠": STAT_IDS.CRIT_RATE },
      targetSets: ["絶縁の旗印"],
      baseStats: { rate: 5, dmg: 50, atk: 735, hp: 0, def: 0, er: 180, em: 100, scalingMode: "atk" }
    }
  },
  { 
    name: "フィッシュル", 
    element: "雷",
    defaults: {
      weights: { [STAT_IDS.CRIT_RATE]: 2.0, [STAT_IDS.CRIT_DMG]: 1.0, [STAT_IDS.ATK_PER]: 1.0, [STAT_IDS.EM]: 0.5 },
      mainStats: { "時の砂": STAT_IDS.ATK_PER, "空の杯": STAT_IDS.ELECTRO_DMG, "理の冠": STAT_IDS.CRIT_RATE },
      targetSets: ["黄金の劇団", "剣闘士のフィナーレ"],
      baseStats: { rate: 5, dmg: 50, atk: 750, hp: 0, def: 0, er: 120, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "久岐忍", 
    element: "雷",
    defaults: {
      weights: { [STAT_IDS.EM]: 2.0, [STAT_IDS.HP_PER]: 1.0, [STAT_IDS.ER]: 0.8 },
      mainStats: { "時の砂": STAT_IDS.EM, "空の杯": STAT_IDS.EM, "理の冠": STAT_IDS.EM },
      targetSets: ["楽園の絶花", "金メッキの夢"],
      baseStats: { rate: 5, dmg: 50, atk: 0, hp: 12289, def: 0, er: 120, em: 250, scalingMode: "em" as any }
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
