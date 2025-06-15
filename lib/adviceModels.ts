/**
 * AIアドバイスの種類
 */
export type AdviceType = 
  | 'motivation'  // モチベーション向上
  | 'weakness'    // 弱点強化
  | 'strategy'    // 学習戦略
  | 'progress'    // 進捗状況
  | 'alert'       // 注意点
  | 'general';    // 一般的なアドバイス

/**
 * AIアドバイスモデル
 */
export interface Advice {
  id: string;
  type: AdviceType;
  content: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

/**
 * アドバイスフィードバック
 */
export type AdviceFeedback = 'helpful' | 'not_helpful';

/**
 * アドバイスのデータソースタイプ
 */
export type AdviceDataSourceType = 
  | 'quiz_result'    // クイズの結果
  | 'learning_time'  // 学習時間
  | 'content_view'   // コンテンツ閲覧
  | 'progress'       // 進捗
  | 'error_pattern'; // エラーパターン

/**
 * アドバイスのデータソース
 */
export interface AdviceDataSource {
  sourceType: AdviceDataSourceType;
  sourceId: string;
  weight: number;
}
