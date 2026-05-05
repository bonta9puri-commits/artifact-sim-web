import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors mb-12 group">
          <span className="mr-2 transform group-hover:-translate-x-1 transition-transform">←</span>
          サイトトップへ戻る
        </Link>
        
        <main className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-8 border-b border-emerald-500/30 pb-4">プライバシーポリシー</h1>
          
          <div className="space-y-10 text-sm leading-relaxed">
            <section>
              <p>artifact-sim.com（以下、「当サイト」といいます。）は、本ウェブサイト上で提供するサービスにおける、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシーを定めます。</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full mr-3"></span>
                1. 広告の配信について
              </h2>
              <p>当サイトでは、第三者配信の広告サービス「Google アドセンス」を利用しています。</p>
              <p className="mt-4">広告配信事業者は、ユーザーの興味に応じた商品やサービスの広告を表示するため、クッキー（Cookie）を使用することがあります。クッキーを使用することで当サイトはお客様のコンピュータを識別できるようになりますが、お客様個人を特定できるものではありません。</p>
              <p className="mt-4">クッキーを無効にする方法やGoogleアドセンスに関する詳細は「<a href="https://policies.google.com/technologies/ads?hl=ja" target="_blank" rel="noopener" className="text-emerald-400 hover:underline">広告 – ポリシーと規約 – Google</a>」をご確認ください 。</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full mr-3"></span>
                2. アクセス解析ツールについて
              </h2>
              <p>当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を利用しています。このGoogleアナリティクスはトラフィックデータの収集のためにクッキー（Cookie）を使用しています。このトラフィックデータは匿名で収集されており、個人を特定するものではありません。</p>
              <p className="mt-4">この機能はクッキーを無効にすることで収集を拒否することが出来ますので、お使いのブラウザの設定をご確認ください。この規約に関しての詳細は「<a href="https://marketingplatform.google.com/about/analytics/terms/jp/" target="_blank" rel="noopener" className="text-emerald-400 hover:underline">Googleアナリティクス利用規約</a>」をご確認ください 。</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full mr-3"></span>
                3. 免責事項
              </h2>
              <p>当サイトからのリンクやバナーなどで移動したサイトで提供される情報、サービス等について一切の責任を負いません。</p>
              <p className="mt-4">また、当サイトのコンテンツ・情報について、できる限り正確な情報を提供するよう努めておりますが、正確性や安全性を保証するものではありません。当サイトに掲載された内容によって生じた損害等の一切の責任を負いかねますのでご了承ください。</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full mr-3"></span>
                4. 著作権・肖像権について
              </h2>
              <p>当サイトで掲載している文章や画像などにつきましては、無断転載することを禁止します。</p>
              <p className="mt-4">当サイトは個人が制作した非公式のファンサイトであり、使用されているゲーム画像の著作権・肖像権等は、各権利所有者（© COGNOSPHERE / © HoYoverse等）に帰属します。記事の内容や掲載画像等に問題がございましたら、お問い合わせフォームよりご連絡ください。確認後、対応いたします。</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full mr-3"></span>
                5. 本ポリシーの変更
              </h2>
              <p>当サイトは、個人情報に関して適用される日本の法令を遵守するとともに、本ポリシーの内容を適宜見直しその改善に努めます。修正された最新のプライバシーポリシーは常に本ページにて開示されます。</p>
            </section>
          </div>

          <footer className="mt-16 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
            <p>策定日：2026年5月5日</p>
            <p className="mt-1">運営者：artifact-sim.com 運営事務局</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
