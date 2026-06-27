import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { GAME_CONFIGS, GameId } from '@/lib/game_data';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image, gameId } = body; // image: data:image/...;base64,...

    if (!image || !gameId) {
      return NextResponse.json({ error: '画像とゲームIDが必要です' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    // APIキーがない、またはデフォルト値のままの場合はエラーとして扱い、ローカルOCRへのフォールバックを促す
    if (!apiKey || apiKey === "YOUR_API_KEY_HERE" || apiKey.trim() === "") {
      return NextResponse.json({ error: 'GEMINI_API_KEY が設定されていません。ローカルOCRを実行します。' }, { status: 404 });
    }

    const config = GAME_CONFIGS[gameId as GameId];
    if (!config) {
      return NextResponse.json({ error: '無効なゲームIDです' }, { status: 400 });
    }

    // Base64プレフィックスの除去
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    const genAI = new GoogleGenerativeAI(apiKey);
    // 画像解析に適したモデルを使用
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const activeSlots = config.slots.filter(s => s !== "未選択");
    const activeMains = config.mainStats.filter(s => s !== "未選択");
    const activeSubs = config.subStats.filter(s => s !== "未選択");
    const activeSets = config.sets.filter(s => s !== "未選択");
    const activeChars = config.characters.map(c => c.name);

    const prompt = `
あなたはゲーム「原神（Genshin Impact）」「崩壊：スターレイル（Honkai: Star Rail）」「ゼンレスゾーンゼロ（Zenless Zone Zero）」の遺物システムについて熟知したアシスタントです。
提供された装備（聖遺物/遺物/ドライバディスク）のスクリーンショット画像から、以下の情報リストに基づいて、各属性を厳密に抽出してください。

【ゲームコンテキスト】
対象ゲーム: ${config.name} (${gameId})

【許可される値のリスト（これらに完全一致するテキストを出力してください）】
- 有効な部位: ${activeSlots.join(', ')}
- 有効なメインステータス: ${activeMains.join(', ')}
- 有効なサブステータス: ${activeSubs.join(', ')} (注意: 会心率、会心ダメージ、攻撃力%、HP%、防御力%、撃破特効%などのパーセント付き表記か、攻撃力、HP、防御力などの固定値表記か、ゲームの定義リストに完全一致させてください)
- 有効なセット名: ${activeSets.join(', ')}
- 有効なキャラクター: ${activeChars.join(', ')}

【抽出ルール】
1. 画像内の装備の「部位」「メインステータス」「セット名」を特定し、上記の許可リストに最も一致するものにマッピングしてください。
2. サブステータス（最大4つ）を特定し、上記の「有効なサブステータス」のいずれかにマッピングした名前(type)と、数値部分(value、小数点あり)を抽出してください。値に「%」や「+」は含めないでください。
3. 画像内にキャラクターアイコンや関連する表記がある場合、または適合するキャラクターが明確な場合はキャラクター(character)をリストから選んでください。分からない場合は「未選択」としてください。

【出力フォーマット】
必ず以下のJSONフォーマットで出力してください。Markdownのコードブロック（\`\`\`json ... \`\`\`）は使用せず、プレーンなJSONオブジェクトをそのまま返してください。

{
  "slot": "部位名（有効な部位リストから選択、不明な場合は「未選択」）",
  "mainStat": "メインステータス名（有効なメインステータスリストから選択、不明な場合は「未選択」）",
  "setName": "セット名（有効なセットリストから選択、不明な場合は「未選択」）",
  "character": "キャラクター名（有効なキャラクターリストから選択、不明な場合は「未選択」）",
  "substats": [
    { "type": "サブステータス名1", "value": "数値1" },
    { "type": "サブステータス名2", "value": "数値2" },
    { "type": "サブステータス名3", "value": "数値3" },
    { "type": "サブステータス名4", "value": "数値4" }
  ]
}
`;

    const imageParts = [
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/png"
        }
      }
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const responseText = result.response.text();
    
    return NextResponse.json(JSON.parse(responseText));
  } catch (error) {
    console.error('AI OCR Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
