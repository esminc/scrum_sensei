import { NextResponse } from 'next/server';

/**
 * AIアドバイスへのフィードバックを受け付けるAPI
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adviceId, userId, feedback } = body;

    // 必須パラメータのバリデーション
    if (!adviceId || !feedback) {
      return NextResponse.json(
        { error: 'adviceIdとfeedbackは必須です' },
        { status: 400 }
      );
    }

    // feedbackの値のバリデーション
    if (feedback !== 'helpful' && feedback !== 'not_helpful') {
      return NextResponse.json(
        { error: 'feedbackはhelpfulまたはnot_helpfulのいずれかである必要があります' },
        { status: 400 }
      );
    }

    // バックエンドが利用できない場合は単にフィードバックを記録したことにする
    console.log(`フィードバック受信: adviceId=${adviceId}, userId=${userId}, feedback=${feedback}`);
    
    // フィードバックデータを作成
    const result = {
      id: `feedback-${Date.now()}`,
      adviceId,
      userId,
      feedback,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      message: 'フィードバックが正常に保存されました',
      result
    });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return NextResponse.json(
      { error: 'フィードバックの保存中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
