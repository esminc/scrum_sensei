import { NextResponse } from 'next/server';
import { MastraAiService } from '../../../../../lib/mastraAiService';
import { generateRandomAdvice } from '../../../../../lib/clientAdviceGenerator';

/**
 * ユーザーの最新のAIアドバイスを取得するAPI
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDは必須です' },
        { status: 400 }
      );
    }

    // Mastra AIサービスの初期化
    const mastraAiService = new MastraAiService();

    try {
      // バックエンドからユーザーの最新アドバイスを取得
      const advice = await mastraAiService.getLatestAiAdvice(userId);
      
      if (!advice) {
        // アドバイスがない場合は新しく生成
        const newAdvice = await mastraAiService.generateAiAdvice(userId);
        return NextResponse.json(newAdvice);
      }
      
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
    console.error('Error in latest-advice API:', error);
    return NextResponse.json(
      { error: 'アドバイス取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
