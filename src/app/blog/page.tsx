import React from 'react';
import Link from 'next/link';
import { ChevronRight, BookOpen, BarChart3, Star, Lightbulb, HelpCircle } from 'lucide-react';

const articles = [
  {
    title: "聖遺物シミュレーターの使い方",
    description: "当サイトのツールの基本的な使い方から、診断結果の詳しい見方までを解説します。",
    href: "/blog/how-to-use",
    icon: HelpCircle,
    color: "text-emerald-500",
    category: "Guide"
  },
  {
    title: "聖遺物スコアの計算方法と基準",
    description: "一般的に使われる「聖遺物スコア」の計算式や、目標とすべき基準値について詳しく解説。",
    href: "/blog/artifact-score-guide",
    icon: BarChart3,
    color: "text-blue-500",
    category: "Theory"
  },
  {
    title: "天賦育成 vs 聖遺物厳選の優先度",
    description: "樹脂をどちらに使うべきか？ダメージ効率の観点から、優先順位の考え方をまとめました。",
    href: "/blog/talent-vs-artifact",
    icon: Lightbulb,
    color: "text-yellow-500",
    category: "Strategy"
  },
  {
    title: "フリーナの聖遺物厳選ガイド",
    description: "フリーナに最適なセットやステータス、シミュレーターでの目標設定のコツを紹介。",
    href: "/blog/furina-artifact-guide",
    icon: Star,
    color: "text-cyan-500",
    category: "Character"
  },
  {
    title: "聖遺物のドロップ確率と期待値",
    description: "特定のステータスが出る確率はどれくらい？統計データに基づいたドロップ率の解説。",
    href: "/blog/artifact-probability",
    icon: BookOpen,
    color: "text-purple-500",
    category: "Data"
  },
  {
    title: "シミュレーション機能の詳細解説",
    description: "「期間シミュ」や「ランク診断」など、各モードのアルゴリズムや活用方法について。",
    href: "/blog/usage",
    icon: BookOpen,
    color: "text-slate-500",
    category: "Usage"
  }
];

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30">
      {/* Header */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-black italic tracking-tighter text-white">
            ARTIFACT-SIM<span className="text-emerald-500">.COM</span>
          </Link>
          <div className="text-xs font-black tracking-widest text-slate-500 uppercase">Guides & Articles</div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <header className="mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6 leading-none">
            GUIDE & <span className="text-emerald-500">ARTICLES</span>
          </h1>
          <p className="text-slate-400 max-w-2xl text-lg leading-relaxed">
            聖遺物シミュレーターを最大限に活用し、効率的なキャラクター育成を行うためのノウハウをまとめています。
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article, idx) => (
            <Link 
              key={idx} 
              href={article.href}
              className="group bg-slate-900/40 border border-slate-800 rounded-[32px] p-8 hover:border-emerald-500/30 hover:bg-slate-900/60 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-3 rounded-2xl bg-slate-950 border border-slate-800 ${article.color}`}>
                    <article.icon size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                    {article.category}
                  </span>
                </div>
                
                <h2 className="text-xl font-black text-white mb-3 group-hover:text-emerald-400 transition-colors">
                  {article.title}
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  {article.description}
                </p>
                
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-widest">
                  READ ARTICLE <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <section className="mt-24 p-10 bg-gradient-to-br from-emerald-600/10 to-transparent border border-emerald-500/10 rounded-[48px] text-center">
          <h2 className="text-2xl font-black text-white mb-4 italic">まだ使い方が分からない？</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto text-sm">
            ご不明な点や追加してほしい機能などがあれば、GitHubのリポジトリやSNSからお気軽にお問い合わせください。
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/" 
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-full transition-all shadow-xl shadow-emerald-900/20"
            >
              シミュレーターに戻る
            </Link>
          </div>
        </section>
      </main>

      <footer className="mt-20 pb-20 text-center border-t border-slate-900 pt-20">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700">© 2026 ARTIFACT-SIM.COM</p>
      </footer>
    </div>
  );
}
