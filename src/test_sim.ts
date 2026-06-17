import { simulateUntilScore } from './lib/simulator';
import { STAT_IDS } from './lib/stats';

const gameId = "starrail";
const targetScore = 420;
const scoreWeights = {
  [STAT_IDS.CRIT_RATE]: 2.0,
  [STAT_IDS.CRIT_DMG]: 1.0,
  [STAT_IDS.SPEED]: 1.0,
  [STAT_IDS.ATK_PER]: 1.0,
};
const subPool = [
  STAT_IDS.CRIT_RATE,
  STAT_IDS.CRIT_DMG,
  STAT_IDS.SPEED,
  STAT_IDS.ATK_PER,
  STAT_IDS.HP_PER,
  STAT_IDS.DEF_PER,
  STAT_IDS.BREAK_EFFECT,
  STAT_IDS.EFFECT_HIT,
];
const useStrongbox = false;
const mainStats = {
  "頭部": STAT_IDS.HP_FLAT,
  "手部": STAT_IDS.ATK_FLAT,
  "胴体": STAT_IDS.CRIT_RATE,
  "脚部": STAT_IDS.SPEED,
  "次元界オーブ": "属性ダメージ",
  "連結縄": STAT_IDS.ATK_PER,
};
const targetSets = ["草の穂ガンマン", "草の穂ガンマン", "宇宙封印ステーション", "宇宙封印ステーション"];

const userPartScores = {
  "頭部": 70,
  "手部": 70,
  "胴体": 70,
  "脚部": 70,
  "次元界オーブ": 70,
  "連結縄": 70,
};

// 速度制限なしの場合
console.log("=== Running target speed: 0 (No limit) ===");
const resNoLimit = simulateUntilScore(
  gameId,
  targetScore,
  scoreWeights,
  subPool,
  useStrongbox,
  mainStats,
  targetSets,
  null,
  userPartScores,
  { targetSpeed: 0, baseSpeed: 95, currentSubSpeed: 0 }
);
console.log("Result (No Limit):", {
  attempts: resNoLimit.attempts,
  score: resNoLimit.score,
  stamina: resNoLimit.stamina,
});

// 速度制限ありの場合
console.log("=== Running target speed: 134 ===");
const resLimit = simulateUntilScore(
  gameId,
  targetScore,
  scoreWeights,
  subPool,
  useStrongbox,
  mainStats,
  targetSets,
  null,
  userPartScores,
  { targetSpeed: 134, baseSpeed: 95, currentSubSpeed: 0 }
);
console.log("Result (134 Limit):", {
  attempts: resLimit.attempts,
  score: resLimit.score,
  stamina: resLimit.stamina,
});
