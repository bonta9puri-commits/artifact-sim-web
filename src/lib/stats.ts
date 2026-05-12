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
  
  // ZZZ Specific
  AM_MAS: "AM_MAS", // Anomaly Mastery
  AM_PRO: "AM_PRO", // Anomaly Proficiency
  PEN_FLAT: "PEN_FLAT",
  PEN_PER: "PEN_PER",
  IMPACT: "IMPACT",
  ENERGY_GEN: "ENERGY_GEN",
} as const;

export type StatId = typeof STAT_IDS[keyof typeof STAT_IDS];
