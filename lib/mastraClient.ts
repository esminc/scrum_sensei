export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ChatResponse = {
  message: string;
};

export type MastraConnectionStatus = {
  isConnected: boolean;
  error?: string;
};

/**
 * システムの接続状態をチェックする関数（旧Mastraサーバーチェック）
 * @returns 接続状態とエラーメッセージ（存在する場合）
 */
export async function checkMastraConnection(): Promise<MastraConnectionStatus> {
  try {
    // サーバーサイドでは直接データベースチェック
    if (typeof window === 'undefined') {
      const { getDb } = await import('./dbUtils');
      await getDb();
      return { isConnected: true };
    }
    
    // クライアントサイドでは絶対URLを使用
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';
    const response = await fetch(`${baseUrl}/api/mastra/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.ok) {
      return { isConnected: true };
    } else {
      return { 
        isConnected: false, 
        error: `システムエラー: ${response.status} ${response.statusText}` 
      };
    }
  } catch (error) {
    console.error('システム接続チェックエラー:', error);
    
    return { 
      isConnected: false, 
      error: 'システムに接続できません' 
    };
  }
}

/**
 * 旧Mastraクライアント互換性のための関数（廃止予定）
 * @deprecated 新しいAI APIを直接使用してください
 */
export function getMastraClient() {
  console.warn('getMastraClient is deprecated. Use direct AI API calls instead.');
  return {
    getAgent: (agentName: string) => {
      console.warn(`getAgent(${agentName}) is deprecated. Use /api/mastra/agents endpoint instead.`);
      return {
        generate: async (params: any) => {
          throw new Error('Mastra client is no longer available. Use /api/mastra/agents endpoint instead.');
        }
      };
    }
  };
}

/**
 * AIコーチエージェントとチャットするためのクライアント
 */
export async function chatWithCoach(messages: ChatMessage[]): Promise<ChatResponse> {
  try {
    console.log('Sending request to AI agent: simple-coach');
    
    // 内部APIルートを使用
    const response = await fetch('/api/mastra/agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agentName: 'simple-coach',
        messages
      })
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const result = await response.json();
    
    return {
      message: result.response || 'エラーが発生しました',
    };
  } catch (error) {
    console.error('Chat API error:', error);
    throw error;
  }
}