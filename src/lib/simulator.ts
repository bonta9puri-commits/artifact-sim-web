// 汎用シミュレーターロジック (セット効果・詳細確率対応版)
import { GameId } from './game_data';
import { STAT_IDS } from './stats';

// --- サブステータス定義 ---
const GENSHIN_SUBSTAT_VALUES: Record<string, number[]> = {
  [STAT_IDS.CRIT_RATE]: [2.7, 3.1, 3.5, 3.9], [STAT_IDS.CRIT_DMG]: [5.4, 6.2, 7.0, 7.8],
  [STAT_IDS.ATK_PER]: [4.1, 4.7, 5.3, 5.8], [STAT_IDS.HP_PER]: [4.1, 4.7, 5.3, 5.8], [STAT_IDS.DEF_PER]: [5.1, 5.8, 6.6, 7.3],
  [STAT_IDS.EM]: [16, 19, 21, 23], [STAT_IDS.ER]: [4.5, 5.2, 5.8, 6.5],
  [STAT_IDS.ATK_FLAT]: [14, 16, 18, 19], [STAT_IDS.HP_FLAT]: [209, 239, 269, 299], [STAT_IDS.DEF_FLAT]: [16, 19, 21, 23],
};

const STARRAIL_SUBSTAT_VALUES: Record<string, number[]> = {
  [STAT_IDS.HP_FLAT]: [33, 38, 42], [STAT_IDS.ATK_FLAT]: [16, 19, 21], [STAT_IDS.DEF_FLAT]: [16, 19, 21],
  [STAT_IDS.HP_PER]: [3.4, 3.8, 4.3], [STAT_IDS.ATK_PER]: [3.4, 3.8, 4.3], [STAT_IDS.DEF_PER]: [4.3, 4.8, 5.4],
  [STAT_IDS.CRIT_RATE]: [2.5, 2.9, 3.2], [STAT_IDS.CRIT_DMG]: [5.1, 5.8, 6.4],
  [STAT_IDS.SPEED]: [2.0, 2.3, 2.6], [STAT_IDS.BREAK_EFFECT]: [5.1, 5.8, 6.4],
  [STAT_IDS.EFFECT_HIT]: [3.4, 3.8, 4.3], [STAT_IDS.EFFECT_RES]: [3.4, 3.8, 4.3],
};

const ZZZ_SUBSTAT_VALUES: Record<string, number> = {
  [STAT_IDS.CRIT_RATE]: 2.4, [STAT_IDS.CRIT_DMG]: 4.8, [STAT_IDS.ATK_PER]: 3.0, [STAT_IDS.HP_PER]: 3.0, [STAT_IDS.DEF_PER]: 4.8,
  [STAT_IDS.ATK_FLAT]: 19, [STAT_IDS.HP_FLAT]: 112, [STAT_IDS.DEF_FLAT]: 15, [STAT_IDS.AM_MAS]: 9, [STAT_IDS.AM_PRO]: 9, [STAT_IDS.PEN_FLAT]: 9, [STAT_IDS.IMPACT]: 1.2,
};

const getSubstatValue = (gameId: GameId, substatName: string): number => {
  if (gameId === "zzz") return ZZZ_SUBSTAT_VALUES[substatName] || 0;
  const values = gameId === "genshin" ? GENSHIN_SUBSTAT_VALUES[substatName] : STARRAIL_SUBSTAT_VALUES[substatName];
  return values ? values[Math.floor(Math.random() * values.length)] : 0;
};

