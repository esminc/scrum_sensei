/**
 * MastraのAIエージェントを使用するためのサービスクラス
 */
export class MastraAiService {
  private apiBaseUrl: string;

  constructor() {
    // Next.js APIルートを使用する場合は空文字列、それ以外ではAPIのベースURL
    // サーバーサイドの場合のみMASTRA_API_URLを使用
    this.apiBaseUrl = typeof window === 'undefined'
      ? (process.env.MASTRA_API_URL || 'http://localhost:4111')
      : '';
  }

  /**
   * Mastraエージェントを使用してAIアドバイスを生成する
   * @param userId ユーザーID
   * @param userContext ユーザーのコンテキスト情報（学習状況など）
   */
  async generateAiAdvice(userId: string, userContext: Record<string, unknown> = {}) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/mastra/advisor/generate-advice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          context: userContext
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating AI advice:', error);
      throw new Error('AIアドバイスの生成中にエラーが発生しました');
    }
  }

  /**
   * ユーザーの最新のAIアドバイスを取得する
   * @param userId ユーザーID
   */
  async getLatestAiAdvice(userId: string) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/mastra/advisor/latest-advice?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          // アドバイスが存在しない場合はnullを返す
          return null;
        }
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting latest AI advice:', error);
      throw new Error('最新のAIアドバイスの取得中にエラーが発生しました');
    }
  }

  /**
   * AIアドバイスに対するフィードバックを送信する
   * @param adviceId アドバイスID
   * @param userId ユーザーID
   * @param feedback フィードバック（helpful または not_helpful）
   */
  async sendAiAdviceFeedback(adviceId: string, userId: string, feedback: 'helpful' | 'not_helpful') {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/mastra/advisor/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adviceId,
          userId,
          feedback
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending AI advice feedback:', error);
      throw new Error('AIアドバイスのフィードバック送信中にエラーが発生しました');
    }
  }
}
