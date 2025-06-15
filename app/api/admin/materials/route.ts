import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/dbUtils';
import { handleApiError } from '@/lib/apiUtils';

/**
 * 管理者向け教材一覧を取得するAPI
 * GET /api/admin/materials
 */
export async function GET() {
  try {
    const db = await getDb();
    
    // まず基本的な教材一覧を取得
    const materials = await db.all(`
      SELECT id, title, description, type, status, created_at, updated_at, published_at
      FROM materials
      ORDER BY created_at DESC
    `);
    
    // 各教材に質問数を追加（エラーハンドリング付き）
    const enhancedMaterials = await Promise.all(materials.map(async (material) => {
      try {
        // 質問数を取得
        const questionCountResult = await db.get(
          'SELECT COUNT(*) as count FROM questions WHERE material_id = ?', 
          material.id
        );
        const questionCount = questionCountResult?.count || 0;
        
        // 関連するクイズ情報があれば取得
        let quizzes = [];
        try {
          quizzes = await db.all(
            'SELECT id, title, difficulty FROM quizzes WHERE material_id = ?', 
            material.id
          );
        } catch (err) {
          console.warn(`クイズ情報の取得に失敗: ${err}`);
          quizzes = [];
        }
        
        // セクション情報を取得
        let sections = [];
        try {
          sections = await db.all(
            'SELECT id, title, content, audio_url FROM material_sections WHERE material_id = ? ORDER BY position',
            material.id
          );
        } catch (err) {
          console.warn(`セクション情報の取得に失敗: ${err}`);
          sections = [];
        }
        
        return {
          ...material,
          questionCount,
          quizzes,
          sections
        };
      } catch (error) {
        console.error(`教材ID ${material.id} の詳細情報取得に失敗:`, error);
        return {
          ...material,
          questionCount: 0,
          quizzes: [],
          sections: []
        };
      }
    }));
    
    return NextResponse.json({
      success: true,
      materials: enhancedMaterials
    });
    
  } catch (error) {
    console.error('Materials API error:', error);
    return handleApiError(error, '教材一覧の取得に失敗しました');
  }
}

/**
 * 新規教材を作成するAPI
 * POST /api/admin/materials
 */
export async function POST(req: NextRequest) {
  try {
    const db = await getDb();
    const { title, description, type, sections = [] } = await req.json();
    
    if (!title) {
      return NextResponse.json({ error: 'タイトルは必須です' }, { status: 400 });
    }
    
    // 教材を追加
    const result = await db.run(
      `INSERT INTO materials (title, description, type, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
      title, description || null, type || 'text', 'draft'
    );
    
    const materialId = result.lastID;
    
    // セクションがあれば追加
    if (sections && sections.length > 0) {
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        await db.run(
          `INSERT INTO material_sections (material_id, title, content, position, created_at, updated_at)
           VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
          materialId, section.title, section.content || '', i
        );
      }
    }
    
    // 作成した教材を取得して返す
    const material = await db.get('SELECT * FROM materials WHERE id = ?', materialId);
    
    return NextResponse.json({
      success: true,
      material
    });
    
  } catch (error) {
    return handleApiError(error, '教材の作成に失敗しました');
  }
}
