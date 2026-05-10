"use client";

import React, { useState, useRef, useEffect } from "react";
import { createWorker } from "tesseract.js";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { GameConfig } from "@/lib/game_data";

type Substat = { id: number; type: string; value: string };
type SavedArtifact = {
  id: string; date: string; slot: string; mainStat: string;
  substats: Substat[]; score: number; setName: string; character: string;
};

export default function ChronicleForm({ config }: { config: GameConfig }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [slot, setSlot] = useState("未選択");
  const [mainStat, setMainStat] = useState("未選択");
  const [setName, setSetName] = useState("未選択");
  const [character, setCharacter] = useState("未選択");
  const [substats, setSubstats] = useState<Substat[]>([
    {id:1,type:"未選択",value:""},{id:2,type:"未選択",value:""},
    {id:3,type:"未選択",value:""},{id:4,type:"未選択",value:""},
  ]);
  const [savedArtifacts, setSavedArtifacts] = useState<SavedArtifact[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(config.storageKey);
    if (saved) { try { setSavedArtifacts(JSON.parse(saved)); } catch(e) { console.error(e); } }
  }, [config.storageKey]);

  const resetForm = () => {
    setSlot("未選択"); setMainStat("未選択"); setSetName("未選択"); setCharacter("未選択");
    setSubstats([{id:1,type:"未選択",value:""},{id:2,type:"未選択",value:""},{id:3,type:"未選択",value:""},{id:4,type:"未選択",value:""}]);
    setSelectedImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const url = URL.createObjectURL(file); setSelectedImage(url); setProgressText(""); resetForm(); setSelectedImage(url); }
  };

  const parseOCRText = (text: string) => {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const subs: Substat[] = []; let idc = 1;
    let dSlot = "未選択", dMain = "未選択", dSet = "未選択";

    for (const line of lines) {
      for (const s of config.slots) { if (s !== "未選択" && line.includes(s)) dSlot = s; }
      for (const s of config.sets) { if (s !== "未選択" && line.includes(s)) dSet = s; }
      for (const s of config.mainStats) {
        if (s !== "未選択" && s.length >= 3 && line.includes(s)) dMain = s;
      }

      const numMatch = line.match(/[\d.]+/);
      if (!numMatch) continue;
      const value = numMatch[0];
      let type = "未選択";
      for (const st of config.subStats) {
        if (st !== "未選択" && line.includes(st.replace(/[(%固定値)]/g, ''))) { type = st; break; }
      }
      if (type !== "未選択") subs.push({ id: idc++, type, value });
    }

    const final = [];
    for (let i = 0; i < 4; i++) final.push(subs[i] || { id: i+1, type: "未選択", value: "" });
    setSubstats(final);
    if (dSlot !== "未選択") setSlot(dSlot);
    if (dMain !== "未選択") setMainStat(dMain);
    if (dSet !== "未選択") setSetName(dSet);
  };

  const handleTriggerOCR = async () => {
    if (!selectedImage) return;
    setIsProcessing(true); setProgressText("OCRエンジンを準備中...");
    try {
      const worker = await createWorker('jpn', 1, {
        logger: (m) => { if (m.status === 'recognizing text') setProgressText(`解析中... ${Math.round(m.progress * 100)}%`); }
      });
      const { data: { text } } = await worker.recognize(selectedImage);
      parseOCRText(text);
      await worker.terminate();
      setProgressText("解析完了！手動で修正してください。");
    } catch (error) { console.error(error); setProgressText("エラーが発生しました。"); }
    finally { setIsProcessing(false); }
  };

  const updateSubstat = (id: number, field: "type"|"value", v: string) => {
    setSubstats(prev => prev.map(s => s.id === id ? { ...s, [field]: v } : s));
  };

  const handleSave = () => {
    if (slot === "未選択" || mainStat === "未選択") { alert("部位とメインステータスを選択してください。"); return; }
    let score = 0;
    substats.forEach(s => {
      const val = parseFloat(s.value) || 0;
      if (s.type === "会心率") score += val * 2;
      else if (s.type === "会心ダメージ") score += val;
      else if (s.type === "攻撃力%") score += val;
    });
    const art: SavedArtifact = {
      id: Date.now().toString(), date: new Date().toLocaleDateString("ja-JP"),
      slot, mainStat, substats: [...substats], score: Math.round(score*10)/10, setName, character,
    };
    const updated = [art, ...savedArtifacts];
    setSavedArtifacts(updated);
    localStorage.setItem(config.storageKey, JSON.stringify(updated));
    alert(`保存しました！（スコア: ${art.score}）`);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("削除しますか？")) return;
    const updated = savedArtifacts.filter(a => a.id !== id);
    setSavedArtifacts(updated); localStorage.setItem(config.storageKey, JSON.stringify(updated));
  };

  const total = savedArtifacts.length;
  const avgScore = total > 0 ? (savedArtifacts.reduce((s,a) => s+a.score, 0) / total).toFixed(1) : "0";
  const maxScore = total > 0 ? Math.max(...savedArtifacts.map(a => a.score)).toFixed(1) : "0";
  const chartData = [...savedArtifacts].reverse().map((a, i) => ({ name: `#${i+1}`, score: a.score }));

  // インサイト
  const generateInsights = () => {
    if (total < 3) return [];
    const hints: { icon: string; text: string; color: string }[] = [];
    const recent = savedArtifacts.slice(0, Math.min(5, total));
    const recentAvg = recent.reduce((s, a) => s + a.score, 0) / recent.length;
    const totalAvg = parseFloat(avgScore);

    if (recentAvg < totalAvg * 0.8) hints.push({ icon: "😮‍💨", text: "直近のスコアが全体平均より低め。気分転換も大事かも。", color: "text-amber-400" });
    else if (recentAvg > totalAvg * 1.2) hints.push({ icon: "🔥", text: "直近のスコアが好調！この流れに乗るのもアリ。", color: "text-emerald-400" });

    const highCount = savedArtifacts.filter(a => a.score >= 40).length;
    if (total >= 5 && highCount === 0) hints.push({ icon: "🎯", text: "スコア40超えはまだだけど、厳選は長期戦。焦らずいこう。", color: "text-slate-400" });
    else if (highCount >= 3) hints.push({ icon: "🏆", text: `スコア40超えが${highCount}個。他キャラの育成に目を向けても良いかも。`, color: "text-yellow-400" });

    return hints.slice(0, 3);
  };
  const insights = generateInsights();

  return (
    <div className="space-y-12">
      {/* Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 text-center">
          <div className="text-slate-400 text-sm font-bold mb-1">登録済み</div>
          <div className="text-4xl font-black text-white">{total} <span className="text-lg text-slate-500 font-normal">個</span></div>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 text-center">
          <div className="text-slate-400 text-sm font-bold mb-1">平均スコア</div>
          <div className="text-4xl font-black text-blue-400">{avgScore}</div>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 text-center">
          <div className="text-slate-400 text-sm font-bold mb-1">最高スコア</div>
          <div className="text-4xl font-black text-pink-400">{maxScore}</div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length >= 2 && (
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold">📈 スコア推移</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }} />
                <Line type="monotone" dataKey="score" stroke="#a855f7" strokeWidth={2} dot={{ fill: '#a855f7', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-slate-900/30 p-6 rounded-2xl border border-slate-800 space-y-3">
          <h2 className="text-lg font-bold">💡 ひとこと（参考程度に）</h2>
          <div className="space-y-2">
            {insights.map((h, i) => (
              <div key={i} className="flex items-start gap-3 bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                <span className="text-xl shrink-0">{h.icon}</span>
                <p className={`text-sm ${h.color}`}>{h.text}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600 text-right">※ 登録データに基づく参考情報です</p>
        </div>
      )}

      {/* OCR & Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900/30 p-6 md:p-8 rounded-3xl border border-slate-800/80">
        <div className="space-y-6">
          <h2 className="text-xl font-bold">1️⃣ スクショから読み取り</h2>
          <div onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-purple-500/50 rounded-xl p-4 text-center cursor-pointer transition-colors min-h-[200px] flex flex-col items-center justify-center bg-slate-950/50">
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
            {selectedImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selectedImage} alt="Equipment" className="max-h-64 rounded object-contain" />
            ) : (
              <div className="space-y-2 text-slate-400"><div className="text-4xl">📸</div><p>クリックしてスクショをアップロード</p></div>
            )}
          </div>
          {selectedImage && (
            <button onClick={handleTriggerOCR} disabled={isProcessing}
              className={`w-full py-3 rounded-lg font-bold transition-all ${isProcessing ? "bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20"}`}>
              {isProcessing ? progressText : "▶ AIで自動入力する"}
            </button>
          )}
        </div>

        <div className="space-y-5">
          <h2 className="text-xl font-bold">2️⃣ 結果の確認・保存</h2>
          <div className="grid grid-cols-2 gap-3 pb-4 border-b border-slate-800">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">セット名</label>
              <select value={setName} onChange={e => setSetName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 outline-none focus:border-purple-500">
                {config.sets.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">装備キャラ</label>
              <select value={character} onChange={e => setCharacter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 outline-none focus:border-purple-500">
                {config.characters.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pb-4 border-b border-slate-800">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">部位</label>
              <select value={slot} onChange={e => setSlot(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 outline-none focus:border-purple-500">
                {config.slots.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">メインステータス</label>
              <select value={mainStat} onChange={e => setMainStat(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-slate-200 outline-none focus:border-purple-500">
                {config.mainStats.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500">サブステータス</label>
            {substats.map((stat, i) => (
              <div key={stat.id} className="flex gap-2 items-center bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-600 font-bold w-5 text-center text-sm">{i+1}</span>
                <select value={stat.type} onChange={e => updateSubstat(stat.id, "type", e.target.value)}
                  className="flex-1 bg-transparent border-none rounded p-1 text-sm text-slate-200 outline-none">
                  {config.subStats.map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                </select>
                <input type="text" value={stat.value} onChange={e => updateSubstat(stat.id, "value", e.target.value)}
                  placeholder="数値" className="w-20 bg-slate-900 border border-slate-700 rounded p-1 text-sm text-slate-200 outline-none text-right" />
              </div>
            ))}
          </div>
          <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex justify-center items-center gap-2"
            onClick={handleSave}>
            💾 コレクションに保存する
          </button>
        </div>
      </div>

      {/* Gallery */}
      <div className="space-y-6 pt-8 border-t border-slate-800">
        <h2 className="text-2xl font-bold">📚 {config.equipName} Gallery</h2>
        {savedArtifacts.length === 0 ? (
          <div className="text-center p-12 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
            <p className="text-slate-500">まだ保存された{config.equipName}がありません。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedArtifacts.map(a => (
              <div key={a.id} className="bg-slate-900 p-4 rounded-xl border border-slate-700 hover:border-slate-500 transition-colors relative group">
                <div className="flex justify-between items-start mb-1">
                  <div className="text-xs text-slate-500">{a.date}</div>
                  <div className="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono border border-slate-800 text-pink-400">{a.score.toFixed(1)}</div>
                </div>
                {a.setName && a.setName !== "未選択" && <div className="text-xs text-purple-400 mb-1">{a.setName}</div>}
                <div className="font-bold text-white text-sm mb-2">{a.slot} <span className="text-slate-600">/</span> {a.mainStat}</div>
                {a.character && a.character !== "未選択" && <div className="text-xs text-emerald-400 mb-2">👤 {a.character}</div>}
                <div className="space-y-0.5 bg-slate-950 p-2 rounded-lg border border-slate-800/50">
                  {a.substats.filter(s => s.type !== "未選択" && s.value).map((s, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-slate-400">{s.type}</span>
                      <span className="font-mono text-slate-200">+{s.value}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => handleDelete(a.id)}
                  className="absolute top-2 right-8 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1" title="削除">🗑️</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
