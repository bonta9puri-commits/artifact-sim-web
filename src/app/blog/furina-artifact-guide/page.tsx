import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ChevronLeft, Calendar, User, Clock, Droplets, ShieldCheck, Zap, Target } from 'lucide-react';

export const metadata: Metadata = {
  title: "フリーナの聖遺物厳選はどこまで目指すべき？黄金の劇団の目標スコアを考える | Artifact Sim Blog",
  description: "フリーナの理想聖遺物「黄金の劇団」の厳選目標を解説。会心スコアだけでなくHP%や元素チャージ効率の重要性、シミュレーターを使った現実的な目標設定のコツを紹介します。",
  openGraph: {
    title: "フリーナの聖遺物厳選はどこまで目指すべき？黄金の劇団の目標スコアを考える",
    description: "HPとチャージ、会心のバランスをどう取るべきか？",
    images: ['/blog/furina-guide.png'],
  }
};

export default function FurinaGuidePost() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header / Nav */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={16} />
            トップに戻る
          </Link>
          <div className="text-xs font-black tracking-widest text-sky-400 uppercase">Character Guide</div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        {/* Article Header */}
        <header className="mb-12">
          <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
            <span className="flex items-center gap-1"><Calendar size={12} /> 2026.05.09</span>
            <span className="flex items-center gap-1"><User size={12} /> 管理人</span>
            <span className="flex items-center gap-1"><Clock size={12} /> 読了目安: 5分</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter">
            フリーナの聖遺物厳選は<br className="hidden md:block" />どこまで目指すべき？<br />
            <span className="text-sky-400">「黄金の劇団」</span>の目標スコア
          </h1>
        </header>

        {/* Article Body */}
        <article className="prose prose-invert prose-sky max-w-none space-y-8 text-slate-300 leading-relaxed">
          <section className="space-y-4">
            <p className="text-lg text-slate-200 font-medium leading-relaxed">
              フリーナは、原神の中でも非常に強力なサポート・サブアタッカーです。
            </p>
            <p>
              聖遺物では「黄金の劇団」がよく使われ、会心系やHP%、元素チャージ効率など、複数のステータスを意識する必要があります。
            </p>
            <p>
              この記事では、フリーナの聖遺物厳選でどこまで目指すべきかを考えていきます。
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white pt-8 border-t border-slate-800 flex items-center gap-2">
              <Droplets className="text-sky-400" size={24} /> 
              フリーナに重要なステータス
            </h2>
            <p>
              フリーナの聖遺物厳選では、主に次のステータスが重要になります。
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center">
                <Target className="mx-auto mb-2 text-rose-500" size={20} />
                <span className="text-xs font-bold">会心率</span>
              </div>
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center">
                <Target className="mx-auto mb-2 text-rose-400" size={20} />
                <span className="text-xs font-bold">会心ダメ</span>
              </div>
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center">
                <ShieldCheck className="mx-auto mb-2 text-emerald-400" size={20} />
                <span className="text-xs font-bold">HP%</span>
              </div>
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center">
                <Zap className="mx-auto mb-2 text-yellow-400" size={20} />
                <span className="text-xs font-bold">チャージ効率</span>
              </div>
            </div>
            <p>
              フリーナはHPを参照してダメージを出すキャラクターなので、<b>攻撃力よりもHP%の価値が高くなります。</b>
              また、元素爆発のバフ回転が生命線となるため、元素チャージ効率が不足していると、どれだけ会心が高くてもパーティ全体の火力は落ちてしまいます。
            </p>
            <p className="bg-sky-500/10 border-l-4 border-sky-500 p-4 text-sm italic">
              「単純に会心スコアだけを追いかけるよりも、HP%やチャージ効率も含めたトータルバランスが大切です。」
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white pt-8 border-t border-slate-800">
              聖遺物セットは「黄金の劇団」一択？
            </h2>
            <p>
              サブアタッカー運用では「黄金の劇団」が最も一般的です。元素スキルのダメージを大幅に伸ばしやすく、控えから攻撃するフリーナの性能と完璧に合致しています。
            </p>
            <p>
              目標スコアを考えるときは、まず現在のビルドを確認しましょう。
              すでに会心率・会心ダメージがある程度確保できているなら、次に重要になるのはHP%や元素チャージ効率の「底上げ」です。
            </p>
          </section>

          {/* Guide Image */}
          <figure className="my-12">
            <div className="bg-slate-900 rounded-[32px] p-2 border border-slate-800 shadow-2xl overflow-hidden">
              <img 
                src="/blog/furina-guide.png" 
                alt="フリーナ厳選ガイドのイメージ" 
                className="rounded-[28px] w-full"
              />
            </div>
          </figure>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white pt-8 border-t border-slate-800">
              シミュレーターで現実を知る
            </h2>
            <p>
              当サイトのシミュレーターでは、フリーナ向けの目標スコアを設定して、到達までにどれくらいの日数がかかるかを確認できます。
            </p>
            <p>
              目標スコアを高く設定しすぎると、中央値でも「1年以上の周回が必要」といった結果が出ることがあります。その場合は、以下のような判断の材料にしてください。
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-sky-400 mt-1">▶</span>
                <span><b>まずは実用ライン（スコア160〜180）を目指す</b></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-400 mt-1">▶</span>
                <span><b>天賦レベル10（王冠使用）を優先する</b></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-400 mt-1">▶</span>
                <span><b>一旦切り上げて、他キャラの厳選に移る</b></span>
              </li>
            </ul>
            <p>
              フリーナの場合、完璧な聖遺物を狙い続けるよりも、ある程度のラインで止めて、パーティ全体（アタッカーなど）の育成を進めた方が強くなることも多いです。
            </p>
          </section>

          <section className="bg-sky-600/5 border border-sky-600/20 p-8 rounded-[40px] mt-12">
            <h2 className="text-2xl font-black text-sky-400 mb-4 text-center">まとめ</h2>
            <p className="mb-4">
              フリーナの聖遺物厳選では、会心スコアだけでなく、<b>HP%と元素チャージ効率</b>も非常に重要です。
            </p>
            <p className="mb-6 text-sm text-center">
              黄金の劇団を厳選する場合でも、目標を高くしすぎるとかなり長期間かかる可能性があります。
              シミュレーターを使って、現実的な目標ラインを確認しながら厳選するのがおすすめです。
            </p>
            <div className="flex justify-center">
              <Link 
                href="/" 
                className="px-10 py-4 bg-sky-600 hover:bg-sky-500 text-white font-black text-sm rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl shadow-sky-600/20"
              >
                フリーナの厳選をシミュレート
              </Link>
            </div>
          </section>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center text-slate-600">
          <p className="text-xs">© 2026 Artifact Sim Blog - キャラクター別最適化ガイド</p>
        </div>
      </footer>
    </div>
  );
}
