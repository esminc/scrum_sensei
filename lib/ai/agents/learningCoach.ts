// LearningCoachAgent implementation
import { Content } from '@/lib/models/content';

/**
 * 学習コーチエージェント
 * 学習者に対して振り返りや質問を提示するエージェント
 */
export class LearningCoachAgent {
  private apiKey: string;

  /**
   * コンストラクタ
   * @param apiKey OpenAI APIキー
   */
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * 学習内容に基づいて振り返り質問を生成する
   * @param content 学習コンテンツ
   * @returns 振り返り質問のリスト
   */
  async generateReflectionQuestions(content: Content): Promise<string[]> {
    // 実際の実装ではOpenAI APIを使用して動的に質問を生成
    // ここではモック実装として静的な質問リストを返す
    return [
      `${content.title}の主要なポイントは何でしたか？`,
      `今回学んだ内容を実際にどのように活用できますか？`,
      `理解が難しかった部分はありましたか？それはなぜですか？`,
      `この学習内容に関連して、さらに知りたいことは何ですか？`,
      `学習内容を自分の言葉で要約してみてください。`
    ];
  }
}

// デフォルトインスタンスをエクスポート
export const learningCoach = new LearningCoachAgent(process.env.OPENAI_API_KEY || '');
