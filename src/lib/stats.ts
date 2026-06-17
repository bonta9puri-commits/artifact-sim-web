export const STAT_IDS = {
  // Common
  CRIT_RATE: "CRIT_RATE",
  CRIT_DMG: "CRIT_DMG",
  ATK_PER: "ATK_PER",
  HP_PER: "HP_PER",
  DEF_PER: "DEF_PER",
  ER: "ER",
  EM: "EM",
  ATK_FLAT: "ATK_FLAT",
  HP_FLAT: "HP_FLAT",
  DEF_FLAT: "DEF_FLAT",
  
  // Genshin Specific
  PYRO_DMG: "PYRO_DMG",
  HYDRO_DMG: "HYDRO_DMG",
  ANEMO_DMG: "ANEMO_DMG",
  ELECTRO_DMG: "ELECTRO_DMG",
  DENDRO_DMG: "DENDRO_DMG",
  CRYO_DMG: "CRYO_DMG",
  GEO_DMG: "GEO_DMG",
  PHYSICAL_DMG: "PHYSICAL_DMG",
  HEAL_BONUS: "HEAL_BONUS",
  
  // Star Rail Specific
  SPEED: "SPEED",
  BREAK_EFFECT: "BREAK_EFFECT",
  EFFECT_HIT: "EFFECT_HIT",
  EFFECT_RES: "EFFECT_RES",
  ERR: "ERR",
  QUANTUM_DMG: "QUANTUM_DMG",
  IMAGINARY_DMG: "IMAGINARY_DMG",
  
  // ZZZ Specific
  AM_MAS: "AM_MAS", // Anomaly Mastery
  AM_PRO: "AM_PRO", // Anomaly Proficiency
  PEN_FLAT: "PEN_FLAT",
  PEN_PER: "PEN_PER",
  IMPACT: "IMPACT",
  ENERGY_GEN: "ENERGY_GEN",
  ETHER_DMG: "ETHER_DMG",
} as const;

export type StatId = typeof STAT_IDS[keyof typeof STAT_IDS];

export function normalizeStatId(statName: string): string {
  const map: Record<string, string> = {
    "会心率": STAT_IDS.CRIT_RATE,
    "会心ダメージ": STAT_IDS.CRIT_DMG,
    "攻撃力%": STAT_IDS.ATK_PER,
    "攻撃%": STAT_IDS.ATK_PER,
    "HP%": STAT_IDS.HP_PER,
    "防御力%": STAT_IDS.DEF_PER,
    "速度": STAT_IDS.SPEED,
    "撃破特効": STAT_IDS.BREAK_EFFECT,
    "効果命中": STAT_IDS.EFFECT_HIT,
    "効果抵抗": STAT_IDS.EFFECT_RES,
    "EP回復効率": STAT_IDS.ERR,
    "異常マスタリー": STAT_IDS.AM_MAS,
    "異常掌握": STAT_IDS.AM_PRO,
    "貫通値": STAT_IDS.PEN_FLAT,
    "貫通率": STAT_IDS.PEN_PER,
    "衝撃力": STAT_IDS.IMPACT,
    "エネルギー自動回復": STAT_IDS.ENERGY_GEN,
    "攻撃力(固定値)": STAT_IDS.ATK_FLAT,
    "HP(固定値)": STAT_IDS.HP_FLAT,
    "防御力(固定値)": STAT_IDS.DEF_FLAT,
    
    // ダメージ系 (原神)
    "炎元素ダメージ": STAT_IDS.PYRO_DMG,
    "水元素ダメージ": STAT_IDS.HYDRO_DMG,
    "風元素ダメージ": STAT_IDS.ANEMO_DMG,
    "雷元素ダメージ": STAT_IDS.ELECTRO_DMG,
    "草元素ダメージ": STAT_IDS.DENDRO_DMG,
    "氷元素ダメージ": STAT_IDS.CRYO_DMG,
    "岩元素ダメージ": STAT_IDS.GEO_DMG,
    "物理ダメージ": STAT_IDS.PHYSICAL_DMG,
    "与える治癒効果": STAT_IDS.HEAL_BONUS,
    
    // ダメージ系 (スタレ)
    "物理属性ダメージ": STAT_IDS.PHYSICAL_DMG,
    "火属性ダメージ": STAT_IDS.PYRO_DMG,
    "氷属性ダメージ": STAT_IDS.CRYO_DMG,
    "雷属性ダメージ": STAT_IDS.ELECTRO_DMG,
    "風属性ダメージ": STAT_IDS.ANEMO_DMG,
    "量子属性ダメージ": STAT_IDS.QUANTUM_DMG,
    "虚数属性ダメージ": STAT_IDS.IMAGINARY_DMG,
    "治癒量": STAT_IDS.HEAL_BONUS,
    
    // 属性ダメージ表記揺れ（defaults用）
    "炎ダメージ": STAT_IDS.PYRO_DMG,
    "水ダメージ": STAT_IDS.HYDRO_DMG,
    "風ダメージ": STAT_IDS.ANEMO_DMG,
    "雷ダメージ": STAT_IDS.ELECTRO_DMG,
    "草ダメージ": STAT_IDS.DENDRO_DMG,
    "氷ダメージ": STAT_IDS.CRYO_DMG,
    "岩ダメージ": STAT_IDS.GEO_DMG,
    "量子ダメージ": STAT_IDS.QUANTUM_DMG,
    "虚数ダメージ": STAT_IDS.IMAGINARY_DMG,
    
    // ダメージ系 (ZZZ)
    "電気属性ダメージ": STAT_IDS.ELECTRO_DMG,
    "電気ダメージ": STAT_IDS.ELECTRO_DMG,
    "エーテル属性ダメージ": STAT_IDS.ETHER_DMG,
    "エーテルダメージ": STAT_IDS.ETHER_DMG,
  };
  return map[statName] || statName;
}

