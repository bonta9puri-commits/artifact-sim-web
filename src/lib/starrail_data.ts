import { CharacterData } from './game_data';

export const STARRAIL_CHARACTERS: CharacterData[] = [
  { 
    name: "黄泉", 
    element: "雷", 
    defaults: {
      weights: { "会心率": 2, "会心ダメージ": 1, "攻撃力%": 1, "速度": 0.3 },
      mainStats: { "胴体": "会心ダメージ", "脚部": "攻撃力%", "次元界オーブ": "攻撃力%", "連結縄": "攻撃力%" },
      targetSets: ["死水に潜る先駆者", "出雲顕神と高天原"],
      baseStats: { rate: 5, dmg: 50, atk: 100, hp: 0, def: 0, er: 100, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "ホタル", 
    element: "炎", 
    defaults: {
      weights: { "撃破特効": 1, "速度": 1, "攻撃力%": 0.5 },
      mainStats: { "胴体": "攻撃力%", "脚部": "速度", "次元界オーブ": "攻撃力%", "連結縄": "撃破特効" },
      targetSets: ["機心と戦う風雲児", "劫火と蓮灯の鋳煉宮"],
      baseStats: { rate: 5, dmg: 50, atk: 100, hp: 0, def: 0, er: 100, em: 200, scalingMode: "atk" }
    }
  },
  { 
    name: "飛霄", 
    element: "風", 
    defaults: {
      weights: { "会心率": 2, "会心ダメージ": 1, "攻撃力%": 0.8, "速度": 0.8 },
      mainStats: { "胴体": "会心率", "脚部": "速度", "次元界オーブ": "風ダメージ", "連結縄": "攻撃力%" },
      targetSets: ["風雲を薙ぎ払う勇烈", "奔狼の都藍王朝"],
      baseStats: { rate: 5, dmg: 50, atk: 100, hp: 0, def: 0, er: 100, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "ブローニャ", 
    element: "風",
    defaults: {
      weights: { "会心ダメージ": 2.0, "速度": 1.5, "HP%": 0.8, "防御力%": 0.8 },
      mainStats: { "胴体": "会心ダメージ", "脚部": "速度", "次元界オーブ": "防御力%", "連結縄": "EP回復効率" },
      targetSets: ["仮想空間を彷徨うメッセンジャー", "折れた竜骨"],
      baseStats: { rate: 5, dmg: 50, atk: 1200, hp: 0, def: 0, er: 100, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "ゼーレ", 
    element: "量子",
    defaults: {
      weights: { "会心率": 2.0, "会心ダメージ": 1.0, "攻撃力%": 1.0, "速度": 0.5 },
      mainStats: { "胴体": "会心率", "脚部": "攻撃力%", "次元界オーブ": "量子ダメージ", "連結縄": "攻撃力%" },
      targetSets: ["星の如く輝く天才", "宇宙封印ステーション"],
      baseStats: { rate: 5, dmg: 50, atk: 1250, hp: 0, def: 0, er: 100, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "鏡流", 
    element: "氷",
    defaults: {
      weights: { "会心ダメージ": 2.0, "会心率": 0.8, "攻撃力%": 1.0, "速度": 1.0 },
      mainStats: { "胴体": "会心ダメージ", "脚部": "速度", "次元界オーブ": "氷ダメージ", "連結縄": "攻撃力%" },
      targetSets: ["雪の密林の狩人", "星々の競技場"],
      baseStats: { rate: 5, dmg: 50, atk: 1300, hp: 0, def: 0, er: 100, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "飲月", 
    element: "虚数",
    defaults: {
      weights: { "会心率": 2.0, "会心ダメージ": 1.0, "攻撃力%": 1.0, "速度": 0.5 },
      mainStats: { "胴体": "会心率", "脚部": "攻撃力%", "次元界オーブ": "虚数ダメージ", "連結縄": "攻撃力%" },
      targetSets: ["荒地で盗みを働く廃土客", "星々の競技場"],
      baseStats: { rate: 5, dmg: 50, atk: 1300, hp: 0, def: 0, er: 100, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "花火", 
    element: "量子",
    defaults: {
      weights: { "会心ダメージ": 2.0, "速度": 1.5, "HP%": 0.8, "防御力%": 0.8 },
      mainStats: { "胴体": "会心ダメージ", "脚部": "速度", "次元界オーブ": "HP%", "連結縄": "EP回復効率" },
      targetSets: ["仮想空間を彷徨うメッセンジャー", "折れた竜骨"],
      baseStats: { rate: 5, dmg: 50, atk: 1100, hp: 0, def: 0, er: 100, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "アベンチュリン", 
    element: "虚数",
    defaults: {
      weights: { "防御力%": 2.0, "会心ダメージ": 1.0, "会心率": 0.8, "速度": 0.8 },
      mainStats: { "胴体": "会心ダメージ", "脚部": "防御力%", "次元界オーブ": "防御力%", "連結縄": "防御力%" },
      targetSets: ["純庭教会の聖騎士", "折れた竜骨"],
      baseStats: { rate: 5, dmg: 50, def: 1200, hp: 0, er: 100, em: 0, scalingMode: "def" }
    }
  },
  { 
    name: "ロビン", 
    element: "物理",
    defaults: {
      weights: { "攻撃力%": 2.0, "速度": 0.5, "HP%": 0.5 },
      mainStats: { "胴体": "攻撃力%", "脚部": "攻撃力%", "次元界オーブ": "攻撃力%", "連結縄": "EP回復効率" },
      targetSets: ["草の穂ガンマン", "折れた竜骨"],
      baseStats: { rate: 5, dmg: 50, atk: 1250, hp: 0, def: 0, er: 100, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "雲璃", 
    element: "物理",
    defaults: {
      weights: { "会心率": 2.0, "会心ダメージ": 1.0, "攻撃力%": 1.0, "速度": 0.3 },
      mainStats: { "胴体": "会心率", "脚部": "攻撃力%", "次元界オーブ": "物理ダメージ", "連結縄": "攻撃力%" },
      targetSets: ["風雲を薙ぎ払う勇烈", "自転が止まったサルソット"],
      baseStats: { rate: 5, dmg: 50, atk: 1250, hp: 0, def: 0, er: 100, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "カフカ", 
    element: "雷",
    defaults: {
      weights: { "攻撃力%": 2.0, "速度": 1.5, "効果命中": 0.5, "撃破特効": 0.3 },
      mainStats: { "胴体": "攻撃力%", "脚部": "速度", "次元界オーブ": "雷ダメージ", "連結縄": "攻撃力%" },
      targetSets: ["重きを背負う異端者", "宇宙封印ステーション"],
      baseStats: { rate: 5, dmg: 50, atk: 1250, hp: 0, def: 0, er: 100, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "ブラックスワン", 
    element: "風",
    defaults: {
      weights: { "効果命中": 2.0, "攻撃力%": 1.0, "速度": 1.5, "撃破特効": 0.3 },
      mainStats: { "胴体": "効果命中", "脚部": "速度", "次元界オーブ": "風ダメージ", "連結縄": "攻撃力%" },
      targetSets: ["重きを背負う異端者", "汎銀河商事会社"],
      baseStats: { rate: 5, dmg: 50, atk: 1200, hp: 0, def: 0, er: 100, em: 0, scalingMode: "atk" }
    }
  },
  { 
    name: "ルアン・メェイ", 
    element: "氷",
    defaults: {
      weights: { "撃破特効": 2.0, "速度": 1.5, "HP%": 0.8, "防御力%": 0.8 },
      mainStats: { "胴体": "HP%", "脚部": "速度", "次元界オーブ": "HP%", "連結縄": "EP回復効率" },
      targetSets: ["流星 of 跡を追う怪盗" /* 正しくは "流星の跡を追う怪盗" */, "折れた竜骨"],
      baseStats: { rate: 5, dmg: 50, atk: 1000, hp: 0, def: 0, er: 100, em: 0, scalingMode: "atk" }
    }
  },
  { name: "その他", element: "無" }
];

export const STARRAIL_SETS = [
  "流雲無痕の過客", "草の穂ガンマン", "純庭教会の聖騎士", "雪の密林の狩人",
  "成り上がりチャンピオン", "吹雪と対峙する兵士", "溶岩で鍛造する火匠",
  "星の如く輝く天才", "雷鳴轟くバンド", "昼夜の狭間を翔ける鷹",
  "流星の跡を追う怪盗", "荒地で盗みを働く廃土客", "宝命長存の蒔者",
  "仮想空間を彷徨うメッセンジャー", "灰花を燃やす大公", "死水に潜る先駆者",
  "時計屋の残骸を追う夢見人", "機心と戦う風雲児", "蝗害を一掃せし鉄騎",
  "風雲を薙ぎ払う勇烈", "重きを背負う異端者",
  "宇宙封印ステーション", "老いぬ者の仙舟", "盗賊公国タリア",
  "生命のウェンワーク", "汎銀河商事会社", "天体階差機関",
  "建創者のベロブルグ", "自転が止まったサルソット", "星々の競技場",
  "折れた竜骨", "蒼穹戦線グラモス", "夢の地ピノコニー",
  "荒涼の惑星ツガンニヤ", "顕世の出雲と高天の神国", "奔狼の都藍王朝",
  "劫火と蓮灯の鋳煉宮", "至り尽くせぬバナダイナ", "奇面族の舞装束", "その他"
];

export const STARRAIL_SLOTS = ["頭部", "手部", "胴体", "脚部", "次元界オーブ", "連結縄"];

export const STARRAIL_MAIN_STATS = [
  "HP(固定値)", "攻撃力(固定値)", "HP%", "攻撃力%", "防御力%",
  "会心率", "会心ダメージ", "治癒量", "効果命中", "速度",
  "物理ダメージ", "炎ダメージ", "氷ダメージ", "雷ダメージ", "風ダメージ",
  "量子ダメージ", "虚数ダメージ", "EP回復効率", "撃破特効"
];

export const STARRAIL_SUB_STATS = [
  "会心率", "会心ダメージ", "速度", "攻撃力%", "HP%", "防御力%",
  "効果命中", "効果抵抗", "撃破特効", "攻撃力(固定値)", "HP(固定値)", "防御力(固定値)"
];
