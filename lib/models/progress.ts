/**
 * ユーザーの学習進捗に関するモデル定義
 */

/**
 * 進捗状況の種類
 */
export type ProgressStatus = 'not-started' | 'in-progress' | 'completed';

/**
 * 問題の回答詳細
 */
export interface AnswerDetail {
  questionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  timeSpent?: number; // 秒単位（オプション）
}

/**
 * クイズ結果
 */
export interface QuizResult {
  quizId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
  timeSpent: number;
  answers?: AnswerDetail[]; // 各問題の解答詳細
  isReviewMode?: boolean; // 復習モードかどうか
}

/**
 * セクション進捗
 */
export interface SectionProgress {
  sectionId: string;
  completed: boolean;
  timeSpent: number;
  lastAccessed?: string;
}

/**
 * ユーザー進捗
 */
export interface UserProgress {
  id: string;
  userId: string;
  contentId: string;
  status: ProgressStatus;
  completionPercentage: number;
  timeSpent: number;
  lastAccessed: string;
  sectionProgress?: SectionProgress[];
  quizResults?: QuizResult[];
}

/**
 * 学習統計
 */
export interface LearningStatistics {
  totalTimeSpent: number;
  completedContents: number;
  inProgressContents: number;
  averageScore: number;
  strongTopics: string[];
  weakTopics: string[];
  streak?: number; // 連続学習日数
}

/**
 * 学習レコメンデーション
 */
export interface LearningRecommendation {
  id: string;
  contentId: string;
  title: string;
  reason: string;
  priority: number;
}

/**
 * 進捗作成リクエスト
 */
export interface CreateProgressRequest {
  userId: string;
  contentId: string;
  status?: ProgressStatus;
  completionPercentage?: number;
  timeSpent?: number;
  lastAccessed?: string;
  sectionProgress?: SectionProgress[];
}

/**
 * 進捗更新リクエスト
 */
export interface UpdateProgressRequest {
  status?: ProgressStatus;
  completionPercentage?: number;
  timeSpent?: number;
  lastAccessed?: string;
  sectionProgress?: SectionProgress[];
  quizResult?: QuizResult;
}