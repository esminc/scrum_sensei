import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// GeminiのAPIキーなどの環境変数
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TTS_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

/**
 * テキストから音声を生成するAPIエンドポイント
 * POST /api/admin/tts
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
    const { text } = body;

    if (!text) {
      return NextResponse.json(
        { success: false, message: 'テキストが指定されていません' },
        { status: 400 }
      );
    }

    // Gemini APIのリクエストボディを作成
    const requestBody = {
      contents: [{
        parts: [
          {
            text: text
          },
          {
            inlineData: {
              mimeType: "text/plain",
              data: "Generate audio using text-to-speech"
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 1.0,
        topP: 0.8,
        topK: 16
      },
      tools: [
        {
          functionDeclarations: [
            {
              name: "text_to_speech",
              description: "Convert text to speech",
              parameters: {
                type: "object",
                properties: {
                  text: {
                    type: "string",
                    description: "The text to convert to speech"
                  },
                  voiceName: {
                    type: "string",
                    description: "The name of the voice to use",
                    enum: [
                      "ja-JP-Neural2-B",
                      "ja-JP-Neural2-C",
                      "ja-JP-Neural2-D"
                    ]
                  },
                  audioEncoding: {
                    type: "string",
                    enum: ["LINEAR16", "MP3", "OGG_OPUS", "MULAW", "ALAW"],
                    description: "The audio encoding to use"
                  }
                },
                required: ["text"]
              }
            }
          ]
        }
      ]
    };

    const response = await fetch(`${TTS_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
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
        { success: false, message: '音声生成に失敗しました', error: errorData },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    
    // ツール呼び出しの結果を取得
    const functionCall = responseData.candidates[0]?.content?.parts?.find(
      (part: Record<string, unknown>) => part.functionCall && (part.functionCall as Record<string, unknown>).name === 'text_to_speech'
    )?.functionCall;
    
    if (!functionCall) {
      return NextResponse.json(
        { success: false, message: 'TTSレスポンスが見つかりません' },
        { status: 500 }
      );
    }
    
    const audioContent = functionCall.args.audioContent;
    
    if (!audioContent) {
      return NextResponse.json(
        { success: false, message: '音声データが見つかりません' },
        { status: 500 }
      );
    }
    
    // Base64音声データをデコード
    const audioBuffer = Buffer.from(audioContent, 'base64');
    
    // 保存用のファイル名を生成
    const fileName = `audio_${uuidv4()}.mp3`;
    const dirPath = join(process.cwd(), 'public', 'audio');
    const filePath = join(dirPath, fileName);
    
    // ディレクトリがなければ作成
    await mkdir(dirPath, { recursive: true });
    
    // ファイルに保存
    await writeFile(filePath, audioBuffer);
    
    // 音声ファイルの公開URL
    const publicUrl = `/audio/${fileName}`;
    
    return NextResponse.json({
      success: true,
      message: '音声の生成が完了しました',
      audioUrl: publicUrl,
      sourceText: text,
    });
    
  } catch (error) {
    console.error('TTS生成エラー:', error);
    return NextResponse.json(
      { success: false, message: '音声生成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