// --- 出現確率 ---
export const MAIN_PROBS: Record<GameId, Record<string, Record<string, number>>> = {
  genshin: {
    "生の花": { [STAT_IDS.HP_FLAT]: 100 }, "死の羽": { [STAT_IDS.ATK_FLAT]: 100 },
    "時の砂": { [STAT_IDS.ATK_PER]: 26.6, [STAT_IDS.HP_PER]: 26.6, [STAT_IDS.DEF_PER]: 26.6, [STAT_IDS.EM]: 10.0, [STAT_IDS.ER]: 10.0 },
    "空の杯": { 
      [STAT_IDS.PYRO_DMG]: 5.0, [STAT_IDS.HYDRO_DMG]: 5.0, [STAT_IDS.ANEMO_DMG]: 5.0, [STAT_IDS.ELECTRO_DMG]: 5.0, 
      [STAT_IDS.DENDRO_DMG]: 5.0, [STAT_IDS.CRYO_DMG]: 5.0, [STAT_IDS.GEO_DMG]: 5.0, [STAT_IDS.PHYSICAL_DMG]: 5.0,
      [STAT_IDS.ATK_PER]: 21.3, [STAT_IDS.HP_PER]: 21.3, [STAT_IDS.DEF_PER]: 20.0, [STAT_IDS.EM]: 2.5 
    },
    "理の冠": { [STAT_IDS.CRIT_RATE]: 10.0, [STAT_IDS.CRIT_DMG]: 10.0, [STAT_IDS.ATK_PER]: 22.0, [STAT_IDS.HP_PER]: 22.0, [STAT_IDS.DEF_PER]: 22.0, [STAT_IDS.HEAL_BONUS]: 10.0, [STAT_IDS.EM]: 4.0 }
  },
  starrail: {
    "頭部": { [STAT_IDS.HP_FLAT]: 100 }, "手部": { [STAT_IDS.ATK_FLAT]: 100 },
    "胴体": { [STAT_IDS.HP_PER]: 18.0, [STAT_IDS.ATK_PER]: 18.0, [STAT_IDS.DEF_PER]: 18.0, [STAT_IDS.CRIT_RATE]: 10.0, [STAT_IDS.CRIT_DMG]: 10.0, "治癒量": 10.0, [STAT_IDS.EFFECT_HIT]: 10.0 },
    "脚部": { [STAT_IDS.HP_PER]: 28.0, [STAT_IDS.ATK_PER]: 28.0, [STAT_IDS.DEF_PER]: 28.0, [STAT_IDS.SPEED]: 16.0 },
    "次元界オーブ": { 
      "物理属性ダメージ": 9.0, "火属性ダメージ": 9.0, "氷属性ダメージ": 9.0, "雷属性ダメージ": 9.0, 
      "風属性ダメージ": 9.0, "量子属性ダメージ": 9.0, "虚数属性ダメージ": 9.0,
      [STAT_IDS.ATK_PER]: 12.0, [STAT_IDS.HP_PER]: 12.0, [STAT_IDS.DEF_PER]: 12.0 
    },
    "連結縄": { [STAT_IDS.ATK_PER]: 25.0, [STAT_IDS.HP_PER]: 25.0, [STAT_IDS.DEF_PER]: 25.0, [STAT_IDS.BREAK_EFFECT]: 20.0, [STAT_IDS.ERR]: 5.0 }
  },
  zzz: {
    "スロット1": { [STAT_IDS.HP_FLAT]: 100 }, "スロット2": { [STAT_IDS.ATK_FLAT]: 100 }, "スロット3": { [STAT_IDS.DEF_FLAT]: 100 },
    "スロット4": { [STAT_IDS.ATK_PER]: 25.0, [STAT_IDS.HP_PER]: 25.0, [STAT_IDS.DEF_PER]: 25.0, [STAT_IDS.CRIT_RATE]: 10.0, [STAT_IDS.CRIT_DMG]: 10.0, [STAT_IDS.AM_MAS]: 5.0 },
    "スロット5": { 
      "物理属性ダメージ": 12.0, "炎属性ダメージ": 12.0, "氷属性ダメージ": 12.0, "電気属性ダメージ": 12.0, "エーテル属性ダメージ": 12.0,
      [STAT_IDS.ATK_PER]: 10.0, [STAT_IDS.HP_PER]: 10.0, [STAT_IDS.DEF_PER]: 10.0, "貫通率": 10.0 
    },
    "スロット6": { [STAT_IDS.ATK_PER]: 20.0, [STAT_IDS.HP_PER]: 20.0, [STAT_IDS.DEF_PER]: 20.0, [STAT_IDS.IMPACT]: 15.0, [STAT_IDS.AM_PRO]: 15.0, [STAT_IDS.ENERGY_GEN]: 10.0 }
  }
};

const SUB_WEIGHTS: Record<GameId, Record<string, number>> = {
  genshin: { [STAT_IDS.CRIT_RATE]: 100, [STAT_IDS.CRIT_DMG]: 100, [STAT_IDS.ATK_PER]: 100, [STAT_IDS.HP_PER]: 100, [STAT_IDS.DEF_PER]: 100, [STAT_IDS.ER]: 100, [STAT_IDS.EM]: 100, [STAT_IDS.ATK_FLAT]: 150, [STAT_IDS.HP_FLAT]: 150, [STAT_IDS.DEF_FLAT]: 150 },
  starrail: { [STAT_IDS.CRIT_RATE]: 4, [STAT_IDS.CRIT_DMG]: 4, [STAT_IDS.SPEED]: 4, [STAT_IDS.ATK_PER]: 8, [STAT_IDS.HP_PER]: 8, [STAT_IDS.DEF_PER]: 8, [STAT_IDS.EFFECT_HIT]: 8, [STAT_IDS.EFFECT_RES]: 8, [STAT_IDS.BREAK_EFFECT]: 8, [STAT_IDS.ATK_FLAT]: 10, [STAT_IDS.HP_FLAT]: 10, [STAT_IDS.DEF_FLAT]: 10 },
  zzz: { [STAT_IDS.CRIT_RATE]: 5, [STAT_IDS.CRIT_DMG]: 5, [STAT_IDS.ATK_PER]: 10, [STAT_IDS.HP_PER]: 10, [STAT_IDS.DEF_PER]: 10, [STAT_IDS.AM_MAS]: 10, [STAT_IDS.PEN_FLAT]: 10, [STAT_IDS.ATK_FLAT]: 15, [STAT_IDS.HP_FLAT]: 15, [STAT_IDS.DEF_FLAT]: 15 }
};

const GAME_DEFAULTS = {
  genshin: { staminaCost: 20, recycleRatio: 3, dailyStamina: 180 },
  starrail: { staminaCost: 40, recycleRatio: 10, dailyStamina: 240 },
  zzz: { staminaCost: 20, recycleRatio: 6, dailyStamina: 240 }
};

