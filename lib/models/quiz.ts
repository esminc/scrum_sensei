/**
 * クイズ関連のモデル定義
 */

/**
 * 問題の難易度
 */
export type QuizDifficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * 問題のタイプ
 */
export type QuestionType = 'multiple-choice' | 'true-false' | 'fill-blank' | 'short-answer' | 'multiple-select';

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