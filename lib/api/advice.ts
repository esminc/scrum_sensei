/**
 * AIアドバイス関連のAPI呼び出し関数
 */
import { get, post } from './client';

/**
 * ユーザーのAIアドバイスを取得する
 * @param userId ユーザーID
 * @returns アドバイスデータ
 */
export async function fetchAiAdvice(userId: string) {
  return get(`user/advice?userId=${userId}`);
}

/**
 * アドバイスに対するフィードバックを送信する
 * @param adviceId アドバイスID 
 * @param userId ユーザーID
 * @param feedback フィードバック (helpful/not_helpful)
 * @returns 処理結果
 */
export async function sendAdviceFeedback(
  adviceId: string, 
  userId: string, 
  feedback: 'helpful' | 'not_helpful'
) {
  return post('user/advice/feedback', {
    adviceId,
    userId,
    feedback
  });
}

/**
 * ユーザーのAIアドバイス履歴を取得する
 * @param userId ユーザーID
 * @param limit 取得する最大件数
 * @returns アドバイス履歴データ
 */
export async function fetchAiAdviceHistory(userId: string, limit: number = 10) {
  return get(`user/advice/history?userId=${userId}&limit=${limit}`);
}

/**
 * ユーザーのAIアドバイス統計を取得する
 * @param userId ユーザーID
 * @returns アドバイス統計データ
 */
export async function fetchAiAdviceStats(userId: string) {
  return get(`user/advice/stats?userId=${userId}`);
}
