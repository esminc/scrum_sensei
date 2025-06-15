import { NextResponse } from 'next/server';

/**
 * 環境に応じて適切なAPIパスを生成する
 * @param endpoint APIエンドポイント
 * @returns 完全なAPIパス
 */
export function getApiPath(endpoint: string): string {
  // 開発環境では basePath を使わない
  if (process.env.NODE_ENV === 'development') {
    return `/api/${endpoint}`;
  }
  
  // 本番環境では basePath を含める
  return `/scrum_sensei/api/${endpoint}`;
}

/**
 * フロントエンドからAPIにリクエストを送信するための関数
 * @param endpoint APIエンドポイント
 * @param options フェッチオプション
 * @returns レスポンスデータ
 * @throws エラー発生時
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const url = `${baseUrl}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `リクエストエラー: ${response.status}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error(`API リクエストエラー (${url}):`, error);
    throw error;
  }
}

/**
 * API共通のエラーハンドラー
 * @param error エラーオブジェクト
 * @param defaultMessage デフォルトのエラーメッセージ
 * @param logError コンソールにログ出力するかどうか（デフォルト: true）
 * @returns NextResponseオブジェクト
 */
export function handleApiError(error: unknown, defaultMessage: string, logError = true): NextResponse {
  if (logError) {
    console.error(`API Error: ${defaultMessage}`, error);
  }
  
  const errorMessage = error instanceof Error ? error.message : defaultMessage;
  
  return NextResponse.json(
    { 
      success: false, 
      message: errorMessage || defaultMessage 
    }, 
    { status: 500 }
  );
}

/**
 * リクエストボディの型安全なバリデーション
 * @param body リクエストボディ
 * @param requiredFields 必須フィールドの配列
 * @returns バリデーションエラーレスポンスまたはnull
 */
export function validateRequestBody<T>(
  body: T,
  requiredFields: (keyof T)[]
): NextResponse | null {
  const missingFields = requiredFields.filter(field => !body[field]);
  
  if (missingFields.length > 0) {
    return NextResponse.json(
      { 
        success: false, 
        message: `以下の必須フィールドがありません: ${missingFields.join(', ')}` 
      }, 
      { status: 400 }
    );
  }
  
  return null;
}