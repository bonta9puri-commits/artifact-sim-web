"use client";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <a href="/" className="text-xs text-slate-500 hover:text-slate-300">← トップに戻る</a>
        <h1 className="text-3xl font-bold">プライバシーポリシー</h1>
        <p className="text-sm text-slate-400">最終更新日: 2026年5月2日</p>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-blue-400">1. 個人情報の取得について</h2>
          <p className="text-slate-300 leading-relaxed">
            当サイト「Artifact Sim」（以下「当サイト」）では、ユーザーの個人情報を直接取得することはありません。
            聖遺物・遺物・ドライブディスクの厳選データはすべてユーザーのブラウザ内（LocalStorage）に保存され、
            当サイトのサーバーに送信されることはありません。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-blue-400">2. Cookie・アクセス解析について</h2>
          <p className="text-slate-300 leading-relaxed">
            当サイトでは、以下のサービスを利用しています。これらのサービスによりCookieが使用される場合があります。
          </p>
          <ul className="list-disc pl-6 text-slate-300 space-y-2">
            <li><strong>Google AdSense</strong>: 広告配信のため、Cookieを使用してユーザーの興味に基づく広告を表示することがあります。</li>
            <li><strong>Vercel Analytics</strong>: サイトのアクセス状況を把握するために使用しています。個人を特定する情報は収集しません。</li>
          </ul>
          <p className="text-slate-300 leading-relaxed">
            Googleによる広告Cookieの使用については、
            <a href="https://policies.google.com/technologies/ads?hl=ja" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              Google広告に関するポリシー
            </a>
            をご参照ください。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-blue-400">3. 画像データの取り扱い</h2>
          <p className="text-slate-300 leading-relaxed">
            OCR（画像文字認識）機能で使用される画像データは、すべてユーザーのブラウザ内で処理されます。
            画像がサーバーにアップロードされることはありません。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-blue-400">4. AI診断機能について</h2>
          <p className="text-slate-300 leading-relaxed">
            AI診断機能では、シミュレーション結果のデータ（スコアや統計情報）のみをAIサービスに送信します。
            個人を特定できる情報は含まれません。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-blue-400">5. お問い合わせ</h2>
          <p className="text-slate-300 leading-relaxed">
            本ポリシーに関するお問い合わせは、
            <a href="/about" className="text-blue-400 hover:underline">お問い合わせページ</a>
            よりご連絡ください。
          </p>
        </section>
      </div>
    </div>
  );
}
