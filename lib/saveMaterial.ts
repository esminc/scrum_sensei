import { apiRequest } from './apiUtils';

// 問題と教材チャンクの型定義
interface Question {
  question: string;
  options?: string[];
  answer?: string;
  explanation?: string;
}

interface Chunk {
  text: string;
  metadata?: {
    page?: number;
    position?: number;
  };
}

// 保存レスポンスの型定義
interface SaveMaterialResponse {
  success: boolean;
  message: string;
  materialId?: string;
}

/**
 * アップロードされたPDFから生成されたデータをDBに保存する
 * @param filePath アップロードされたPDFのパス
 * @param questions 生成された問題リスト
 * @param chunks 生成されたチャンクデータ
 * @returns 保存結果
 */
export async function saveMaterial(
  filePath: string, 
  questions: Question[], 
  chunks: Chunk[]
): Promise<SaveMaterialResponse> {
  try {
    const response = await apiRequest<SaveMaterialResponse>('/api/materials/save', {
      method: 'POST',
      body: JSON.stringify({
        filePath,
        questions,
        chunks
      })
    });
    
    return response;
  } catch (error) {
    console.error('教材保存エラー:', error);
    return {
      success: false,
      message: '教材の保存中にエラーが発生しました',
    };
  }
}
