"use client";

export default function About() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <a href="/" className="text-xs text-slate-500 hover:text-slate-300">← トップに戻る</a>
        <h1 className="text-3xl font-bold">About / お問い合わせ</h1>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-emerald-400">当サイトについて</h2>
          <p className="text-slate-300 leading-relaxed">
            「Artifact Sim」は、HoYoverseのゲームにおける装備品（聖遺物・遺物・ドライブディスク）の
            厳選シミュレーションと記録を行うWebツールです。
          </p>
          <p className="text-slate-300 leading-relaxed">
            目標スコアまでに必要な樹脂や日数のシミュレーション、AI診断による厳選アドバイス、
            OCRによるスクリーンショットからの自動データ入力など、厳選をサポートする機能を提供しています。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-emerald-400">運営者</h2>
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
            <a 
              href="https://www.youtube.com/channel/UCl9ZmeECCvInf8XiNSWduuA" 
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 text-white bg-red-600/90 hover:bg-red-500 p-3 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              YouTubeチャンネル
            </a>
            <a 
              href="https://docs.google.com/forms/d/e/1FAIpQLSf830-7ru8G8urUYvFWU4_a41ITZcZDXcZVb08ldEpOZbv_6g/viewform?usp=dialog" 
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 text-white bg-blue-600/90 hover:bg-blue-500 p-3 rounded-lg transition-colors"
            >
              <span className="text-xl">📝</span>
              お問い合わせフォーム (Googleフォーム)
            </a>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-emerald-400">お問い合わせ</h2>
          <p className="text-slate-300 leading-relaxed">
            バグ報告・機能リクエスト・その他のお問い合わせは、上記の「お問い合わせフォーム」よりお気軽にご連絡ください。
          </p>
        </section>

        <div className="pt-8 border-t border-slate-800 flex gap-4 text-sm text-slate-500">
          <a href="/privacy" className="hover:text-slate-300">プライバシーポリシー</a>
          <a href="/terms" className="hover:text-slate-300">利用規約</a>
        </div>
      </div>
    </div>
  );
}
