import { generateChatResponse, ChatMessage } from '../openai';
import { v4 as uuidv4 } from 'uuid';

interface AdviceGenerationData {
  userId: string;
  quizResults?: any[];
  learningTime?: any;
  viewedContent?: any[];
  progressData?: any;
  errorPatterns?: any[];
}

interface Advice {
  id: string;
  userId: string;
  type: string;
  content: string;
  createdAt: string;
  metadata?: any;
}

/**
 * AIアドバイザーエージェント
 * ユーザーの学習データを分析し、パーソナライズされたアドバイスを生成する
 */
export class AdvisorAgent {
  private systemPrompt = `
あなたは学習データを分析してパーソナライズされたアドバイスを提供するAIアドバイザーです。

ユーザーの学習データ（クイズ結果、学習時間、閲覧コンテンツ、進捗、エラーパターン）を分析し、
以下のタイプのアドバイスを生成してください：

- motivation: モチベーション向上のアドバイス
- weakness: 弱点克服のアドバイス  
- strategy: 学習戦略のアドバイス
- progress: 進捗報告とフィードバック
- alert: 注意喚起
- general: 一般的なアドバイス

アドバイスは具体的で実践的なものにし、ユーザーの状況に応じてカスタマイズしてください。
`;

  async generateAdviceForUser(userId: string): Promise<Advice> {
    try {
      // ユーザーの学習データを収集
      const data = await this.collectUserLearningData(userId);
      
      // 収集したデータからアドバイスを生成
      const advice = await this.analyzeDataAndGenerateAdvice(data);
      
      // 生成したアドバイスを返す
      return this.createAdviceObject(advice, data);
    } catch (error) {
      console.error('Error generating advice:', error);
      throw new Error('アドバイス生成中にエラーが発生しました');
    }
  }

  private async collectUserLearningData(userId: string): Promise<AdviceGenerationData> {
    // TODO: 実際の実装では各データソースからデータを収集する
    return {
      userId,
      quizResults: await this.fetchRecentQuizResults(userId),
      learningTime: await this.fetchLearningTimeStats(userId),
      viewedContent: await this.fetchRecentlyViewedContent(userId),
      progressData: await this.fetchUserProgressData(userId),
      errorPatterns: await this.fetchCommonErrorPatterns(userId)
    };
  }

  private async analyzeDataAndGenerateAdvice(data: AdviceGenerationData): Promise<{
    type: string;
    content: string;
  }> {
    const dataSummary = this.prepareDataSummary(data);
    
    const messages: ChatMessage[] = [
      { role: 'system', content: this.systemPrompt },
      { 
        role: 'user', 
        content: `
以下のユーザー学習データを分析して、適切なアドバイスを生成してください：

ユーザーID: ${data.userId}
クイズ成績: ${JSON.stringify(dataSummary.quizPerformance)}
学習時間: ${JSON.stringify(dataSummary.learningHabits)}
閲覧コンテンツ: ${JSON.stringify(dataSummary.contentEngagement)}
進捗: ${JSON.stringify(dataSummary.progressSummary)}
エラーパターン: ${JSON.stringify(dataSummary.commonMistakes)}

レスポンスは以下のJSON形式で返してください：
{
  "type": "アドバイスタイプ（motivation/weakness/strategy/progress/alert/general）",
  "content": "具体的なアドバイス内容"
}
`
      }
    ];

    const response = await generateChatResponse(messages);
    
    try {
      const parsed = JSON.parse(response);
      return {
        type: parsed.type || 'general',
        content: parsed.content || response
      };
    } catch {
      // JSONパースに失敗した場合はテキストとして扱う
      return {
        type: 'general',
        content: response
      };
    }
  }

  private prepareDataSummary(data: AdviceGenerationData) {
    return {
      quizPerformance: this.summarizeQuizResults(data.quizResults || []),
      learningHabits: this.summarizeLearningTime(data.learningTime),
      contentEngagement: this.summarizeContentViews(data.viewedContent || []),
      progressSummary: data.progressData,
      commonMistakes: this.summarizeErrorPatterns(data.errorPatterns || [])
    };
  }

  private summarizeQuizResults(results: any[]) {
    if (results.length === 0) return null;
    
    const correctCount = results.filter(r => r.isCorrect).length;
    const totalCount = results.length;
    const successRate = totalCount > 0 ? (correctCount / totalCount * 100).toFixed(1) : '0';
    
    return {
      totalQuizzes: totalCount,
      correctAnswers: correctCount,
      successRate: parseFloat(successRate),
      recentQuizDate: results.length > 0 ? results[0].completedAt : null
    };
  }

  private summarizeLearningTime(timeData: any) {
    if (!timeData) return null;
    
    return {
      totalHours: timeData.totalHours || 0,
      averageSessionMinutes: timeData.averageSessionMinutes || 0,
      sessionsPerWeek: timeData.sessionsPerWeek || 0,
      lastSessionDate: timeData.lastSessionDate || null,
      preferredTimeOfDay: timeData.preferredTimeOfDay || null
    };
  }

  private summarizeContentViews(viewedContent: any[]) {
    if (viewedContent.length === 0) return null;
    
    return {
      totalViewed: viewedContent.length,
      recentlyViewed: viewedContent.slice(0, 3).map(c => c.title || c.id)
    };
  }

  private summarizeErrorPatterns(patterns: any[]) {
    if (patterns.length === 0) return null;
    
    return {
      totalErrors: patterns.length,
      topErrorPatterns: patterns.slice(0, 3)
    };
  }

  private createAdviceObject(advice: { type: string; content: string }, data: AdviceGenerationData): Advice {
    return {
      id: uuidv4(),
      userId: data.userId,
      type: advice.type,
      content: advice.content,
      createdAt: new Date().toISOString(),
      metadata: {
        generatedFrom: {
          quizCount: data.quizResults?.length || 0,
          learningTime: data.learningTime?.totalHours || 0,
          contentCount: data.viewedContent?.length || 0
        }
      }
    };
  }

  // モックデータを返すヘルパーメソッド
  private async fetchRecentQuizResults(userId: string) {
    return [];
  }

  private async fetchLearningTimeStats(userId: string) {
    return {
      totalHours: 0,
      averageSessionMinutes: 0,
      sessionsPerWeek: 0
    };
  }

  private async fetchRecentlyViewedContent(userId: string) {
    return [];
  }

  private async fetchUserProgressData(userId: string) {
    return {};
  }

  private async fetchCommonErrorPatterns(userId: string) {
    return [];
  }
}

export const advisorAgent = new AdvisorAgent();