import { NextResponse } from 'next/server';

/**
 * ユーザーのAIアドバイスを取得するAPI
 */
export async function GET(request: Request) {
  try {

    // クエリパラメーターからuserIdを取得
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || 'default-user';
    
    // 仮のアドバイスを生成（バックエンド接続なしの場合）
    const now = new Date();
    const advice = {
      id: `advice-${userId}-${now.getTime()}`,
      type: 'strategy',
      content: `学習計画を立てることで効率的に学習を進めることができます。今週の学習目標を設定しましょう。\n\n継続的な学習が成功への鍵です！（${now.toLocaleDateString('ja-JP')}）`,
      createdAt: now.toISOString()
    };

    return NextResponse.json(advice);
  } catch (error) {
    console.error('Error fetching advice:', error);
    return NextResponse.json(
      { error: 'アドバイスの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
