import { NextResponse } from 'next/server';
import { MastraAiService } from '../../../../../lib/mastraAiService';

/**
 * AIアドバイスへのフィードバックを送信するAPI
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adviceId, userId, feedback } = body;

    // バリデーション
    if (!adviceId || !userId || !feedback) {
      return NextResponse.json(
        { error: 'adviceId、userId、およびfeedbackは必須です' },
        { status: 400 }
      );
    }

    if (feedback !== 'helpful' && feedback !== 'not_helpful') {
      return NextResponse.json(
        { error: 'feedbackはhelpfulまたはnot_helpfulのいずれかである必要があります' },
        { status: 400 }
      );
    }

    // Mastra AIサービスの初期化
    const mastraAiService = new MastraAiService();

    try {
      // バックエンドにフィードバックを送信
      const result = await mastraAiService.sendAiAdviceFeedback(adviceId, userId, feedback);
      return NextResponse.json({
        message: 'フィードバックが正常に送信されました',
        result
      });
    } catch (error) {
      console.error('Error calling Mastra AI service for feedback:', error);
      
      // バックエンド接続エラーの場合、一時的なレスポンスを返す
      return NextResponse.json({
        message: 'フィードバックを受け付けました（オフラインモード）',
        adviceId,
        userId,
        feedback,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error in feedback API:', error);
    return NextResponse.json(
      { error: 'フィードバック送信中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
