import { STAT_IDS } from './stats';
import { GameId } from './game_data';

export const MAIN_STAT_VALUES: Record<GameId, Record<string, number>> = {
  genshin: {
    [STAT_IDS.HP_FLAT]: 4780,
    [STAT_IDS.ATK_FLAT]: 311,
    [STAT_IDS.HP_PER]: 46.6,
    [STAT_IDS.ATK_PER]: 46.6,
    [STAT_IDS.DEF_PER]: 58.3,
    [STAT_IDS.EM]: 187,
    [STAT_IDS.ER]: 51.8,
    [STAT_IDS.CRIT_RATE]: 31.1,
    [STAT_IDS.CRIT_DMG]: 62.2,
    [STAT_IDS.HEAL_BONUS]: 35.9,
    [STAT_IDS.PYRO_DMG]: 46.6,
    [STAT_IDS.HYDRO_DMG]: 46.6,
    [STAT_IDS.ANEMO_DMG]: 46.6,
    [STAT_IDS.ELECTRO_DMG]: 46.6,
    [STAT_IDS.DENDRO_DMG]: 46.6,
    [STAT_IDS.CRYO_DMG]: 46.6,
    [STAT_IDS.GEO_DMG]: 46.6,
    [STAT_IDS.PHYSICAL_DMG]: 58.3,
  },
  starrail: {
    [STAT_IDS.HP_FLAT]: 705.6,
    [STAT_IDS.ATK_FLAT]: 352.8,
    [STAT_IDS.HP_PER]: 43.2,
    [STAT_IDS.ATK_PER]: 43.2,
    [STAT_IDS.DEF_PER]: 54.0,
    [STAT_IDS.CRIT_RATE]: 32.4,
    [STAT_IDS.CRIT_DMG]: 64.8,
    "治癒量": 34.5,
    [STAT_IDS.EFFECT_HIT]: 43.2,
    [STAT_IDS.SPEED]: 25.03,
    "物理属性ダメージ": 38.8,
    "火属性ダメージ": 38.8,
    "氷属性ダメージ": 38.8,
    "雷属性ダメージ": 38.8,
    "風属性ダメージ": 38.8,
    "量子属性ダメージ": 38.8,
    "虚数属性ダメージ": 38.8,
    [STAT_IDS.BREAK_EFFECT]: 64.8,
    [STAT_IDS.ERR]: 19.4,
  },
  zzz: {
    [STAT_IDS.HP_FLAT]: 2200,
    [STAT_IDS.ATK_FLAT]: 316,
    [STAT_IDS.DEF_FLAT]: 184,
    [STAT_IDS.HP_PER]: 30.0,
    [STAT_IDS.ATK_PER]: 30.0,
    [STAT_IDS.DEF_PER]: 40.0,
    [STAT_IDS.CRIT_RATE]: 24.0,
    [STAT_IDS.CRIT_DMG]: 48.0,
    [STAT_IDS.AM_MAS]: 92,
    "物理属性ダメージ": 30.0,
    "炎属性ダメージ": 30.0,
    "氷属性ダメージ": 30.0,
    "電気属性ダメージ": 30.0,
    "エーテル属性ダメージ": 30.0,
    "貫通率": 24.0,
    [STAT_IDS.IMPACT]: 18.0,
    [STAT_IDS.AM_PRO]: 30.0,
    [STAT_IDS.ENERGY_GEN]: 60.0,
  }
};

export function calculateTotalStats(gameId: GameId, pieces: Record<string, any>) {
  const totals: Record<string, number> = {};

  Object.entries(pieces).forEach(([slot, art]: [string, any]) => {
    if (!art) return;

    // 1. メインステータス加算
    let mainStat = art.main;
    if (gameId === "genshin") {
      if (slot.includes("花")) mainStat = STAT_IDS.HP_FLAT;
      else if (slot.includes("羽")) mainStat = STAT_IDS.ATK_FLAT;
    } else if (gameId === "starrail") {
      if (slot === "頭部") mainStat = STAT_IDS.HP_FLAT;
      else if (slot === "手部") mainStat = STAT_IDS.ATK_FLAT;
    } else if (gameId === "zzz") {
      if (slot === "スロット1") mainStat = STAT_IDS.HP_FLAT;
      else if (slot === "スロット2") mainStat = STAT_IDS.ATK_FLAT;
      else if (slot === "スロット3") mainStat = STAT_IDS.DEF_FLAT;
    }

    const mainVal = MAIN_STAT_VALUES[gameId]?.[mainStat] || 0;
    if (mainVal > 0) {
      totals[mainStat] = (totals[mainStat] || 0) + mainVal;
    }

    // 2. サブステータス加算
    if (art.substats) {
      Object.entries(art.substats).forEach(([subKey, subVal]: [string, any]) => {
        totals[subKey] = (totals[subKey] || 0) + subVal;
      });
    }
  });

  return totals;
}

export const DEFAULT_BASE_STATS: Record<string, number> = {
  hp: 15000,
  atk: 800,
  def: 700,
  rate: 5,
  dmg: 50,
  er: 100,
  em: 0
};

export function calculateDamageExpectation(baseVal: number, critRate: number, critDmg: number, dmgBonus: number): number {
  const cappedRate = Math.min(100, Math.max(0, critRate)) / 100;
  const dmgMultiplier = 1 + cappedRate * (critDmg / 100);
  const bonusMultiplier = 1 + (dmgBonus / 100);
  return baseVal * dmgMultiplier * bonusMultiplier;
}
