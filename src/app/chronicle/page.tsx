"use client";

import React, { useState, useEffect } from "react";
import { GAME_CONFIGS, type GameId } from "@/lib/game_data";

type SavedArtifact = { id: string; score: number; date: string; };

export default function ChronicleHub() {
  const [stats, setStats] = useState<Record<GameId, { total: number; avg: string; max: string }>>({
    genshin: { total: 0, avg: "0", max: "0" },
    starrail: { total: 0, avg: "0", max: "0" },
    zzz: { total: 0, avg: "0", max: "0" },
  });

  useEffect(() => {
    const newStats = {} as Record<GameId, { total: number; avg: string; max: string }>;
    for (const [id, config] of Object.entries(GAME_CONFIGS)) {
      const saved = localStorage.getItem(config.storageKey);
      let items: SavedArtifact[] = [];
      if (saved) { try { items = JSON.parse(saved); } catch(e) { console.error(e); } }
      const total = items.length;
      const avg = total > 0 ? (items.reduce((s, a) => s + a.score, 0) / total).toFixed(1) : "0";
      const max = total > 0 ? Math.max(...items.map(a => a.score)).toFixed(1) : "0";
      newStats[id as GameId] = { total, avg, max };
    }
    setStats(newStats);
  }, []);

  const grandTotal = Object.values(stats).reduce((s, g) => s + g.total, 0);

  const gameCards: { id: GameId; emoji: string }[] = [
    { id: "genshin", emoji: "⚔️" },
    { id: "starrail", emoji: "🚂" },
    { id: "zzz", emoji: "📺" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-12">

        {/* Header */}
        <div className="text-center space-y-3">
          <a href="/" className="text-xs text-slate-500 hover:text-slate-300">← シミュレーターに戻る</a>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400">
            Artifact Chronicle Hub
          </h1>
          <p className="text-slate-400">ホヨバース3タイトルの厳選記録を一元管理</p>
        </div>

        {/* Grand Total */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-3xl border border-slate-700 text-center space-y-2">
          <div className="text-slate-400 text-sm font-bold">全タイトル合計の登録数</div>
          <div className="text-6xl font-black text-white">{grandTotal}</div>
          <div className="text-slate-500 text-sm">あなたの「徳」の総量</div>
        </div>

        {/* Game Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {gameCards.map(({ id, emoji }) => {
            const config = GAME_CONFIGS[id];
            const s = stats[id];
            return (
              <a
                key={id}
                href={`/chronicle/${id}`}
                className="block bg-slate-900 p-6 rounded-2xl border border-slate-700 hover:border-slate-500 transition-all hover:scale-[1.02] hover:shadow-xl group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{emoji}</span>
                  <div>
                    <div className={`font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r ${config.gradient}`}>
                      {config.name}
                    </div>
                    <div className="text-xs text-slate-500">{config.equipName} Chronicle</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-slate-950 p-2 rounded-lg text-center">
                    <div className="text-xs text-slate-500">登録</div>
                    <div className="text-lg font-black text-white">{s.total}</div>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg text-center">
                    <div className="text-xs text-slate-500">平均</div>
                    <div className="text-lg font-black text-blue-400">{s.avg}</div>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg text-center">
                    <div className="text-xs text-slate-500">最高</div>
                    <div className="text-lg font-black text-pink-400">{s.max}</div>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
                  記録を開く →
                </div>
              </a>
            );
          })}
        </div>

      </div>
    </div>
  );
}
