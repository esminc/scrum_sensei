/**
 * APIクライアントユーティリティ
 * 環境変数からAPIエンドポイントのベースURLを取得し、APIリクエストを行うための関数を提供します
 */

// API URLの環境変数かデフォルトパスを使用
export const API_BASE_URL = process.env.NEXT_PUBLIC_MASTRA_API_URL || 
  process.env.NEXT_PUBLIC_API_URL || 
  '';

/**
 * APIリクエストを送信する関数
 * @param endpoint エンドポイントパス（先頭の / はそのまま使用）
 * @param options フェッチオプション
 * @returns レスポンス
 */
export async function fetchApi<T = any>(
  endpoint: string, 
  options?: RequestInit
): Promise<T> {
  // エンドポイントの先頭に/apiが付いている場合は削除
  let cleanEndpoint = endpoint;
  if (cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.substring(5);  // '/api/'の長さが5
  } else if (cleanEndpoint.startsWith('api/')) {
    cleanEndpoint = cleanEndpoint.substring(4);  // 'api/'の長さが4
  }
  cleanEndpoint = cleanEndpoint.replace(/^\//, '');
  
  // URLの構築
  const url = API_BASE_URL ? `${API_BASE_URL}/${cleanEndpoint}` : `/api/${cleanEndpoint}`;
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    // エラーレスポンスをJSONとしてパースを試みる
    try {
      const errorData = await response.json();
      throw new Error(
        errorData.message || errorData.error || `API error: ${response.status}`
      );
    } catch (e) {
      // JSONパースに失敗した場合はステータスコードのみのエラーを投げる
      if (e instanceof SyntaxError) {
        throw new Error(`API error: ${response.status}`);
      }
      throw e;
    }
  }
  
  // 204 No Content の場合は空のオブジェクトを返す
  if (response.status === 204) {
    return {} as T;
  }
  
  return await response.json() as T;
}

/**
 * GET リクエストを送信する
 */
export function get<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: 'GET',
    ...options
  });
}

/**
 * POST リクエストを送信する
 */
export function post<T = any>(
  endpoint: string, 
  data?: any, 
  options?: RequestInit
): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    body: data ? JSON.stringify(data) : undefined,
    ...options
  });
}

/**
 * PUT リクエストを送信する
 */
export function put<T = any>(
  endpoint: string, 
  data?: any, 
  options?: RequestInit
): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    body: data ? JSON.stringify(data) : undefined,
    ...options
  });
}

/**
 * DELETE リクエストを送信する
 */
export function del<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: 'DELETE',
    ...options
  });
}
