// 汎用シミュレーターロジック (セット効果・詳細確率対応版)
import { GameId } from './game_data';

// --- サブステータス定義 ---
const GENSHIN_SUBSTAT_VALUES: Record<string, number[]> = {
  "会心率": [2.7, 3.1, 3.5, 3.9], "会心ダメージ": [5.4, 6.2, 7.0, 7.8],
  "攻撃力%": [4.1, 4.7, 5.3, 5.8], "HP%": [4.1, 4.7, 5.3, 5.8], "防御力%": [5.1, 5.8, 6.6, 7.3],
  "元素熟知": [16, 19, 21, 23], "元素チャージ効率": [4.5, 5.2, 5.8, 6.5],
  "攻撃力": [14, 16, 18, 19], "HP": [209, 239, 269, 299], "防御力": [16, 19, 21, 23],
};

const STARRAIL_SUBSTAT_VALUES: Record<string, number[]> = {
  "HP": [33, 38, 42], "攻撃力": [16, 19, 21], "防御力": [16, 19, 21],
  "HP%": [3.4, 3.8, 4.3], "攻撃力%": [3.4, 3.8, 4.3], "防御力%": [4.3, 4.8, 5.4],
  "会心率": [2.5, 2.9, 3.2], "会心ダメージ": [5.1, 5.8, 6.4],
  "速度": [2.0, 2.3, 2.6], "撃破特効": [5.1, 5.8, 6.4],
  "効果命中": [3.4, 3.8, 4.3], "効果抵抗": [3.4, 3.8, 4.3],
};

const ZZZ_SUBSTAT_VALUES: Record<string, number> = {
  "会心率": 2.4, "会心ダメージ": 4.8, "攻撃力%": 3.0, "HP%": 3.0, "防御力%": 4.8,
  "攻撃力": 19, "HP": 112, "防御力": 15, "異常マスタリー": 9, "異常掌握": 9, "貫通値": 9, "衝撃力": 1.2,
};

const getSubstatValue = (gameId: GameId, substatName: string): number => {
  if (gameId === "zzz") return ZZZ_SUBSTAT_VALUES[substatName] || 0;
  const values = gameId === "genshin" ? GENSHIN_SUBSTAT_VALUES[substatName] : STARRAIL_SUBSTAT_VALUES[substatName];
  return values ? values[Math.floor(Math.random() * values.length)] : 0;
};

// --- 出現確率 ---
export const MAIN_PROBS: Record<GameId, Record<string, Record<string, number>>> = {
  genshin: {
    "生の花": { "HP(固定値)": 100 }, "死の羽": { "攻撃力(固定値)": 100 },
    "時の砂": { "攻撃力%": 26.6, "HP%": 26.6, "防御力%": 26.6, "元素熟知": 10.0, "元素チャージ効率": 10.0 },
    "空の杯": { 
      "炎元素ダメージ": 5.0, "水元素ダメージ": 5.0, "風元素ダメージ": 5.0, "雷元素ダメージ": 5.0, 
      "草元素ダメージ": 5.0, "氷元素ダメージ": 5.0, "岩元素ダメージ": 5.0, "物理ダメージ": 5.0,
      "攻撃力%": 21.3, "HP%": 21.3, "防御力%": 20.0, "元素熟知": 2.5 
    },
    "理の冠": { "会心率": 10.0, "会心ダメージ": 10.0, "攻撃力%": 22.0, "HP%": 22.0, "防御力%": 22.0, "与える治癒効果": 10.0, "元素熟知": 4.0 }
  },
  starrail: {
    "頭部": { "HP(固定値)": 100 }, "手部": { "攻撃力(固定値)": 100 },
    "胴体": { "HP%": 18.0, "攻撃力%": 18.0, "防御力%": 18.0, "会心率": 10.0, "会心ダメージ": 10.0, "治癒量": 10.0, "効果命中": 10.0 },
    "脚部": { "HP%": 28.0, "攻撃力%": 28.0, "防御力%": 28.0, "速度": 16.0 },
    "次元界オーブ": { 
      "物理属性ダメージ": 9.0, "火属性ダメージ": 9.0, "氷属性ダメージ": 9.0, "雷属性ダメージ": 9.0, 
      "風属性ダメージ": 9.0, "量子属性ダメージ": 9.0, "虚数属性ダメージ": 9.0,
      "攻撃力%": 12.0, "HP%": 12.0, "防御力%": 12.0 
    },
    "連結縄": { "攻撃力%": 25.0, "HP%": 25.0, "防御力%": 25.0, "撃破特効": 20.0, "EP回復効率": 5.0 }
  },
  zzz: {
    "スロット1": { "HP(固定値)": 100 }, "スロット2": { "攻撃力(固定値)": 100 }, "スロット3": { "防御力(固定値)": 100 },
    "スロット4": { "攻撃力%": 25.0, "HP%": 25.0, "防御力%": 25.0, "会心率": 10.0, "会心ダメージ": 10.0, "異常マスタリー": 5.0 },
    "スロット5": { 
      "物理属性ダメージ": 12.0, "炎属性ダメージ": 12.0, "氷属性ダメージ": 12.0, "電気属性ダメージ": 12.0, "エーテル属性ダメージ": 12.0,
      "攻撃力%": 10.0, "HP%": 10.0, "防御力%": 10.0, "貫通率": 10.0 
    },
    "スロット6": { "攻撃力%": 20.0, "HP%": 20.0, "防御力%": 20.0, "衝撃力": 15.0, "異常掌握": 15.0, "エネルギー自動回復": 10.0 }
  }
};

