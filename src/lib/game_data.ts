// 各タイトルのゲーム固有データ定義 (分割管理版)
import { GENSHIN_CHARACTERS, GENSHIN_SETS, GENSHIN_SLOTS, GENSHIN_MAIN_STATS, GENSHIN_SUB_STATS } from './genshin_data';
import { STARRAIL_CHARACTERS, STARRAIL_SETS, STARRAIL_SLOTS, STARRAIL_MAIN_STATS, STARRAIL_SUB_STATS } from './starrail_data';
import { ZZZ_CHARACTERS, ZZZ_SETS, ZZZ_SLOTS, ZZZ_MAIN_STATS, ZZZ_SUB_STATS } from './zzz_data';

export type GameId = "genshin" | "starrail" | "zzz";

export type GameConfig = {
  id: GameId;
  name: string;
  equipName: string; 
  color: string; 
  gradient: string;
  slots: string[];
  mainStats: string[];
  subStats: string[];
  sets: string[];
  characters: string[];
  storageKey: string;
};

export const GAME_CONFIGS: Record<GameId, GameConfig> = {
  genshin: {
    id: "genshin",
    name: "原神",
    equipName: "聖遺物",
    color: "purple",
    gradient: "from-purple-400 to-pink-600",
    slots: GENSHIN_SLOTS,
    mainStats: GENSHIN_MAIN_STATS,
    subStats: GENSHIN_SUB_STATS,
    sets: GENSHIN_SETS,
    characters: GENSHIN_CHARACTERS,
    storageKey: "artifact_chronicle_history",
  },

  starrail: {
    id: "starrail",
    name: "崩壊：スターレイル",
    equipName: "遺物",
    color: "blue",
    gradient: "from-blue-400 to-cyan-500",
    slots: STARRAIL_SLOTS,
    mainStats: STARRAIL_MAIN_STATS,
    subStats: STARRAIL_SUB_STATS,
    sets: STARRAIL_SETS,
    characters: STARRAIL_CHARACTERS,
    storageKey: "relic_chronicle_history",
  },

  zzz: {
    id: "zzz",
    name: "ゼンレスゾーンゼロ",
    equipName: "ドライブディスク",
    color: "orange",
    gradient: "from-orange-400 to-red-500",
    slots: ZZZ_SLOTS,
    mainStats: ZZZ_MAIN_STATS,
    subStats: ZZZ_SUB_STATS,
    sets: ZZZ_SETS,
    characters: ZZZ_CHARACTERS,
    storageKey: "disc_chronicle_history",
  }
};
