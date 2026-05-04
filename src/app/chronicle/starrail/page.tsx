"use client";
import ChronicleForm from "@/components/ChronicleForm";
import { GAME_CONFIGS } from "@/lib/game_data";

export default function StarRailChronicle() {
  const config = GAME_CONFIGS.starrail;
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <a href="/chronicle" className="text-xs text-slate-500 hover:text-slate-300">← Chronicle Hub に戻る</a>
          <h1 className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${config.gradient}`}>
            {config.name} — {config.equipName} Chronicle
          </h1>
        </div>
        <ChronicleForm config={config} />
      </div>
    </div>
  );
}