function weightedRandom(probs: Record<string, number>): string {
  const keys = Object.keys(probs);
  const total = Object.values(probs).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < keys.length; i++) {
    if (r < probs[keys[i]]) return keys[i];
    r -= probs[keys[i]];
  }
  return keys[keys.length - 1];
}

// 聖遺物生成
export interface ArtifactConfig {
  gameId: GameId;
  part: string;
  main: string;
  subs: Record<string, number>;
}

export interface ElixirConfig {
  enabled: boolean;
  initialCount: number;
  perVersion: number;
  targetPart: string;
  targetSet: string;
  targetMain: string;
  sub1: string;
  sub2: string;
}

export const ELIXIR_COST: Record<string, number> = {
  "生の花": 1,
  "死の羽": 1,
  "時の砂": 2,
  "空の杯": 4,
  "理の冠": 3
};

export function generateArtifact(gameId: GameId, part: string, subPool: string[], scoreWeights: Record<string, number>, targetSets: string[] = [], isOrnament: boolean = false, isStrongbox: boolean = false) {
  const mainProbs = MAIN_PROBS[gameId][part] || { "攻撃力%": 100 };
  const main = weightedRandom(mainProbs);
  
  const activeTargetSets = targetSets.filter(s => s !== "" && s !== "未選択");
  let setName = "その他";
  let isTargetSet = false;

  if (isStrongbox) {
    if (activeTargetSets.length > 0) {
      setName = activeTargetSets[0];
      isTargetSet = true;
    }
  } else if (Math.random() < 0.5) {
    if (activeTargetSets.length > 0) {
      setName = activeTargetSets[Math.floor(Math.random() * activeTargetSets.length)];
      isTargetSet = true;
    }
  }
  
  let numSubs = Math.random() < 0.8 ? 3 : 4;
  if (isStrongbox && gameId === "genshin") {
    numSubs = Math.random() < 0.5 ? 4 : 3;
  }
  const available = subPool.filter(s => s !== main && s !== "未選択");
  const gameSubWeights = SUB_WEIGHTS[gameId] || {};
  
  const selectedSubs: string[] = [];
  const tempAvailable = [...available];
  while (selectedSubs.length < numSubs && tempAvailable.length > 0) {
    const probs: Record<string, number> = {};
    tempAvailable.forEach(s => probs[s] = gameSubWeights[s] || 10);
    const s = weightedRandom(probs);
    if (s) {
      selectedSubs.push(s);
      tempAvailable.splice(tempAvailable.indexOf(s), 1);
    }
  }

  const substats: Record<string, number> = {};
  for (const s of selectedSubs) substats[s] = getSubstatValue(gameId, s);

  const rolls = 5; 
  for (let i = 0; i < rolls; i++) {
    const keys = Object.keys(substats);
    if (keys.length < 4) {
      const rem = available.filter(s => !(s in substats));
      const probs: Record<string, number> = {};
      rem.forEach(s => probs[s] = gameSubWeights[s] || 10);
      const s = weightedRandom(probs);
      if (s) substats[s] = getSubstatValue(gameId, s);
    } else {
      const s = keys[Math.floor(Math.random() * keys.length)];
      substats[s] += getSubstatValue(gameId, s);
    }
  }

  let score = 0;

  if (gameId === "zzz") {
    let totalUsefulRolls = 0;
    for (const [s, v] of Object.entries(substats)) {
      const weight = scoreWeights[s] || 0;
      if (weight > 0) {
        const baseValue = ZZZ_SUBSTAT_VALUES[s] || 1;
        totalUsefulRolls += (v / baseValue) * weight;
      }
    }
    score = (totalUsefulRolls / 7) * 100;
  } else if (gameId === "starrail") {
    const mainScore = 50; 
    let totalUsefulRolls = 0;
    for (const [s, v] of Object.entries(substats)) {
      const weight = scoreWeights[s] || 0;
      if (weight > 0) {
        const avgRoll = s === STAT_IDS.CRIT_RATE ? 2.9 : s === STAT_IDS.CRIT_DMG ? 5.8 : s === STAT_IDS.SPEED ? 2.3 : 3.9;
        totalUsefulRolls += (v / avgRoll) * weight;
      }
    }
    const subScore = (totalUsefulRolls / 9) * 50;
    score = mainScore + subScore;
  } else {
    for (const [s, v] of Object.entries(substats)) {
      const weight = scoreWeights[s] || 0;
      if (weight > 0) score += v * weight;
    }
  }
  
  return { part, main, score: score || 0, substats, isTargetSet, setName, isOrnament };
}

