import { NextResponse } from 'next/server';
import { MastraAiService } from '../../../../../lib/mastraAiService';
import { generateRandomAdvice } from '../../../../../lib/clientAdviceGenerator';

/**
 * Mastraエージェントを使用してAIアドバイスを生成するAPI
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, context = {} } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDは必須です' },
        { status: 400 }
      );
    }

    // Mastra AIサービスの初期化
    const mastraAiService = new MastraAiService();

    try {
      // バックエンドのMastraエージェントを呼び出し
      const advice = await mastraAiService.generateAiAdvice(userId, context);
      return NextResponse.json(advice);
    } catch (error) {
      console.error('Error calling Mastra AI service:', error);
      
      // バックエンド接続エラーの場合、クライアントサイドで生成
      console.log('Falling back to client-side advice generation');
      const fallbackAdvice = generateRandomAdvice();
      
      return NextResponse.json({
        ...fallbackAdvice,
        generatedBy: 'client-fallback' // フォールバックで生成されたことを示す
      });
    }
  } catch (error) {
    console.error('Error in generate-advice API:', error);
    return NextResponse.json(
      { error: 'アドバイス生成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
