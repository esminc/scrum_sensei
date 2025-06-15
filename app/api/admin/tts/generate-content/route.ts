import { NextRequest, NextResponse } from 'next/server';

// GeminiのAPIキーなどの環境変数
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

/**
 * 教材内容とトピックからAIで音声教材のコンテンツを生成するAPIエンドポイント
 * POST /api/admin/tts/generate-content
 */
export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, message: 'Gemini APIキーが設定されていません' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { materialId, materialTitle, materialContent, topic } = body;

    if (!materialContent || !topic) {
      return NextResponse.json(
        { success: false, message: '教材内容とトピックは必須です' },
        { status: 400 }
      );
    }

    // Geminiへのプロンプトを構築
    const prompt = `
あなたは専門的な教育コンテンツを作成するAIアシスタントです。
以下の教材内容とトピックに基づいて、音声教材として最適な内容を生成してください。

# 元の教材タイトル
${materialTitle || '（タイトルなし）'}

# 選択されたトピック
${topic}

# 元の教材内容（参考資料）
${materialContent}

# 指示
1. 上記の元教材内容を参考にして、指定されたトピックに関する音声教材のスクリプトを作成してください。
2. 内容は約500〜1000文字程度で、聴きやすく、わかりやすい表現を使用してください。
3. 話し言葉として自然な表現を心がけ、聞き手が理解しやすいように構成してください。
4. 重要なポイントを強調し、簡潔に説明してください。
5. 音声教材としての導入と結びをつけてください。

音声教材の内容のみを出力してください。補足説明や見出しなどは含めないでください。
`;

    // Gemini APIのリクエストボディを作成
    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 32,
        maxOutputTokens: 2048
      }
    };

    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API エラー:', errorData);
      return NextResponse.json(
        { success: false, message: 'AI生成に失敗しました', error: errorData },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    const generatedContent = responseData.candidates[0]?.content?.parts[0]?.text;
    
    if (!generatedContent) {
      return NextResponse.json(
        { success: false, message: 'AIによるコンテンツ生成に失敗しました' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '音声教材用コンテンツの生成が完了しました',
      generatedContent,
      materialId,
      materialTitle,
      topic
    });
    
  } catch (error) {
    console.error('AI生成エラー:', error);
    return NextResponse.json(
      { success: false, message: 'コンテンツ生成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
