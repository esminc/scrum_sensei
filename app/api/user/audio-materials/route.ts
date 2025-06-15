import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import { handleApiError } from '@/lib/apiUtils';

// データベース接続
function getDatabase() {
  const dbPath = process.env.DATABASE_PATH || './memory.db';
  return new Database(dbPath);
}

/**
 * ユーザー向け音声教材一覧を取得するAPIエンドポイント
 * GET /api/user/audio-materials
 */
export async function GET() {
  try {
    const db = getDatabase();
    
    try {
      // materialsテーブルから公開済みの音声教材を取得
      const audioMaterials = db.prepare(`
        SELECT 
          id,
          title,
          description,
          file_path,
          content,
          created_at,
          updated_at
        FROM materials 
        WHERE type = 'audio' AND status = 'published'
        ORDER BY created_at DESC
      `).all();

      // 音声教材データを整形
      const formattedMaterials = audioMaterials.map((material: any) => {
        let parsedContent = null;
        try {
          parsedContent = typeof material.content === 'string' 
            ? JSON.parse(material.content) 
            : material.content;
        } catch (error) {
          console.warn('音声教材コンテンツの解析に失敗:', error);
        }

        return {
          id: material.id.toString(),
          title: material.title,
          description: material.description,
          audioUrl: material.file_path,
          sourceText: parsedContent?.audioScript || parsedContent?.text || material.description || '',
          questionCount: parsedContent?.questionCount || 0,
          duration: parsedContent?.duration || 0,
          originalMaterialId: parsedContent?.originalMaterialId,
          materialTitle: parsedContent?.originalTitle,
          createdAt: material.created_at,
          updatedAt: material.updated_at
        };
      });

      return NextResponse.json({
        success: true,
        materials: formattedMaterials
      });

    } finally {
      db.close();
    }

  } catch (error) {
    console.error('音声教材取得エラー:', error);
    return handleApiError(error, '音声教材の取得中にエラーが発生しました');
  }
}