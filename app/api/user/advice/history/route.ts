import { NextResponse } from 'next/server';
import { generateAdviceHistory } from '../../../../../lib/clientAdviceGenerator';

/**
 * ユーザーのAIアドバイス履歴を取得するAPI
 * クライアントサイドで生成したモックデータを返す
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default-user';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // クライアントサイドでアドバイス履歴を生成
    const history = generateAdviceHistory(userId, limit);

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching advice history:', error);
    return NextResponse.json(
      { error: 'アドバイス履歴の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
