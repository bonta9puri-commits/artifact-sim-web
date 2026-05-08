import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ChevronLeft, Calendar, User, Clock, Swords, BookOpen, Repeat, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: "天賦育成と聖遺物厳選はどっちを優先？樹脂の使い道を考える | Artifact Sim Blog",
  description: "原神の限られた樹脂をどこに使うべきか？確実に強くなれる「天賦育成」と、運要素の強い「聖遺物厳選」の効率的なバランスについて、シミュレーターの視点から詳しく解説します。",
  openGraph: {
    title: "天賦育成と聖遺物厳選はどっちを優先？樹脂の使い道を考える",
    description: "確実に強くなるか、運に賭けるか。最適な樹脂の使い方。",
    images: ['/blog/talent-vs-artifact.png'],
  }
};

export default function TalentVsArtifactPost() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={16} />
            トップに戻る
          </Link>
          <div className="text-xs font-black tracking-widest text-amber-500 uppercase">Resin Guide</div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <header className="mb-12">
          <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
            <span className="flex items-center gap-1"><Calendar size={12} /> 2026.05.09</span>
            <span className="flex items-center gap-1"><User size={12} /> 管理人</span>
            <span className="flex items-center gap-1"><Clock size={12} /> 読了目安: 5分</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter">
            <span className="text-amber-500">天賦育成</span>と<span className="text-emerald-500">聖遺物厳選</span>、<br />
            どっちを優先するべき？<br />
            <span className="text-xl md:text-2xl text-slate-400">樹脂の使い道を徹底考察</span>
          </h1>
        </header>

        <article className="prose prose-invert prose-amber max-w-none space-y-8 text-slate-300 leading-relaxed">
          <section className="space-y-4">
            <p className="text-lg text-slate-200 font-medium leading-relaxed">
              原神では、キャラクターを強くするために樹脂を使う場面が多くあります。
              聖遺物厳選、天賦素材、武器素材、ボス素材など、どこに樹脂を使うべきか迷うことも多いです。
            </p>
            <p>
              特に聖遺物厳選は終わりが見えにくいため、天賦育成とどちらを優先するべきか悩みやすいポイントです。
            </p>
          </section>

          {/* Key Comparison Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-10">
            <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl">
              <div className="flex items-center gap-2 text-amber-400 font-black mb-3 italic">
                <BookOpen size={20} /> TALENT LEVEL
              </div>
              <p className="text-sm font-bold text-slate-200 mb-2">天賦育成：確実に強くなる</p>
              <p className="text-xs leading-relaxed">必要な樹脂量が計算でき、投資した分だけ100%確実にステータスや倍率が上昇します。</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl">
              <div className="flex items-center gap-2 text-emerald-400 font-black mb-3 italic">
                <Repeat size={20} /> ARTIFACT FARM
              </div>
              <p className="text-sm font-bold text-slate-200 mb-2">聖遺物厳選：運次第で激変</p>
              <p className="text-xs leading-relaxed">上振れれば最強になりますが、何ヶ月周回しても成果がゼロになるリスクがあります。</p>
            </div>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white pt-8 border-t border-slate-800">
              「確実な成長」を優先するべき理由
            </h2>
            <p>
              結論から言うと、<b>まだ天賦レベルが十分に上がっていない場合は、天賦育成を優先した方が効率が良いことが多い</b>です。
            </p>
            <p>
              理由は、天賦育成は必要な素材数（＝消費樹脂）がある程度決まっていて、確実にキャラクターを強化できるからです。
              一方で、聖遺物厳選は運要素が大きく、同じ樹脂を使っても成果が出るとは限りません。
            </p>
            <p>
              たとえば、数日で理想に近い聖遺物が出ることもありますが、何十日、何百日と周回しても目標に届かないこともあります。
            </p>
          </section>

          {/* Comparison Visual */}
          <figure className="my-12">
            <div className="bg-slate-900 rounded-[32px] p-2 border border-slate-800 shadow-2xl overflow-hidden">
              <img 
                src="/blog/talent-vs-artifact.png" 
                alt="天賦育成と聖遺物厳選の比較図" 
                className="rounded-[28px] w-full"
              />
            </div>
          </figure>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white pt-8 border-t border-slate-800">
              シミュレーターで見極める「樹脂効率」
            </h2>
            <p>
              当サイトのシミュレーターでは、目標スコアに到達するまでの日数を確認できます。
            </p>
            <p>
              もし、目標スコアまでにかなり長い日数が必要だと分かった場合、先に天賦育成を進めた方が良いかもしれません。
              特に、天賦レベルが低い状態で高スコア聖遺物を狙い続けると、樹脂効率（＝強さの上がり幅）が悪くなることがあります。
            </p>
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex items-start gap-4">
              <TrendingUp className="text-emerald-400 mt-1 flex-shrink-0" size={24} />
              <div className="text-sm">
                <p className="font-bold text-white mb-2">おすすめの育成ステップ</p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-400">
                  <li>キャラクターのレベルや武器レベルを整える</li>
                  <li>主要な天賦を実用ライン（Lv.8〜9）まで上げる</li>
                  <li>聖遺物を厳選してビルドを伸ばしていく</li>
                  <li>最強を目指すなら天賦10 ＋ 極まった聖遺物へ</li>
                </ol>
              </div>
            </div>
          </section>

          <section className="bg-amber-600/5 border border-amber-600/20 p-8 rounded-[40px] mt-12 text-center">
            <h2 className="text-2xl font-black text-amber-500 mb-4">まとめ</h2>
            <p className="max-w-md mx-auto mb-6 text-sm">
              天賦育成は、樹脂を使えば確実にキャラクターを強くできます。
              まだ天賦が十分に上がっていない場合は、先に天賦育成を進めるのがおすすめです。
              シミュレーターの結果を見ながら、賢く樹脂を配分しましょう。
            </p>
            <div className="flex justify-center">
              <Link 
                href="/" 
                className="px-10 py-4 bg-amber-600 hover:bg-amber-500 text-white font-black text-sm rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl shadow-amber-600/20"
              >
                育成効率をシミュレートする
              </Link>
            </div>
          </section>
        </article>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center text-slate-600">
          <p className="text-xs">© 2026 Artifact Sim Blog - 樹脂効率の最適化ガイド</p>
        </div>
      </footer>
    </div>
  );
}
