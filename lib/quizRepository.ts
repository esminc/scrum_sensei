/**
 * フロントエンド用のクイズリポジトリ
 * バックエンドAPIを呼び出してクイズデータを操作します
 */

// 環境に応じたベースURLを設定
const getBaseUrl = () => {
  // ブラウザ環境の場合は相対パスを使用
  if (typeof window !== 'undefined') {
    return '';
  }
  // サーバー環境の場合は絶対URLを使用
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
};

/**
 * クイズの難易度
 */
export type QuizDifficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * 問題のタイプ
 */
export type QuestionType = 'multiple-choice' | 'true-false' | 'fill-blank' | 'short-answer';

/**
 * 選択肢
 */
export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

/**
 * 問題
 */
export interface QuizQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: QuizOption[];
  correctAnswer?: string; // 記述式や穴埋め問題用
  explanation: string;
  points: number;
  tags?: string[];
  difficulty: QuizDifficulty;
}

/**
 * クイズ（問題集）
 */
export interface Quiz {
  id: string;
  title: string;
  description: string;
  contentId?: string; // 関連コンテンツID
  questions: QuizQuestion[];
  timeLimit?: number; // 秒単位
  passingScore?: number; // 合格点
  createdAt: string;
  updatedAt: string;
}

/**
 * クイズ作成リクエスト
 */
export interface CreateQuizRequest {
  title: string;
  description: string;
  contentId?: string;
  questions: QuizQuestion[];
  timeLimit?: number;
  passingScore?: number;
}

/**
 * クイズサマリー情報
 */
export interface QuizSummary {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  questionCount: number;
}

/**
 * クイズリポジトリクラス
 */
class QuizRepository {
  /**
   * クイズを新規作成する
   */
  async createQuiz(quiz: {
    title: string;
    description?: string;
    questions: Array<{
      question: string;
      type?: string;
      options?: Array<{
        text: string;
        isCorrect: boolean;
      }>;
      correctAnswer?: string;
      explanation?: string;
      difficulty?: string;
    }>;
  }): Promise<{ id: string; success: boolean; message: string }> {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quiz),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'クイズの保存に失敗しました');
      }
      
      return {
        id: data.id,
        success: data.success,
        message: data.message,
      };
    } catch (error) {
      console.error('クイズの保存に失敗:', error);
      throw error;
    }
  }
  
  /**
   * クイズの一覧を取得する
   */
  async getQuizzes(): Promise<QuizSummary[]> {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/quizzes`);
      
      if (!response.ok) {
        throw new Error('クイズ一覧の取得に失敗しました');
      }
      
      const data = await response.json();
      return data.quizzes || [];
    } catch (error) {
      console.error('クイズ一覧の取得に失敗:', error);
      throw error;
    }
  }
  
  /**
   * クイズの詳細を取得する
   */
  async getQuiz(id: string): Promise<Quiz> {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/quiz/${id}`);
      
      if (!response.ok) {
        throw new Error('クイズの取得に失敗しました');
      }
      
      const data = await response.json();
      return data.quiz;
    } catch (error) {
      console.error('クイズの取得に失敗:', error);
      throw error;
    }
  }
  
  /**
   * クイズを削除する
   */
  async deleteQuiz(id: string): Promise<boolean> {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/quiz/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('クイズの削除に失敗しました');
      }
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('クイズの削除に失敗:', error);
      throw error;
    }
  }
}

const quizRepository = new QuizRepository();
export default quizRepository;