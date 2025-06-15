import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/dbUtils';
import { handleApiError } from '@/lib/apiUtils';
import { join } from 'path';
import { unlink } from 'fs/promises';

/**
 * 特定の教材情報を取得するAPI
 * GET /api/admin/materials/[id]
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!id) {
      return NextResponse.json({ error: 'IDが不正です' }, { status: 400 });
    }

    const db = await getDb();
    
    // 教材情報を取得
    const material = await db.get('SELECT * FROM materials WHERE id = ?', [id]);
    
    if (!material) {
      return NextResponse.json({ error: '指定された教材は存在しません' }, { status: 404 });
    }
    
    // 関連するクイズ情報を取得（quizzesテーブルにはmaterial_idがないため空配列）
    const quizzes = [];
    
    // 関連する問題情報を取得
    let questions = [];
    try {
      questions = await db.all(`
        SELECT id, question, type, correct_answer, options, explanation, created_at
        FROM questions
        WHERE material_id = ?
        ORDER BY created_at DESC
      `, [id]);
    } catch (error) {
      console.warn(`問題の取得をスキップしました (material_id: ${id}):`, error);
      questions = [];
    }
    
    // questionsのoptionsをJSONから解析
    const parsedQuestions = questions.map(q => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    }));

    return NextResponse.json({
      success: true,
      material: {
        ...material,
        quizzes,
        questions: parsedQuestions
      }
    });
  } catch (e) {
    return handleApiError(e, '教材情報の取得に失敗しました');
  }
}

/**
 * 教材情報を更新するAPI
 * PUT /api/admin/materials/[id]
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!id) {
      return NextResponse.json({ error: 'IDが不正です' }, { status: 400 });
    }

    const db = await getDb();
    
    // 更新前に教材の存在確認
    const existingMaterial = await db.get('SELECT * FROM materials WHERE id = ?', [id]);
    
    if (!existingMaterial) {
      return NextResponse.json({ error: '指定された教材は存在しません' }, { status: 404 });
    }
    
    const { title, description, type, status } = await req.json();
    
    // 必須項目のバリデーション
    if (!title) {
      return NextResponse.json({ error: 'タイトルは必須です' }, { status: 400 });
    }
    
    // 教材情報を更新
    await db.run(`
      UPDATE materials
      SET title = ?, description = ?, type = ?, status = ?, updated_at = datetime('now')
      WHERE id = ?
    `, [title, description || existingMaterial.description, type || existingMaterial.type, status || existingMaterial.status, id]);
    
    // 更新後の教材情報を取得
    const updatedMaterial = await db.get('SELECT * FROM materials WHERE id = ?', [id]);
    
    return NextResponse.json({
      success: true,
      material: updatedMaterial,
      message: '教材情報が正常に更新されました'
    });
  } catch (e) {
    return handleApiError(e, '教材情報の更新に失敗しました');
  }
}

/**
 * 教材を削除するAPI
 * DELETE /api/admin/materials/[id]
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!id) {
    return NextResponse.json({ error: 'IDが不正です' }, { status: 400 });
  }

  try {
    const db = await getDb();
    
    // 削除前に教材の存在確認
    const material = await db.get('SELECT * FROM materials WHERE id = ?', [id]);
    
    if (!material) {
      return NextResponse.json({ error: '指定された教材は存在しません' }, { status: 404 });
    }
    
    // PDFファイルパス取得
    if (material.pdf_path) {
      const filePath = join(process.cwd(), 'public', material.pdf_path.replace(/^\//, ''));
      try {
        await unlink(filePath);
      } catch (fileError) {
        // ファイル削除失敗のログ記録（ただしDBの削除処理は続行）
        console.warn(`ファイル削除に失敗しましたが処理を継続します: ${filePath}`, fileError);
      }
    }
    
    // 関連する問題を削除（存在する場合のみ）
    try {
      await db.run('DELETE FROM questions WHERE material_id = ?', [id]);
    } catch (error) {
      console.warn(`問題の削除をスキップしました (material_id: ${id}):`, error);
    }
    
    // 関連するクイズを削除（quizzesテーブルにはmaterial_idがないためスキップ）
    // quizzesテーブルは独立したIDシステムを使用しているため、削除しない
    
    // 教材を削除
    await db.run('DELETE FROM materials WHERE id = ?', [id]);
    
    return NextResponse.json({
      success: true,
      message: '教材が正常に削除されました'
    });
  } catch (e) {
    return handleApiError(e, '教材の削除に失敗しました');
  }
}
