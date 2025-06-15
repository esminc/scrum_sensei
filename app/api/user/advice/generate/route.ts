import { NextResponse } from 'next/server';

/**
 * 新しいAIアドバイスを強制的に生成するAPI
 */
export async function POST(request: Request) {
  try {
    // ユーザーIDの取得
    const body = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const userId = body.userId || 'default-user';

    // 仮のアドバイスを生成（実際のバックエンド接続ができない場合のフォールバック）
    const now = new Date();
    const advice = {
      id: `advice-${now.getTime()}`,
      type: 'general',
      content: `学習を続けることが重要です。定期的な復習を行い、知識を定着させましょう。\n\n今日の学習も頑張りましょう！（${now.toLocaleDateString('ja-JP')}）`,
      createdAt: now.toISOString()
    };
    
    return NextResponse.json(advice);
  } catch (error) {
    console.error('Error generating advice:', error);
    return NextResponse.json(
      { error: 'アドバイスの生成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