export function generateElixirArtifact(config: ElixirConfig, subPool: string[], scoreWeights: Record<string, number>) {
  const part = config.targetPart;
  const main = config.targetMain;
  const setName = config.targetSet;
  const isTargetSet = true;

  // 初期4オプ率は50%
  const numSubs = Math.random() < 0.5 ? 4 : 3;
  const available = subPool.filter(s => s !== main && s !== "未選択" && s !== config.sub1 && s !== config.sub2);
  const gameSubWeights = SUB_WEIGHTS["genshin"] || {};
  
  const selectedSubs: string[] = [config.sub1, config.sub2].filter(s => s && s !== "未選択");
  const tempAvailable = [...available];
  while (selectedSubs.length < numSubs && tempAvailable.length > 0) {
    const probs: Record<string, number> = {};
    tempAvailable.forEach(s => probs[s] = gameSubWeights[s] || 10);
    const s = weightedRandom(probs);
    if (s) {
      selectedSubs.push(s);
      tempAvailable.splice(tempAvailable.indexOf(s), 1);
    }
  }

  const substats: Record<string, number> = {};
  for (const s of selectedSubs) substats[s] = getSubstatValue("genshin", s);

  const rolls = 5; 
  for (let i = 0; i < rolls; i++) {
    const keys = Object.keys(substats);
    if (keys.length < 4) {
      const rem = available.filter(s => !(s in substats));
      const probs: Record<string, number> = {};
      rem.forEach(s => probs[s] = gameSubWeights[s] || 10);
      const s = weightedRandom(probs);
      if (s) substats[s] = getSubstatValue("genshin", s);
    } else {
      const s = keys[Math.floor(Math.random() * keys.length)];
      substats[s] += getSubstatValue("genshin", s);
    }
  }

  let score = 0;
  for (const [s, v] of Object.entries(substats)) {
    const weight = scoreWeights[s] || 0;
    if (weight > 0) score += v * weight;
  }

  return { part, main, score: score || 0, substats, isTargetSet, setName, isOrnament: false, isElixir: true };
}

// 最高スコア(コンボ考慮)を計算
function calculateBestCombo(gameId: GameId, bestPieces: Record<string, Record<string, any>>, targetSets: string[]) {
  const slots = Object.keys(bestPieces);
  const setsA = [targetSets[0], targetSets[1]].filter(s => s && s !== "未選択");
  const setsB = [targetSets[2], targetSets[3]].filter(s => s && s !== "未選択");

  if (gameId === "genshin") {
    let maxTotal = 0;
    let maxSubstat = 0;
    let bestSet: Record<string, any> = {};
    const activeTargets = targetSets.filter(s => s && s !== "未選択");
    
    (activeTargets.length > 0 ? activeTargets : ["any"]).forEach(targetName => {
      for (let off = 0; off < 5; off++) {
        let currentTotal = 0;
        let currentSubstat = 0;
        let count = 0;
        const currentSet: Record<string, any> = {};
        slots.forEach((s, i) => {
          const art = (i === off) ? bestPieces[s]["any"] : bestPieces[s][targetName];
          if (art) {
            currentTotal += art.score;
            currentSubstat += art.score;
            if (i !== off && art.setName === targetName) count++;
          }
          currentSet[s] = art;
        });
        
        // シミュレーション用のボーナス
        if (count >= 2) currentTotal += 15;
        if (count >= 4) currentTotal += 40;
        
        // セット1(本命)を絶対に優先する強烈な補正 (表示スコアには影響しない)
        if (targetName === targetSets[0]) {
          currentTotal += 10000;
        }
        
        if (currentTotal > maxTotal) {
          maxTotal = currentTotal;
          maxSubstat = currentSubstat;
          bestSet = currentSet;
        }
      }
    });
    return { total: maxTotal, substatTotal: maxSubstat, pieces: bestSet };
  } else if (gameId === "starrail") {
    let maxTotal = 0;
    let maxSubstat = 0;
    let bestSet: Record<string, any> = {};
    const relicSlots = ["頭部", "手部", "胴体", "脚部"];
    const ornamentSlots = ["次元界オーブ", "連結縄"];
    
    (setsA.length > 0 ? setsA : ["any"]).forEach(tRelic => {
      (setsB.length > 0 ? setsB : ["any"]).forEach(tOrna => {
        let currentTotal = 0;
        let currentSubstat = 0;
        let rCount = 0;
        let oCount = 0;
        const currentSet: Record<string, any> = {};
        
        relicSlots.forEach(s => {
          const art = bestPieces[s][tRelic] || bestPieces[s]["any"];
          if (art) {
            currentTotal += art.score;
            currentSubstat += art.score;
            if (art.setName === tRelic) rCount++;
          }
          currentSet[s] = art;
        });
        ornamentSlots.forEach(s => {
          const art = bestPieces[s][tOrna] || bestPieces[s]["any"];
          if (art) {
            currentTotal += art.score;
            currentSubstat += art.score;
            if (art.setName === tOrna) oCount++;
          }
          currentSet[s] = art;
        });
        
        if (rCount >= 2) currentTotal += 15;
        if (rCount >= 4) currentTotal += 40;
        if (oCount >= 2) currentTotal += 20;

        // セット1とセット3(本命)を優先する補正
        if (tRelic === targetSets[0]) currentTotal += 10000;
        if (tOrna === targetSets[2]) currentTotal += 10000;

        if (currentTotal > maxTotal) {
          maxTotal = currentTotal;
          maxSubstat = currentSubstat;
          bestSet = currentSet;
        }
      });
    });
    return { total: maxTotal, substatTotal: maxSubstat, pieces: bestSet };
  } else if (gameId === "zzz") {
    let maxTotal = 0;
    let maxSubstat = 0;
    let bestSet: Record<string, any> = {};
    
    (setsA.length > 0 ? setsA : ["any"]).forEach(t4 => {
      (setsB.length > 0 ? setsB : ["any"]).forEach(t2 => {
        let currentTotal = 0;
        let currentSubstat = 0;
        let aCount = 0;
        let bCount = 0;
        const currentSet: Record<string, any> = {};
        
        slots.forEach((s, i) => {
          const target = i < 4 ? t4 : t2;
          const art = bestPieces[s][target] || bestPieces[s]["any"];
          if (art) {
            currentTotal += art.score;
            currentSubstat += art.score;
            if (art.setName === t4) aCount++;
            else if (art.setName === t2) bCount++;
          }
          currentSet[s] = art;
        });

        if (aCount >= 2) currentTotal += 15;
        if (aCount >= 4) currentTotal += 40;
        if (bCount >= 2) currentTotal += 15;

        // ZZZの場合もセット1と3を優先
        if (t4 === targetSets[0]) currentTotal += 10000;
        if (t2 === targetSets[2]) currentTotal += 10000;

        if (currentTotal > maxTotal) {
          maxTotal = currentTotal;
          maxSubstat = currentSubstat;
          bestSet = currentSet;
        }
      });
    });
    return { total: maxTotal, substatTotal: maxSubstat, pieces: bestSet };
  }
  return { total: 0, substatTotal: 0, pieces: {} };
}

