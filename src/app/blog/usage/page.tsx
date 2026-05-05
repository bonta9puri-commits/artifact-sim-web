import Link from 'next/link';
import { BookOpen, Target, Calendar, MessageSquare, ChevronLeft } from 'lucide-react';

export default function BlogUsage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-emerald-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-4xl mx-auto py-20 px-6">
        <Link href="/" className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-all mb-12 group">
          <ChevronLeft className="mr-1 group-hover:-translate-x-1 transition-transform" size={20} />
          <span className="text-sm font-bold tracking-tight">BACK TO SIMULATOR</span>
        </Link>

        <article className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/50 rounded-[40px] overflow-hidden shadow-2xl">
          {/* Hero Section */}
          <div className="relative h-64 bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center p-12 text-center overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
                <BookOpen size={14} className="text-emerald-400" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Usage Guide</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tighter">
                【原神・スタレ】聖遺物厳選の「終わり」が見える！<br className="hidden md:block" />
                シミュレーターの賢い使い方
              </h1>
            </div>
          </div>

          <div className="p-8 md:p-16 space-y-12">
            <section className="prose prose-invert max-w-none">
              <p className="text-lg leading-relaxed text-slate-300 font-medium">
                原神や崩壊：スターレイルの聖遺物・遺物厳選は、どこまで続ければいいのか分かりにくい要素のひとつですよね。
              </p>
              <p className="text-lg leading-relaxed text-slate-400">
                「スコアが高い聖遺物を狙いたいけど、あと何日かかるんだろう？」「今の自分の運は良い方なのかな？」と、感覚だけでは判断しにくいことも多いはず。
              </p>
              <p className="text-lg leading-relaxed text-slate-400">
                そんな悩みを解決するために、現役大学生の私が開発したのが<strong className="text-white decoration-emerald-500 decoration-2 underline-offset-4 underline">「artifact-sim.com」</strong>です。この記事では、当サイトの主要な機能と、結果をどう読み解けば厳選が楽になるかのポイントを解説します。
              </p>
            </section>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-8 flex gap-6">
              <div className="shrink-0 w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h4 className="text-amber-400 font-black text-sm uppercase tracking-widest mb-2">※ご利用にあたっての注意点</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  当サイトは個人制作の簡易シミュレーターです。ゲーム内の実際の確率やダメージ計算を完全に再現するものではありません。あくまで厳選の目安としてお楽しみください！
                </p>
              </div>
            </div>

            <section className="space-y-8">
              <h2 className="text-2xl font-black text-white flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Target className="text-slate-900" size={20} />
                </div>
                1. 「かんたん診断」で目標までの目安を知る
              </h2>
              <p className="text-slate-400 leading-relaxed">
                まずは、一番人気の「かんたん診断」から使ってみてください。目標スコアに到達するまでに、平均してどれくらいの試行回数（日数）が必要かを確認できます。
              </p>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-emerald-400">使い方の手順</h3>
                <ul className="grid gap-3">
                  {[
                    "狙いたいキャラクターとビルドを選ぶ",
                    "時計・杯・冠のメインステータスを選択",
                    "とりあえず「目安をみる」をクリック！"
                  ].map((step, i) => (
                    <li key={i} className="flex items-center gap-4 bg-slate-800/30 p-4 rounded-2xl border border-slate-700/30">
                      <span className="text-2xl font-black text-slate-700">{i + 1}</span>
                      <span className="font-bold text-slate-300">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Image Placeholder 1 */}
              <div className="relative group overflow-hidden rounded-[32px] border border-slate-800 shadow-2xl">
                <img 
                  src="/blog_mockup_1.webp" 
                  alt="かんたん診断イメージ" 
                  className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex flex-col justify-end p-8">
                  <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">Simple Diagnostic</p>
                  <p className="text-white font-bold">直感的な入力インターフェース</p>
                </div>
              </div>

              <div className="bg-slate-800/20 rounded-3xl p-8 space-y-4">
                <h3 className="text-lg font-bold text-white">結果の見方：沼る可能性も視野に</h3>
                <p className="text-slate-400 leading-relaxed">
                  結果画面では、単なる平均だけでなく<strong className="text-white">「上位10%（運が良い場合）」から「下位10%（沼った場合）」</strong>までが表示されます。
                </p>
                <p className="text-slate-400 leading-relaxed">
                  「運が悪くてもこれくらいで終わるんだな」という心の準備ができるのが、このツールの最大のメリットです。もし目標が高すぎて日数が膨大になったら、目標スコアを少し下げて再計算してみるのも賢い戦略です。
                </p>
              </div>
            </section>

            <section className="space-y-8">
              <h2 className="text-2xl font-black text-white flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Calendar className="text-slate-900" size={20} />
                </div>
                2. 「期間シミュ」で未来のスコアを予測する
              </h2>
              <p className="text-slate-400 leading-relaxed">
                「次のバージョンまでにどれくらい強くなれるか？」を知りたい時は、期間シミュが便利です。目標スコアの代わりに「厳選を行う日数」を入力します。
              </p>

              {/* Image Placeholder 2 */}
              <div className="relative group overflow-hidden rounded-[32px] border border-slate-800 shadow-2xl">
                <img 
                  src="/blog_mockup_2.webp" 
                  alt="期間シミュレーション結果イメージ" 
                  className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex flex-col justify-end p-8">
                  <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Period Simulation</p>
                  <p className="text-white font-bold">未来のスコア期待値を可視化</p>
                </div>
              </div>

              <p className="text-slate-400 leading-relaxed">
                毎日コツコツ厳選することを前提に、その期間で「平均的にどの程度のスコアに届くか」がわかります。また、β版ですが<strong className="text-white">「ダメージ比較機能」</strong>も搭載しています。スコアだけでなく「実ダメージが何％変わるか」まで踏み込んでチェックしてみてください。
              </p>
            </section>

            <section className="pt-12 border-t border-slate-800 space-y-8 text-center">
              <h2 className="text-2xl font-black text-white flex items-center justify-center gap-4">
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <MessageSquare className="text-slate-900" size={20} />
                </div>
                3. 不具合報告と今後のアップデートについて
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-2xl mx-auto">
                当サイトは、ユーザーの皆様と一緒に育てていきたいと考えています。「この計算、ちょっと変かも？」「こんな機能が欲しい！」という声があれば、ぜひ不具合報告フォームから教えてください。
              </p>
              
              <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-[32px] p-8 border border-white/5 max-w-2xl mx-auto">
                <p className="text-slate-300 font-bold mb-4">
                  また、YouTubeチャンネルでも聖遺物に関する検証動画を発信しています。大学生の挑戦を応援していただける方は、ぜひチャンネル登録をお願いします！
                </p>
                <a href="/" className="inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-lg rounded-full shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all">
                  シミュレーターを使ってみる
                </a>
              </div>
            </section>
          </div>

          <footer className="bg-slate-950/50 p-8 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">© 2024 artifact-sim.com 運営事務局</p>
          </footer>
        </article>
      </div>
    </div>
  );
}
