// APIクライアント関数

/**
 * AIアドバイス関連の操作を提供するサービス
 */
export class AdviceService {
  private apiBaseUrl: string;

  constructor() {
    // Next.js APIルートを使用する場合は空文字列、それ以外ではAPIのベースURL
    // サーバーサイドの場合のみMASTRA_API_URLを使用
    this.apiBaseUrl = typeof window === 'undefined' 
      ? (process.env.MASTRA_API_URL || 'http://localhost:4111')
      : '';
  }

  /**
   * ユーザーのAIアドバイスを取得する
   * 最新のアドバイスがない場合は新たに生成する
   */
  async getAdviceForUser(userId: string) {
    try {
      // 最新のアドバイスを取得
      const latestAdvice = await this.getLatestAdviceForUser(userId);
      
      // 最新のアドバイスがあれば、それを返す
      if (latestAdvice) {
        // 24時間以内のアドバイスであればそのまま返す
        const adviceDate = new Date(latestAdvice.createdAt);
        const now = new Date();
        const hoursSinceLastAdvice = (now.getTime() - adviceDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLastAdvice < 24) {
          return latestAdvice;
        }
      }
      
      // 新しいアドバイスを生成
      return await this.generateNewAdviceForUser(userId);
    } catch (error) {
      console.error('Error in getAdviceForUser:', error);
      
      // エラー時のフォールバック（バックエンド接続エラーの場合）
      return {
        id: `fallback-advice-${Date.now()}`,
        type: 'general',
        content: '継続的な学習がスキル向上の鍵です。定期的に学習を続けましょう。',
        createdAt: new Date().toISOString()
      };
    }
  }

  /**
   * ユーザーの最新のアドバイスを取得する
   */
  async getLatestAdviceForUser(userId: string) {
    try {
      // クライアントサイドでの呼び出しの場合はフロントエンドAPIを使用
      // サーバーサイドでの呼び出しの場合はバックエンドAPIを直接使用
      const apiPath = `${this.apiBaseUrl}/api/user/advice/latest?userId=${userId}`;
      
      const response = await fetch(apiPath, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
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
      console.error('Error getting latest advice:', error);
      return null;
    }
  }

  /**
   * 新しいアドバイスを生成する
   */
  async generateNewAdviceForUser(userId: string) {
    try {
      // クライアントサイドでの呼び出しの場合はフロントエンドAPIを使用
      // サーバーサイドでの呼び出しの場合はバックエンドAPIを直接使用
      const apiPath = `${this.apiBaseUrl}/api/user/advice/generate`;
      
      const response = await fetch(apiPath, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating new advice:', error);
      
      // APIエラー時のフォールバック
      // 時間に基づいてランダムなアドバイスタイプを選択
      const adviceTypes = ['motivation', 'strategy', 'progress', 'general'];
      const randomType = adviceTypes[Math.floor(Math.random() * adviceTypes.length)];
      
      const fallbackAdvices = {
        motivation: '継続的な学習は大きな成果につながります。最近の頑張りを続けましょう。',
        strategy: '学習の間に短い休憩を取り入れると、記憶の定着率が向上します。ポモドーロテクニックを試してみてはいかがでしょうか？',
        progress: '定期的な復習は学習の鍵です。過去の学習内容を振り返る時間を設けましょう。',
        general: '新しい概念を学ぶときは、実際のプロジェクトに応用することで理解が深まります。'
      };
      
      return {
        id: `fallback-advice-${Date.now()}`,
        type: randomType,
        content: fallbackAdvices[randomType as keyof typeof fallbackAdvices],
        createdAt: new Date().toISOString()
      };
    }
  }

  /**
   * アドバイスへのフィードバックを保存する
   */
  async saveAdviceFeedback(adviceId: string, userId: string, feedback: 'helpful' | 'not_helpful') {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/user/advice/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adviceId,
          userId,
          feedback,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving advice feedback:', error);
      throw new Error('フィードバックの保存中にエラーが発生しました');
    }
  }

  /**
   * ユーザーのアドバイス履歴を取得する
   */
  async getAdviceHistoryForUser(userId: string, limit: number = 10) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/user/advice/history?userId=${userId}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting advice history:', error);
      throw new Error('アドバイス履歴の取得中にエラーが発生しました');
    }
  }

  /**
   * ユーザーのアドバイス統計情報を取得する
   */
  async getAdviceStatsForUser(userId: string) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/user/advice/stats?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting advice stats:', error);
      throw new Error('アドバイス統計の取得中にエラーが発生しました');
    }
  }
}