function getDefaultSetForSlot(gameId: GameId, part: string, targetSets: string[]): string {
  const t0 = targetSets[0] && targetSets[0] !== "未選択" ? targetSets[0] : "その他";
  const t2 = targetSets[2] && targetSets[2] !== "未選択" ? targetSets[2] : "その他";
  if (gameId === "starrail") {
    const isOrnament = part === "次元界オーブ" || part === "連結縄";
    return isOrnament ? t2 : t0;
  } else if (gameId === "zzz") {
    const isSlot56 = part === "スロット5" || part === "スロット6";
    return isSlot56 ? t2 : t0;
  }
  return t0;
}

// シミュレーション (目標スコア)
export function simulateUntilScore(gameId: GameId, target: number, scoreWeights: Record<string, number>, subPool: string[], useRecycle: boolean, mainStats: Record<string, string>, targetSets: string[], elixirConfig?: ElixirConfig | null, initialScores?: Record<string, number> | null) {
  const parts = Object.keys(MAIN_PROBS[gameId]);
  const bestPieces: Record<string, Record<string, any>> = {};
  parts.forEach(p => {
    bestPieces[p] = { "any": null };
    targetSets.forEach(s => { if(s && s !== "未選択") bestPieces[p][s] = null; });
    
    if (initialScores && initialScores[p] !== undefined && initialScores[p] > 0) {
      const initScore = initialScores[p];
      const defaultSet = getDefaultSetForSlot(gameId, p, targetSets);
      const dummyPiece = {
        part: p,
        main: mainStats[p] || "",
        score: initScore,
        substats: {},
        isTargetSet: defaultSet !== "その他",
        setName: defaultSet,
        isOrnament: gameId === "starrail" && (p === "次元界オーブ" || p === "連結縄"),
        isInitial: true
      };
      bestPieces[p][defaultSet] = dummyPiece;
      bestPieces[p]["any"] = dummyPiece;
    }
  });
  
  let attempts = 0;
  let attemptsMinus10 = 0;
  let recycleQueue = 0;
  const defaults = GAME_DEFAULTS[gameId];
  let finalResult = { total: 0, substatTotal: 0, pieces: {} };

  const dungeonA = [targetSets[0], targetSets[1]].filter(s => s && s !== "未選択");
  const dungeonB = [targetSets[2], targetSets[3]].filter(s => s && s !== "未選択");

  let usedElixirCount = 0;
  const godPieces: any[] = [];

  while (attempts < 100000) {
    attempts++;

    if (gameId === "genshin" && elixirConfig?.enabled) {
      const days = attempts / (defaults.dailyStamina / defaults.staminaCost);
      const totalElixirs = elixirConfig.initialCount + Math.floor(days / 42) * elixirConfig.perVersion;
      
      if (totalElixirs > usedElixirCount) {
        let currentAvailable = totalElixirs - usedElixirCount;
        
        while (currentAvailable > 0) {
          const currentPieces = Object.entries(finalResult.pieces as Record<string, any>)
            .map(([slot, art]) => ({ slot, score: art?.score || 0 }))
            .sort((a, b) => a.score - b.score);

          let loopImproved = false;
          for (const { slot } of currentPieces) {
            const cost = ELIXIR_COST[slot] || 1;
            if (currentAvailable >= cost) {
              const isTargetPart = slot === elixirConfig.targetPart;
              let targetMain = isTargetPart ? elixirConfig.targetMain : (mainStats[slot] || STAT_IDS.ATK_PER);
              
              // 固定メインステータスの強制適用 (花・羽)
              if (slot.includes("花")) targetMain = STAT_IDS.HP_FLAT;
              if (slot.includes("羽")) targetMain = STAT_IDS.ATK_FLAT;

              const sortedSubs = Object.entries(scoreWeights)
                .filter(([s]) => s !== targetMain && s !== "未選択")
                .sort((a, b) => b[1] - a[1])
                .map(e => e[0]);
              
              const s1 = isTargetPart ? elixirConfig.sub1 : sortedSubs[0];
              const s2 = isTargetPart ? elixirConfig.sub2 : sortedSubs[1];

              const tempConfig = { ...elixirConfig, targetPart: slot, targetMain, sub1: s1, sub2: s2 };
              const eArt = generateElixirArtifact(tempConfig, subPool, scoreWeights);
              if (eArt.score >= 58) godPieces.push(eArt);
              
              const currentEquippedSet = (finalResult.pieces as any)[slot]?.setName || targetSets[0];
              const finalSet = currentEquippedSet !== "その他" ? currentEquippedSet : targetSets[0];
              eArt.setName = finalSet;

              const currentBest = (bestPieces[slot][finalSet]?.score || 0);
              if (eArt.score > currentBest) {
                bestPieces[slot][finalSet] = eArt;
                if (eArt.score > (bestPieces[slot]["any"]?.score || 0)) bestPieces[slot]["any"] = eArt;
                loopImproved = true;
              }
              
              currentAvailable -= cost;
              usedElixirCount += cost;
              finalResult = calculateBestCombo(gameId, bestPieces, targetSets);
              if (loopImproved) break;
            }
          }
          if (!loopImproved) break; 
        }
      }
    }
    
    // どのダンジョンを回すか動的に最適化 (Greedy Strategy)
    let currentPool = dungeonA;
    const pieces = finalResult.pieces as any;
    
    if (dungeonB.length > 0) {
      // 現在のビルドでA由来とB由来のパーツの平均スコアを比較
      let scoreA = 0, countA = 0;
      let scoreB = 0, countB = 0;
      
      Object.values(pieces).forEach((art: any) => {
        if (!art) return;
        if (dungeonA.includes(art.setName)) { scoreA += art.score; countA++; }
        else if (dungeonB.includes(art.setName)) { scoreB += art.score; countB++; }
      });

      const avgA = countA > 0 ? scoreA / countA : 0;
      const avgB = countB > 0 ? scoreB / countB : 0;

      // 伸び代がある方（平均が低い方）を優先
      // ただしスタレの場合、スロットの制約があるためそれを優先
      if (gameId === "starrail") {
        const relicTargetCount = 4;
        const ornaTargetCount = 2;
        if (countA < relicTargetCount) currentPool = dungeonA;
        else if (countB < ornaTargetCount) currentPool = dungeonB;
        else currentPool = avgA < avgB ? dungeonA : dungeonB;
      } else {
        currentPool = avgA < avgB ? dungeonA : dungeonB;
      }
    } else {
      currentPool = dungeonA; // Bが未設定なら絶対にA
    }

    // パーツの抽選
    let p = parts[Math.floor(Math.random() * parts.length)];
    if (gameId === "starrail") {
      // スタレは回しているダンジョンによって出る部位が固定
      const isA = currentPool === dungeonA;
      p = isA ? parts[Math.floor(Math.random() * 4)] : parts[4 + Math.floor(Math.random() * 2)];
    }

    const isOrnament = gameId === "starrail" && (p === "次元界オーブ" || p === "連結縄");
    const art = generateArtifact(gameId, p, subPool, scoreWeights, currentPool, isOrnament);
    if (art.score >= 58) godPieces.push(art);
    
    const isMainMatch = art.main === mainStats[p] || 
      p.includes("花") || p.includes("羽") || 
      p === "頭部" || p === "手部" || 
      p === "スロット1" || p === "スロット2" || p === "スロット3";

    if (isMainMatch) {
      if (art.isTargetSet && art.score > (bestPieces[p][art.setName]?.score || 0)) bestPieces[p][art.setName] = art;
      if (art.score > (bestPieces[p]["any"]?.score || 0)) bestPieces[p]["any"] = art;
    } else if (useRecycle) {
      recycleQueue++;
    }

    if (useRecycle && recycleQueue >= defaults.recycleRatio) {
      recycleQueue -= defaults.recycleRatio;
      const sp = parts[Math.floor(Math.random() * parts.length)];
      const isSOrnament = gameId === "starrail" && (sp === "次元界オーブ" || sp === "連結縄");
      let sPool = targetSets[0] && targetSets[0] !== "未選択" ? [targetSets[0]] : dungeonA;
      if (gameId === "starrail" && isSOrnament) sPool = dungeonB.length > 0 ? [dungeonB[0]] : sPool;

      const sart = generateArtifact(gameId, sp, subPool, scoreWeights, sPool, isSOrnament, true);
      if (sart.score >= 58) godPieces.push(sart);
      const isSMainMatch = sart.main === mainStats[sp] || 
        sp.includes("花") || sp.includes("羽") || 
        sp === "頭部" || sp === "手部" || 
        sp === "スロット1" || sp === "スロット2" || sp === "スロット3";

      if (isSMainMatch) {
        if (sart.isTargetSet && sart.score > (bestPieces[sp][sart.setName]?.score || 0)) bestPieces[sp][sart.setName] = sart;
        if (sart.score > (bestPieces[sp]["any"]?.score || 0)) bestPieces[sp]["any"] = sart;
      }
    }

    finalResult = calculateBestCombo(gameId, bestPieces, targetSets);
    if (attemptsMinus10 === 0 && finalResult.substatTotal >= target - 10) {
      attemptsMinus10 = attempts;
    }
    if (finalResult.substatTotal >= target) break;
  }
  return { 
    attempts, 
    stamina: attempts * defaults.staminaCost, 
    pieces: finalResult.pieces, 
    score: finalResult.substatTotal, 
    scoreBeforeElixir: finalResult.substatTotal, // 目標診断では投入前も後も同じ（目標達成した瞬間なので）
    attemptsMinus10: attemptsMinus10 || attempts,
    godPieces 
  };
}

