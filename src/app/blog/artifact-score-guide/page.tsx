import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ChevronLeft, Calendar, User, Clock, Calculator, AlertTriangle, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: "聖遺物スコアとは？原神でよく使われる評価方法を初心者向けに解説 | Artifact Sim Blog",
  description: "原神の聖遺物評価で使われる「聖遺物スコア」の計算方法（会心率×2＋ダメージ）や目安、注意点をわかりやすく解説。スコアだけではないステータス選びのコツも紹介します。",
  openGraph: {
    title: "聖遺物スコアとは？原神でよく使われる評価方法を初心者向けに解説",
    description: "スコアの計算方法から、キャラ別の注意点まで徹底解説。",
    images: ['/blog/score-formula.png'],
  }
};

export default function ScoreGuidePost() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header / Nav */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={16} />
            トップに戻る
          </Link>
          <div className="text-xs font-black tracking-widest text-blue-500 uppercase">Artifact Sim Blog</div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        {/* Article Header */}
        <header className="mb-12">
          <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
            <span className="flex items-center gap-1"><Calendar size={12} /> 2026.05.08</span>
            <span className="flex items-center gap-1"><User size={12} /> 管理人</span>
            <span className="flex items-center gap-1"><Clock size={12} /> 読了目安: 4分</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter">
            聖遺物スコアとは？<br className="hidden md:block" />
            <span className="text-blue-500">原神でよく使われる評価方法</span>を<br />初心者向けに解説
          </h1>
        </header>

        {/* Article Body */}
        <article className="prose prose-invert prose-blue max-w-none space-y-8 text-slate-300 leading-relaxed">
          <section className="space-y-4">
            <p className="text-lg text-slate-200 font-medium leading-relaxed">
              原神の聖遺物を評価するとき、「スコア」という言葉を見かけることがあります。
            </p>
            <p>
              特に会心率と会心ダメージを重視するキャラクターでは、聖遺物の強さをざっくり判断するためにスコアが使われることが多いです。
            </p>
            <p>
              この記事では、聖遺物スコアの考え方と、シミュレーターでスコアを見るときの注意点を解説します。
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white pt-8 border-t border-slate-800 flex items-center gap-2">
              <Calculator className="text-blue-500" size={24} /> 
              聖遺物スコアの計算方法
            </h2>
            <p>
              聖遺物スコアとは、聖遺物のサブステータスを数値化して、どれくらい強い聖遺物かを判断するための目安です。
            </p>
            <p>
              一般的には、<b>会心率と会心ダメージ</b>を使って計算されることが多いです。よく使われる計算式は以下の通りです。
            </p>
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] text-center my-8 shadow-xl">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">一般的な計算式</p>
              <p className="text-2xl md:text-3xl font-black text-white">会心率 × 2 + 会心ダメージ</p>
            </div>
            <p>
              たとえば、会心率が10%、会心ダメージが20%の聖遺物なら、
              <code className="mx-1 px-2 py-1 bg-slate-800 rounded text-blue-400 font-bold">10 × 2 + 20 = 40</code>
              となり、<b>「スコア40の聖遺物」</b>として扱えます。
            </p>
            <p>
              会心率を2倍にする理由は、原神のシステム上、会心率1%と会心ダメージ2%がほぼ同じ価値（聖遺物の伸び幅の比率）として設定されているためです。
            </p>
          </section>

          {/* Infographic Image */}
          <figure className="my-12">
            <div className="bg-slate-900 rounded-[32px] p-2 border border-slate-800 shadow-2xl overflow-hidden">
              <img 
                src="/blog/score-formula.png" 
                alt="聖遺物スコアの計算例" 
                className="rounded-[28px] w-full"
              />
            </div>
            <figcaption className="text-center text-xs text-slate-500 mt-4 italic">
              サブステータスの数値だけで強さを可視化する一般的な手法
            </figcaption>
          </figure>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white pt-8 border-t border-slate-800 flex items-center gap-2">
              <AlertTriangle className="text-yellow-500" size={24} /> 
              スコアが高ければ最強？注意点
            </h2>
            <p className="font-bold text-slate-200">
              ただし、スコアが高ければ必ずしもそのキャラクターにとって最強というわけではありません。
            </p>
            <p>
              キャラクターによっては、攻撃力%、HP%、元素チャージ効率、元素熟知などが非常に重要になる場合があります。
            </p>
            <ul className="space-y-4 list-none p-0">
              <li className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800">
                <span className="text-emerald-400 font-bold block mb-1">● HPや防御を参照するキャラ</span>
                フリーナのようにHPを参照するキャラクターでは、HP%も重要なステータスになります。攻撃力が伸びてスコアが高くなっても、ダメージアップには繋がりません。
              </li>
              <li className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800">
                <span className="text-emerald-400 font-bold block mb-1">● 元素爆発が重要なキャラ</span>
                元素爆発を回すことが前提のキャラクターでは、元素チャージ効率が不足していると、どれだけ会心スコアが高くても実戦では使いにくい場合があります。
              </li>
            </ul>
            <p className="text-sm italic text-slate-500">
              ※つまり、聖遺物スコアは便利な目安ですが、最終的にはキャラクターごとの「必要ステータス」も考える必要があります。
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white pt-8 border-t border-slate-800 flex items-center gap-2">
              <CheckCircle className="text-blue-500" size={24} /> 
              シミュレーターでの活用方法
            </h2>
            <p>
              当サイトのシミュレーターでは、キャラクターや条件に応じて、目標スコアまでにどれくらいかかるかを計算できます。
            </p>
            <p>
              「スコア50を目指したい（パーツ単体）」「スコア200のビルドを作りたい（合計）」といった目標を設定することで、厳選に必要な樹脂量や日数の目安を確認できます。
            </p>
            <p>
              自分のキャラクターに合った<b>「重み付け（スコアへの貢献度）」</b>を調整して、より正確な厳選シミュレーションを行ってみてください。
            </p>
          </section>

          <section className="bg-blue-600/5 border border-blue-600/20 p-8 rounded-[40px] mt-12 text-center">
            <h2 className="text-2xl font-black text-blue-400 mb-4">まとめ</h2>
            <p className="max-w-md mx-auto mb-6 text-sm">
              聖遺物スコアは、聖遺物の強さをざっくり見るために便利な指標です。
              スコアだけで判断するのではなく、実際のビルドやダメージ、必要ステータスも合わせて考えるのがおすすめです。
            </p>
            <div className="pt-2">
              <Link 
                href="/" 
                className="inline-block px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/20"
              >
                スコア目標を設定してシミュレート
              </Link>
            </div>
          </section>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center text-slate-600">
          <p className="text-xs">© 2026 Artifact Sim Blog - 聖遺物評価の基本と応用</p>
        </div>
      </footer>
    </div>
  );
}
