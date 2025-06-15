import { generateChatResponse, ChatMessage } from '../openai';

/**
 * コンテンツ生成エージェント
 * PDFから抽出した情報を基に教材や問題を自動生成する
 */
export class ContentCreatorAgent {
  private systemPrompt = `
あなたはコンテンツ生成の専門家です。アップロードされたPDFから抽出された情報を基に、教材や問題を生成する役割を担っています。

主な責務:
1. PDFから抽出されたテキストを理解し、構造化された教材コンテンツを生成する
2. 学習者の理解度を測定するための問題を作成する
3. 様々な形式（テキスト、ステップバイステップガイド、練習問題など）のコンテンツを提供する

コンテンツ生成の際は以下のポイントを守ってください:
- 正確性: PDFから抽出された情報に基づき、正確なコンテンツを生成する
- 構造化: 明確な構造と論理的な流れを持つコンテンツを作成する
- 教育効果: 学習者の理解を深める効果的な説明と例を含める
- 難易度調整: 指定された難易度レベルに合わせたコンテンツを提供する

JSON形式のレスポンスは純粋なJSON文字列のままで返してください。
`;

  async generateContent(prompt: string, options?: any): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: this.systemPrompt },
      { 
        role: 'user', 
        content: `
以下の指示に基づいてコンテンツを生成してください:
${prompt}

${options ? `オプション: ${JSON.stringify(options)}` : ''}
`
      }
    ];

    return await generateChatResponse(messages);
  }
}

export const contentCreator = new ContentCreatorAgent();