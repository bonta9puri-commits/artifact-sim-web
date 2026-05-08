import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ChevronLeft, Calendar, User, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: "原神の聖遺物厳選はどれくらい沼る？聖遺物シミュレーターで見える現実 | Artifact Sim Blog",
  description: "原神の聖遺物厳選における確率の壁を徹底解説。シミュレーターを使って、目標スコア到達までに必要な日数や樹脂の目安を数値で可視化します。効率的な育成プランの参考に。",
  openGraph: {
    title: "原神の聖遺物厳選はどれくらい沼る？聖遺物シミュレーターで見える現実",
    description: "体感ではなく「数値」で見る聖遺物厳選の現実。",
    images: ['/blog/sim-result-example.png'],
  }
};

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header / Nav */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={16} />
            トップに戻る
          </Link>
          <div className="text-xs font-black tracking-widest text-emerald-500 uppercase">Artifact Sim Blog</div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        {/* Article Header */}
        <header className="mb-12">
          <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
            <span className="flex items-center gap-1"><Calendar size={12} /> 2026.05.08</span>
            <span className="flex items-center gap-1"><User size={12} /> 管理人</span>
            <span className="flex items-center gap-1"><Clock size={12} /> 読了目安: 5分</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter">
            原神の聖遺物厳選はどれくらい沼る？<br className="hidden md:block" />
            <span className="text-emerald-500">聖遺物シミュレーター</span>で見える現実
          </h1>
        </header>

        {/* Article Body */}
        <article className="prose prose-invert prose-emerald max-w-none space-y-8 text-slate-300 leading-relaxed">
          <section className="space-y-4">
            <p className="text-lg text-slate-200 font-medium leading-relaxed">
              原神の聖遺物厳選では、「あと少しで理想のステータスなのに出ない」「会心率と会心ダメージがそろったのに伸びなかった」といった経験をした人も多いと思います。
            </p>
            <p>
              聖遺物厳選は運の要素が非常に大きいため、体感だけで判断すると「自分だけ異常に運が悪いのでは？」と感じることもあります。
            </p>
            <p>
              このサイトでは、目標スコアに到達するまでにどれくらいの日数がかかるのかをシミュレーションし、聖遺物厳選の目安を確認できます。
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white pt-8 border-t border-slate-800">聖遺物厳選という「確率の壁」</h2>
            <p>
              聖遺物厳選で難しいのは、単に「良い聖遺物が出るかどうか」だけではありません。実は以下のステップすべてを突破しなければなりません。
            </p>
            <ul className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-2 list-none shadow-inner text-sm">
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
                目的のセットが出る（50%）
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-[10px] font-bold">2</span>
                欲しい部位が出る（20%）
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-[10px] font-bold">3</span>
                メインステータスが一致する（部位により10〜20%）
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-[10px] font-bold">4</span>
                サブステータスに理想が揃う（極低確率）
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-[10px] font-bold">5</span>
                強化で欲しいステータスに伸びる（4分の1を5回）
              </li>
            </ul>
            <p>
              このように、聖遺物厳選はいくつもの運要素が重なっています。
              数日や数週間周回しても理想に届かないことは珍しくありません。逆に、かなり早い段階で高スコアの聖遺物が完成することもあります。
            </p>
          </section>

          {/* Featured Image / Example */}
          <figure className="my-12">
            <div className="bg-slate-900 rounded-[32px] p-2 border border-slate-800 shadow-2xl overflow-hidden">
              <img 
                src="/blog/sim-result-example.png" 
                alt="シミュレーション結果の表示例" 
                className="rounded-[28px] w-full shadow-inner"
              />
            </div>
            <figcaption className="text-center text-xs text-slate-500 mt-4 italic">
              シミュレーターで「目標スコア200」を設定した場合の計算例
            </figcaption>
          </figure>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white pt-8 border-t border-slate-800">シミュレーターの結果をどう見るか</h2>
            <p>
              当サイトのシミュレーターでは、目標スコアを設定し、そのスコアに到達するまでにどれくらいの日数がかかるかを計算できます。表示される結果には、主に以下のような意味があります。
            </p>
            <div className="grid grid-cols-1 gap-4 mt-6">
              <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                <p className="text-blue-400 font-bold text-sm mb-1">Luck: Top 10% (上振れ側)</p>
                <p className="text-sm">かなり運が良かった場合の目安です。この日数で終われば「勝ち」と言えます。</p>
              </div>
              <div className="p-5 bg-purple-500/5 border border-purple-500/20 rounded-2xl">
                <p className="text-purple-400 font-bold text-sm mb-1">Average Expectation (中央値)</p>
                <p className="text-sm">平均的な運勢に近い目安です。多くの人がこの付近の日数に収まります。</p>
              </div>
              <div className="p-5 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
                <p className="text-rose-400 font-bold text-sm mb-1">Luck: Bottom 10% (下振れ側)</p>
                <p className="text-sm">運が悪かった（沼った）場合の目安です。「普通にやってもここまでかかる可能性がある」という覚悟が必要なラインです。</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white pt-8 border-t border-slate-800">育成の優先順位を考える材料に</h2>
            <p>
              シミュレーション結果を見ることで、聖遺物厳選を続けるべきか、あるいは<b>天賦育成や武器強化など「確実に強くなれる」他の育成</b>に樹脂を回すべきかを客観的に判断しやすくなります。
            </p>
            <p>
              たとえば、中央値が200日で、下振れ側が400日を超えているような非常に高い目標設定をしている場合、まずは目標を少し下げて、浮いた樹脂で天賦レベルを10にする方が、チーム全体のダメージ効率は確実に上がります。
            </p>
          </section>

          <section className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-[40px] mt-12">
            <h2 className="text-2xl font-black text-emerald-400 mb-4">まとめ</h2>
            <p className="mb-4">
              聖遺物厳選は、見た目以上に運の要素が大きいコンテンツです。
            </p>
            <p className="mb-4">
              シミュレーターを使うことで、目標達成までの目安を数字で確認できます。
              「今の厳選が沼っているのか」「目標設定が高すぎるのか」を判断する材料として、ぜひ活用してみてください。
            </p>
            <div className="pt-6">
              <Link 
                href="/" 
                className="inline-block px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-600/20"
              >
                シミュレーターを使ってみる
              </Link>
            </div>
          </section>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs text-slate-600">© 2026 Artifact Sim Blog - 目標スコアまでの期待値を徹底解析</p>
        </div>
      </footer>
    </div>
  );
}
