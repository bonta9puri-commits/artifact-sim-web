import { CharacterData } from './game_data';

export const ZZZ_CHARACTERS: CharacterData[] = [
  { 
    name: "エレン", 
    element: "氷", 
    defaults: {
      weights: { "会心率": 2, "会心ダメージ": 1, "攻撃力%": 0.8, "貫通値": 0.5 },
      mainStats: { "スロット4": "会心ダメージ", "スロット5": "氷属性ダメージ", "スロット6": "攻撃力%" },
      targetSets: ["ウッドペッカー・エレクトロ", "極地ヘヴィメタル"],
      baseStats: { rate: 5, dmg: 50, atk: 100, hp: 0, def: 0, er: 100, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "朱鳶", 
    element: "エーテル", 
    defaults: {
      weights: { "会心率": 2, "会心ダメージ": 1, "攻撃力%": 0.8, "貫通値": 0.5 },
      mainStats: { "スロット4": "会心ダメージ", "スロット5": "エーテル属性ダメージ", "スロット6": "攻撃力%" },
      targetSets: ["ウッドペッカー・エレクトロ", "カオス・ジャズ"],
      baseStats: { rate: 5, dmg: 50, atk: 100, hp: 0, def: 0, er: 100, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "ジェーン", 
    element: "物理", 
    defaults: {
      weights: { "異常マスタリー": 1, "異常掌握": 1, "攻撃力%": 0.8, "貫通値": 0.5 },
      mainStats: { "スロット4": "異常マスタリー", "スロット5": "物理属性ダメージ", "スロット6": "異常掌握" },
      targetSets: ["フリーダム・ブルース", "牙を持つソウル"],
      baseStats: { rate: 5, dmg: 50, atk: 100, hp: 0, def: 0, er: 100, em: 300, scalingMode: "em" as any }
    }
  },
  { 
    name: "猫又", 
    element: "物理",
    defaults: {
      weights: { "会心率": 2.0, "会心ダメージ": 1.0, "攻撃力%": 0.8, "貫通値": 0.5 },
      mainStats: { "スロット4": "会心率", "スロット5": "物理属性ダメージ", "スロット6": "攻撃力%" },
      targetSets: ["獣牙のヘヴィメタル", "ウッドペッカー・エレクトロ"],
      baseStats: { rate: 5, dmg: 50, atk: 900, hp: 0, def: 0, er: 100, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "アンビー", 
    element: "雷",
    defaults: {
      weights: { "攻撃力%": 0.8, "異常マスタリー": 0.5, "会心率": 0.5 },
      mainStats: { "スロット4": "攻撃力%", "スロット5": "電気属性ダメージ", "スロット6": "衝撃力" },
      targetSets: ["ショックスター・ディスコ", "スイング・ジャズ"],
      baseStats: { rate: 5, dmg: 50, atk: 800, hp: 0, def: 0, er: 120, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "ニコ", 
    element: "エーテル",
    defaults: {
      weights: { "攻撃力%": 1.0, "異常マスタリー": 0.8, "貫通値": 0.5 },
      mainStats: { "スロット4": "攻撃力%", "スロット5": "エーテル属性ダメージ", "スロット6": "エネルギー自動回復" },
      targetSets: ["スイング・ジャズ", "フリーダム・ブルース"],
      baseStats: { rate: 5, dmg: 50, atk: 750, hp: 0, def: 0, er: 130, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "クレタ", 
    element: "炎",
    defaults: {
      weights: { "攻撃力%": 0.8, "会心率": 0.8, "会心ダメージ": 0.5 },
      mainStats: { "スロット4": "攻撃力%", "スロット5": "炎属性ダメージ", "スロット6": "衝撃力" },
      targetSets: ["ショックスター・ディスコ", "スイング・ジャズ"],
      baseStats: { rate: 5, dmg: 50, atk: 800, hp: 0, def: 0, er: 110, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "カリン", 
    element: "物理",
    defaults: {
      weights: { "会心率": 2.0, "会心ダメージ": 1.0, "攻撃力%": 0.8 },
      mainStats: { "スロット4": "会心率", "スロット5": "物理属性ダメージ", "スロット6": "攻撃力%" },
      targetSets: ["獣牙 of ヘヴィメタル" /* 正しくは "獣牙のヘヴィメタル" */, "ウッドペッカー・エレクトロ"],
      baseStats: { rate: 5, dmg: 50, atk: 850, hp: 0, def: 0, er: 100, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "リナ", 
    element: "雷",
    defaults: {
      weights: { "貫通値": 2.0, "攻撃力%": 0.8, "会心率": 0.5 },
      mainStats: { "スロット4": "攻撃力%", "スロット5": "電気属性ダメージ", "スロット6": "エネルギー自動回復" },
      targetSets: ["フリーダム・ブルース", "スイング・ジャズ"],
      baseStats: { rate: 5, dmg: 50, atk: 750, hp: 0, def: 0, er: 130, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "ライカン", 
    element: "氷",
    defaults: {
      weights: { "攻撃力%": 0.8, "会心率": 0.8, "速度": 0.5 },
      mainStats: { "スロット4": "会心率", "スロット5": "氷属性ダメージ", "スロット6": "衝撃力" },
      targetSets: ["ショックスター・ディスコ", "スイング・ジャズ"],
      baseStats: { rate: 5, dmg: 50, atk: 800, hp: 0, def: 0, er: 110, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "バーニス", 
    element: "炎",
    defaults: {
      weights: { "異常マスタリー": 2.0, "攻撃力%": 1.0, "貫通値": 0.5 },
      mainStats: { "スロット4": "異常マスタリー", "スロット5": "炎属性ダメージ", "スロット6": "異常掌握" },
      targetSets: ["混沌のヘヴィメタル", "ケイオス・ジャズ"],
      baseStats: { rate: 5, dmg: 50, atk: 900, hp: 0, def: 0, er: 100, em: 150, scalingMode: "em" as any }
    }
  },
  { 
    name: "シーザー", 
    element: "物理",
    defaults: {
      weights: { "防御力%": 2.0, "HP%": 1.0, "攻撃力%": 0.5 },
      mainStats: { "スロット4": "防御力%", "スロット5": "物理属性ダメージ", "スロット6": "衝撃力" },
      targetSets: ["プロト・パンク", "ソウル・ロック"],
      baseStats: { rate: 5, dmg: 50, def: 1000, hp: 0, er: 100, em: 0, scalingMode: "def" }
    }
  },
  { name: "その他", element: "無" }
];

export const ZZZ_SETS = [
  "ウッドペッカー・エレクトロ", "パファー・エレクトロ",
  "炎獄のヘヴィメタル", "極地のヘヴィメタル", "ホルモン・パンク",
  "ソウル・ロック", "スイング・ジャズ", "ケイオス・ジャズ",
  "獣牙のヘヴィメタル", "霹靂のヘヴィメタル", "混沌のヘヴィメタル",
  "フリーダム・ブルース", "ショックスター・ディスコ", "プロト・パンク", "原始的な悪意", "鮮雷のヘヴィメタル", "その他"
];

export const ZZZ_SLOTS = ["スロット1", "スロット2", "スロット3", "スロット4", "スロット5", "スロット6"];

export const ZZZ_MAIN_STATS = [
  "HP(固定値)", "攻撃力(固定値)", "防御力(固定値)",
  "HP%", "攻撃力%", "防御力%", "会心率", "会心ダメージ",
  "異常マスタリー", "貫通率", "エネルギー自動回復",
  "物理ダメージ", "炎ダメージ", "氷ダメージ", "電気ダメージ", "エーテルダメージ",
  "衝撃力", "異常掌握"
];

export const ZZZ_SUB_STATS = [
  "会心率", "会心ダメージ", "攻撃力%", "HP%", "防御力%",
  "異常マスタリー", "貫通値", "攻撃力(固定値)", "HP(固定値)", "防御力(固定値)"
];
