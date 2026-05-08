import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ChevronLeft, Calendar, User, Clock, Settings, Target, BarChart4, Lightbulb } from 'lucide-react';

export const metadata: Metadata = {
  title: "聖遺物シミュレーターの使い方｜目標スコア診断の見方を解説 | Artifact Sim Blog",
  description: "当サイトの「聖遺物シミュレーター」の使い方を詳しく解説。キャラクター選択から目標スコアの設定、結果画面の「上振れ・中央値・下振れ」の読み解き方まで詳しく紹介します。",
  openGraph: {
    title: "聖遺物シミュレーターの使い方｜目標スコア診断の見方を解説",
    description: "厳選の目標設定を自動化。正しいツールの使い方ガイド。",
    images: ['/blog/how-to-use.png'],
  }
};

export default function HowToUsePost() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={16} />
            トップに戻る
          </Link>
          <div className="text-xs font-black tracking-widest text-emerald-500 uppercase">Usage Guide</div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <header className="mb-12">
          <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
            <span className="flex items-center gap-1"><Calendar size={12} /> 2026.05.09</span>
            <span className="flex items-center gap-1"><User size={12} /> 管理人</span>
            <span className="flex items-center gap-1"><Clock size={12} /> 読了目安: 6分</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter">
            聖遺物シミュレーターの使い方｜<br />
            <span className="text-emerald-500">目標スコア診断</span>の見方を解説
          </h1>
        </header>

        <article className="prose prose-invert prose-emerald max-w-none space-y-8 text-slate-300 leading-relaxed">
          <section className="space-y-4">
            <p className="text-lg text-slate-200 font-medium leading-relaxed">
              このサイトでは、原神などの聖遺物厳選をシミュレーションし、目標スコアに到達するまでの目安を確認できます。
            </p>
            <p>
              「どれくらい周回すれば目標に届きそうか」「今の目標は現実的なのか」「天賦育成とどちらを優先するべきか」といった、日々の厳選における重要な判断をサポートするためのツールです。
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black text-white pt-8 border-t border-slate-800 flex items-center gap-2">
              <Settings className="text-emerald-500" size={24} /> 
              ステップ1：キャラクターとセットの設定
            </h2>
            <p>まず、シミュレーターの「設定パネル」でキャラクターを選択します。</p>
            <p>
              キャラクターによって、重要なステータスやおすすめセットが変わります。たとえば、フリーナならHP%や会心系、元素チャージ効率が重要になりますが、アタッカーなら攻撃力がより重要になります。
            </p>
            <p>
              次に、狙う聖遺物セット（ダンジョン）を選びます。原神では1つの秘境から2種類のセットがドロップするため、目的のセットが半分しか出ないという確率も考慮して計算されます。
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black text-white pt-8 border-t border-slate-800 flex items-center gap-2">
              <Target className="text-emerald-500" size={24} /> 
              ステップ2：目標スコアとサブステの重み
            </h2>
            <p>
              目標スコアは、どれくらい強い聖遺物・ビルドを目指すかの基準です。
              当然ながら、目標を高く設定するほど、達成までに必要な期待日数は長くなります。
            </p>
            <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
              <p className="text-sm font-bold text-slate-200 mb-2">💡 ヒント：サブステータスの重み</p>
              <p className="text-xs text-slate-400">
                「会心率を2.0、会心ダメを1.0、攻撃%を1.0」のように設定することで、自分のキャラにとってどのステータスが「スコア」に貢献するかを自由に調整できます。
              </p>
            </div>
          </section>

          {/* Guide Image */}
          <figure className="my-12">
            <div className="bg-slate-900 rounded-[32px] p-2 border border-slate-800 shadow-2xl overflow-hidden">
              <img 
                src="/blog/how-to-use.png" 
                alt="シミュレーターの操作ガイド" 
                className="rounded-[28px] w-full"
              />
            </div>
          </figure>

          <section className="space-y-6">
            <h2 className="text-2xl font-black text-white pt-8 border-t border-slate-800 flex items-center gap-2">
              <BarChart4 className="text-emerald-500" size={24} /> 
              結果画面の「3つの数字」の読み取り方
            </h2>
            <p>シミュレーションが完了すると、主に3つの結果が表示されます。</p>
            <div className="space-y-4">
              <div className="p-5 bg-slate-900 rounded-2xl">
                <p className="text-emerald-400 font-bold text-sm">● 上振れ側（Luck: Top 10%）</p>
                <p className="text-sm">かなり運が良かった場合の目安です。「最高に運が良ければこれくらいで終わる」という希望の数字です。</p>
              </div>
              <div className="p-5 bg-slate-900 rounded-2xl">
                <p className="text-purple-400 font-bold text-sm">● 中央値（Average Expectation）</p>
                <p className="text-sm">平均的な運に近い場合の目安です。最も現実味のある目標日数として参考にしてください。</p>
              </div>
              <div className="p-5 bg-slate-900 rounded-2xl">
                <p className="text-rose-400 font-bold text-sm">● 下振れ側（Luck: Bottom 10%）</p>
                <p className="text-sm">運が悪かった（沼った）場合の目安です。最悪の場合これくらいかかる、という覚悟を持つための数字です。</p>
              </div>
            </div>
            <p className="text-sm italic">
              ※中央値だけを見るのではなく、下振れ側も確認することが大切です。
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black text-white pt-8 border-t border-slate-800 flex items-center gap-2">
              <Lightbulb className="text-yellow-500" size={24} /> 
              天賦育成との比較機能
            </h2>
            <p>
              結果画面の下部には「天賦育成との比較」も表示されます。
              聖遺物厳選に膨大な樹脂を使うよりも、先に天賦を上げた方がダメージが確実に伸びる場合は、警告やアドバイスが表示されます。
            </p>
          </section>

          <section className="bg-emerald-600/5 border border-emerald-600/20 p-8 rounded-[40px] mt-12 text-center">
            <h2 className="text-2xl font-black text-emerald-500 mb-4">まとめ</h2>
            <p className="max-w-md mx-auto mb-6 text-sm">
              シミュレーターを使えば、目標スコアまでにどれくらいの日数がかかりそうかを確認できます。
              厳選を続けるか、他の育成に樹脂を使うかを考える最強の補助ツールとして活用してください！
            </p>
            <div className="flex justify-center">
              <Link 
                href="/" 
                className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-600/20"
              >
                今すぐシミュレーターを使う
              </Link>
            </div>
          </section>
        </article>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center text-slate-600">
          <p className="text-xs">© 2026 Artifact Sim Blog - ツールを使いこなして効率的な育成を</p>
        </div>
      </footer>
    </div>
  );
}
