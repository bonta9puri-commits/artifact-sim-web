"use client";

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <a href="/" className="text-xs text-slate-500 hover:text-slate-300">← トップに戻る</a>
        <h1 className="text-3xl font-bold">利用規約</h1>
        <p className="text-sm text-slate-400">最終更新日: 2026年5月2日</p>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-purple-400">1. 本サイトについて</h2>
          <p className="text-slate-300 leading-relaxed">
            当サイト「Artifact Sim」は、HoYoverseが提供するゲーム（原神、崩壊：スターレイル、ゼンレスゾーンゼロ）における
            装備品の厳選シミュレーション及び記録を行う非公式のファンサイトです。
            株式会社miHoYoおよびHoYoverseとは一切関係ありません。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-purple-400">2. 免責事項</h2>
          <ul className="list-disc pl-6 text-slate-300 space-y-2">
            <li>当サイトで使用しているドロップ率やステータスの確率は、コミュニティによる有志の検証データに基づく推測値です。実際のゲーム内の確率とは異なる場合があります。</li>
            <li>当サイトの利用により生じたいかなる損害についても、運営者は一切の責任を負いません。</li>
            <li>シミュレーション結果やAI診断の内容は参考情報であり、ゲーム内の結果を保証するものではありません。</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-purple-400">3. 知的財産権について</h2>
          <p className="text-slate-300 leading-relaxed">
            ゲーム内のキャラクター名、アイテム名、その他のゲーム関連用語の著作権・商標権は、
            すべて株式会社miHoYo / COGNOSPHERE PTE. LTD. に帰属します。
            当サイトはこれらの権利を侵害する意図はなく、ファン活動の一環として運営しています。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-purple-400">4. 禁止事項</h2>
          <ul className="list-disc pl-6 text-slate-300 space-y-2">
            <li>当サイトのコンテンツを無断で複製・転載すること</li>
            <li>当サイトに対する不正アクセスや過度な負荷をかける行為</li>
            <li>その他、運営者が不適切と判断する行為</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-purple-400">5. 規約の変更</h2>
          <p className="text-slate-300 leading-relaxed">
            本規約は予告なく変更される場合があります。変更後の規約は、当ページに掲載した時点で効力を生じるものとします。
          </p>
        </section>
      </div>
    </div>
  );
}