// シミュレーション (固定期間)
export function simulateFixedAttempts(gameId: GameId, totalAttempts: number, staminaPerDay: number, scoreWeights: Record<string, number>, subPool: string[], useRecycle: boolean, mainStats: Record<string, string>, targetSets: string[], elixirConfig?: ElixirConfig | null, initialScores?: Record<string, number> | null) {
  const parts = Object.keys(MAIN_PROBS[gameId]);
  const bestPieces: Record<string, Record<string, any>> = {};
  parts.forEach(p => {
    bestPieces[p] = { "any": null };
    targetSets.forEach(s => { if(s && s !== "未選択") bestPieces[p][s] = null; });

    if (initialScores && initialScores[p] !== undefined && initialScores[p] > 0) {
      const initScore = initialScores[p];
      const defaultSet = getDefaultSetForSlot(gameId, p, targetSets);
      const dummyPiece = {
        part: p,
        main: mainStats[p] || "",
        score: initScore,
        substats: {},
        isTargetSet: defaultSet !== "other",
        setName: defaultSet,
        isOrnament: gameId === "starrail" && (p === "次元界オーブ" || p === "連結縄"),
        isInitial: true
      };
      bestPieces[p][defaultSet] = dummyPiece;
      bestPieces[p]["any"] = dummyPiece;
    }
  });
  
  let recycleQueue = 0;
  const defaults = GAME_DEFAULTS[gameId];
  const dungeonA = [targetSets[0], targetSets[1]].filter(s => s && s !== "未選択");
  const dungeonB = [targetSets[2], targetSets[3]].filter(s => s && s !== "未選択");
  const godPieces: any[] = [];

  let finalResult = { total: 0, substatTotal: 0, pieces: {} };

  // 1. 通常の厳選ループ
  for (let i = 0; i < totalAttempts; i++) {
    let currentPool = dungeonA;
    const pieces = finalResult.pieces as any;
    
    if (dungeonB.length > 0) {
      let scoreA = 0, countA = 0;
      let scoreB = 0, countB = 0;
      Object.values(pieces).forEach((art: any) => {
        if (!art) return;
        if (dungeonA.includes(art.setName)) { scoreA += art.score; countA++; }
        else if (dungeonB.includes(art.setName)) { scoreB += art.score; countB++; }
      });
      const avgA = countA > 0 ? scoreA / countA : 0;
      const avgB = countB > 0 ? scoreB / countB : 0;

      if (gameId === "starrail") {
        if (countA < 4) currentPool = dungeonA;
        else if (countB < 2) currentPool = dungeonB;
        else currentPool = avgA < avgB ? dungeonA : dungeonB;
      } else {
        currentPool = avgA < avgB ? dungeonA : dungeonB;
      }
    } else {
      currentPool = dungeonA;
    }

    let p = parts[Math.floor(Math.random() * parts.length)];
    if (gameId === "starrail") {
      const isA = currentPool === dungeonA;
      p = isA ? parts[Math.floor(Math.random() * 4)] : parts[4 + Math.floor(Math.random() * 2)];
    }

    const isOrnament = gameId === "starrail" && (p === "次元界オーブ" || p === "連結縄");
    const art = generateArtifact(gameId, p, subPool, scoreWeights, currentPool, isOrnament);
    if (art.score >= 58) godPieces.push(art);
    
    const isMainMatch = art.main === mainStats[p] || 
      p.includes("花") || p.includes("羽") || 
      p === "頭部" || p === "手部" || 
      p === "スロット1" || p === "スロット2" || p === "スロット3";

    if (isMainMatch) {
      if (art.isTargetSet && art.score > (bestPieces[p][art.setName]?.score || 0)) bestPieces[p][art.setName] = art;
      if (art.score > (bestPieces[p]["any"]?.score || 0)) bestPieces[p]["any"] = art;
    } else if (useRecycle) {
      recycleQueue++;
    }

    if (useRecycle && recycleQueue >= defaults.recycleRatio) {
      recycleQueue -= defaults.recycleRatio;
      const sp = parts[Math.floor(Math.random() * parts.length)];
      const isSOrnament = gameId === "starrail" && (sp === "次元界オーブ" || sp === "連結縄");
      let sPool = targetSets[0] && targetSets[0] !== "未選択" ? [targetSets[0]] : dungeonA;
      if (gameId === "starrail" && isSOrnament) sPool = dungeonB.length > 0 ? [dungeonB[0]] : sPool;

      const sart = generateArtifact(gameId, sp, subPool, scoreWeights, sPool, isSOrnament, true);
      if (sart.score >= 58) godPieces.push(sart);
      const isSMainMatch = sart.main === mainStats[sp] || 
        sp.includes("花") || sp.includes("羽") || 
        sp === "頭部" || sp === "手部" || 
        sp === "スロット1" || sp === "スロット2" || sp === "スロット3";

      if (isSMainMatch) {
        if (sart.isTargetSet && sart.score > (bestPieces[sp][sart.setName]?.score || 0)) bestPieces[sp][sart.setName] = sart;
        if (sart.score > (bestPieces[sp]["any"]?.score || 0)) bestPieces[sp]["any"] = sart;
      }
    }
    
    if (i % 20 === 0 || i === totalAttempts - 1) {
      finalResult = calculateBestCombo(gameId, bestPieces, targetSets);
    }
  }

  const scoreBeforeElixir = finalResult.substatTotal;

  // 2. 厳選終了後のエリクシル投入 (最適化処理)
  if (gameId === "genshin" && elixirConfig?.enabled) {
    const days = totalAttempts / (staminaPerDay / defaults.staminaCost);
    let totalElixirs = elixirConfig.initialCount + Math.floor(days / 42) * elixirConfig.perVersion;
    
    let improved = true;
    while (improved && totalElixirs > 0) {
      improved = false;
      const currentPieces = Object.entries(finalResult.pieces as Record<string, any>)
        .map(([slot, art]) => ({ slot, score: art?.score || 0 }))
        .sort((a, b) => a.score - b.score);

      for (const { slot } of currentPieces) {
        const cost = ELIXIR_COST[slot] || 1;
        if (totalElixirs >= cost) {
          const isTargetPart = slot === elixirConfig.targetPart;
          let targetMain = isTargetPart ? elixirConfig.targetMain : (mainStats[slot] || STAT_IDS.ATK_PER);
          
          // 固定メインステータスの強制適用 (花・羽)
          if (slot.includes("花")) targetMain = STAT_IDS.HP_FLAT;
          if (slot.includes("羽")) targetMain = STAT_IDS.ATK_FLAT;

          const sortedSubs = Object.entries(scoreWeights)
            .filter(([s]) => s !== targetMain && s !== "未選択")
            .sort((a, b) => b[1] - a[1])
            .map(e => e[0]);
          
          const s1 = isTargetPart ? elixirConfig.sub1 : sortedSubs[0];
          const s2 = isTargetPart ? elixirConfig.sub2 : sortedSubs[1];

          const tempConfig = { ...elixirConfig, targetPart: slot, targetMain, sub1: s1, sub2: s2 };
          const eArt = generateElixirArtifact(tempConfig, subPool, scoreWeights);
          
          if (eArt.score >= 58) godPieces.push(eArt);
          
          const currentEquippedSet = (finalResult.pieces as any)[slot]?.setName || targetSets[0];
          const finalSet = currentEquippedSet !== "その他" ? currentEquippedSet : targetSets[0];
          eArt.setName = finalSet;

          const currentBest = (bestPieces[slot][finalSet]?.score || 0);
          if (eArt.score > currentBest) {
            bestPieces[slot][finalSet] = eArt;
            if (eArt.score > (bestPieces[slot]["any"]?.score || 0)) bestPieces[slot]["any"] = eArt;
            improved = true;
          }
          
          totalElixirs -= cost;
          finalResult = calculateBestCombo(gameId, bestPieces, targetSets);
          if (improved) break; 
        }
      }
    }
  }

  return { 
    score: finalResult.substatTotal, 
    scoreBeforeElixir: scoreBeforeElixir,
    pieces: finalResult.pieces, 
    godPieces 
  };
}

// --- リサイクル効率比較シミュレーション ---
export function compareRecycleEfficiency(gameId: GameId, target: number, scoreWeights: Record<string, number>, subPool: string[], mainStats: Record<string, string>, targetSets: string[]) {
  const resultWithRecycle = simulateUntilScore(gameId, target, scoreWeights, subPool, true, mainStats, targetSets);
  const resultWithoutRecycle = simulateUntilScore(gameId, target, scoreWeights, subPool, false, mainStats, targetSets);

  const staminaSaved = resultWithoutRecycle.stamina - resultWithRecycle.stamina;
  const daysSaved = staminaSaved / GAME_DEFAULTS[gameId].dailyStamina;

  return {
    withRecycle: resultWithRecycle,
    withoutRecycle: resultWithoutRecycle,
    staminaSaved: staminaSaved,
    daysSaved: daysSaved,
  };
}
