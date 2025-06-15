import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/dbUtils';
import { handleApiError } from '@/lib/apiUtils';

/**
 * 個別クイズの詳細を取得するAPIエンドポイント
 * GET /api/quiz/[id]
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const materialId = Number(params.id);
    
    if (!materialId) {
      return NextResponse.json(
        { error: '教材IDが必要です' },
        { status: 400 }
      );
    }
    
    const db = await getDb();
    
    // 教材情報を取得
    const material = await db.get(`
      SELECT id, title, description, type, status, created_at, updated_at
      FROM materials 
      WHERE id = ? AND type = 'quiz'
    `, materialId);
    
    if (!material) {
      return NextResponse.json(
        { error: 'クイズが見つかりません' },
        { status: 404 }
      );
    }
    
    // 関連する問題を取得
    const questions = await db.all(`
      SELECT id, question, type, correct_answer, options, explanation
      FROM questions
      WHERE material_id = ?
      ORDER BY created_at
    `, materialId);
    
    // クイズオブジェクトを構築
    const quiz = {
      id: material.id.toString(),
      title: material.title,
      description: material.description,
      contentId: null,
      timeLimit: null,
      passingScore: null,
      createdAt: material.created_at,
      updatedAt: material.updated_at,
      questions: questions.map(q => ({
        id: q.id.toString(),
        question: q.question,
        type: q.type,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
        correctAnswer: q.correct_answer,
        explanation: q.explanation,
        points: 1,
        difficulty: 'intermediate'
      }))
    };
    
    return NextResponse.json({ 
      success: true,
      quiz 
    });
  } catch (error) {
    console.error('クイズ取得エラー:', error);
    return handleApiError(error, 'クイズの取得中にエラーが発生しました');
  }
}

/**
 * クイズを削除するAPIエンドポイント
 * DELETE /api/quiz/[id]
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const materialId = Number(params.id);
    
    if (!materialId) {
      return NextResponse.json(
        { error: '教材IDが必要です' },
        { status: 400 }
      );
    }
    
    const db = await getDb();
    
    // 関連する問題を削除
    await db.run('DELETE FROM questions WHERE material_id = ?', materialId);
    
    // 教材を削除
    const result = await db.run('DELETE FROM materials WHERE id = ? AND type = "quiz"', materialId);
    
    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'クイズが見つかりません' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'クイズを削除しました'
    });
  } catch (error) {
    console.error('クイズ削除エラー:', error);
    return handleApiError(error, 'クイズの削除中にエラーが発生しました');
  }
}