const SUB_WEIGHTS: Record<GameId, Record<string, number>> = {
  genshin: { "会心率": 100, "会心ダメージ": 100, "攻撃力%": 100, "HP%": 100, "防御力%": 100, "元素チャージ効率": 100, "元素熟知": 100, "攻撃力(固定値)": 150, "HP(固定値)": 150, "防御力(固定値)": 150 },
  starrail: { "会心率": 4, "会心ダメージ": 4, "速度": 4, "攻撃力%": 8, "HP%": 8, "防御力%": 8, "効果命中": 8, "効果抵抗": 8, "撃破特効": 8, "攻撃力(固定値)": 10, "HP(固定値)": 10, "防御力(固定値)": 10 },
  zzz: { "会心率": 5, "会心ダメージ": 5, "攻撃力%": 10, "HP%": 10, "防御力%": 10, "異常マスタリー": 10, "貫通値": 10, "攻撃力(固定値)": 15, "HP(固定値)": 15, "防御力(固定値)": 15 }
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
        const avgRoll = s === "会心率" ? 2.9 : s === "会心ダメージ" ? 5.8 : s === "速度" ? 2.3 : 3.9;
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

// シミュレーション (目標スコア)
export function simulateUntilScore(gameId: GameId, target: number, scoreWeights: Record<string, number>, subPool: string[], useRecycle: boolean, mainStats: Record<string, string>, targetSets: string[], elixirConfig?: ElixirConfig | null) {
  const parts = Object.keys(MAIN_PROBS[gameId]);
  const bestPieces: Record<string, Record<string, any>> = {};
  parts.forEach(p => {
    bestPieces[p] = { "any": null };
    targetSets.forEach(s => { if(s && s !== "未選択") bestPieces[p][s] = null; });
  });
  
  let attempts = 0;
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
              const targetMain = isTargetPart ? elixirConfig.targetMain : (mainStats[slot] || "攻撃力%");
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
    if (finalResult.substatTotal >= target) break;
  }
  return { 
    attempts, 
    stamina: attempts * defaults.staminaCost, 
    pieces: finalResult.pieces, 
    score: finalResult.substatTotal, 
    scoreBeforeElixir: finalResult.substatTotal, // 目標診断では投入前も後も同じ（目標達成した瞬間なので）
    godPieces 
  };
}

// シミュレーション (固定期間)
export function simulateFixedAttempts(gameId: GameId, totalAttempts: number, staminaPerDay: number, scoreWeights: Record<string, number>, subPool: string[], useRecycle: boolean, mainStats: Record<string, string>, targetSets: string[], elixirConfig?: ElixirConfig | null) {
  const parts = Object.keys(MAIN_PROBS[gameId]);
  const bestPieces: Record<string, Record<string, any>> = {};
  parts.forEach(p => {
    bestPieces[p] = { "any": null };
    targetSets.forEach(s => { if(s && s !== "未選択") bestPieces[p][s] = null; });
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
          const targetMain = isTargetPart ? elixirConfig.targetMain : (mainStats[slot] || "攻撃力%");
          
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
