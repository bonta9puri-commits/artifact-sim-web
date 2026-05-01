import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { charName, totalScore, percentile, partScores, weakestPart, weakestDiff, isParts } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
      return NextResponse.json({ error: 'ルートディレクトリの .env.local に GEMINI_API_KEY を設定してください' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let prompt = `
あなたは原神の知識が豊富な、優しくてユーモアのある先輩プレイヤー（AI）です。
以下のユーザーの聖遺物スコアデータを見て、150文字程度で、努力を褒めつつも次へ向けた的確なアドバイスをする、温かくてタメになる評価コメントを作成してください。
出力は「【AI先輩のガチ診断レポート】」という見出しから始めてください。

【ユーザーデータ】
対象キャラクター: ${charName}
合計スコア: ${totalScore}
全プレイヤー中の上位パーセンテージ: 上位 ${100 - percentile}% (パーセンタイル: ${percentile})
`;
    
    if (isParts) {
      prompt += `
部位ごとのスコア:
花: ${partScores['花']}, 羽: ${partScores['羽']}, 時計: ${partScores['時計']}, 杯: ${partScores['杯']}, 冠: ${partScores['冠']}
一番足を引っ張っている部位: ${weakestPart} (理想値から -${weakestDiff}点)
`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ advice: text });
  } catch (error) {
    console.error('AI Generation Error:', error);
    try {
      // 使えるモデルの一覧をデバッグ用に取得してエラーメッセージに含める
      const apiKey = process.env.GEMINI_API_KEY;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const data = await res.json();
      const availableModels = data.models ? data.models.map((m: any) => m.name).join(', ') : '取得できませんでした';
      return NextResponse.json({ error: `APIキーは認識されていますが、指定したモデルが使えません。このキーで使えるモデル: ${availableModels}` }, { status: 500 });
    } catch (e) {
      return NextResponse.json({ error: `AI generation failed: ${error instanceof Error ? error.message : String(error)}` }, { status: 500 });
    }
  }
}
