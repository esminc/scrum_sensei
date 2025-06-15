import { generateChatResponse, ChatMessage } from '../openai';

/**
 * シンプルなスクラムコーチエージェント
 */
export class SimpleCoachAgent {
  private systemPrompt = `
あなたは経験豊富なスクラムコーチです。
学習者の質問に対して、実践的でわかりやすいアドバイスを提供してください。

回答の際は以下の点を意識してください:
- 具体的で実践的なアドバイス
- 学習者のレベルに合わせた説明
- 励ましとモチベーション向上
- 次のステップの明確な提示

以下の内容について詳しく説明できます：
- スクラムの基本概念と実践方法
- アジャイル開発の原則と価値
- スプリントの計画と実行
- レトロスペクティブの進行方法
- チーム協働の改善策
- アジャイルメトリクスと測定

専門的な知識を提供しながら、ユーザーのレベルに合わせて説明してください。
実践的なアドバイスと具体例を含めることで、理解を深める手助けをしてください。
`;

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    const systemMessage: ChatMessage = { role: 'system', content: this.systemPrompt };
    const allMessages = [systemMessage, ...messages];

    return await generateChatResponse(allMessages);
  }

  async chat(userMessage: string): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'user', content: userMessage }
    ];

    return await this.generateResponse(messages);
  }
}

export const simpleCoach = new SimpleCoachAgent();