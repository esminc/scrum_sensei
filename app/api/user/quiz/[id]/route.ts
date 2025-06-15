import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/dbUtils';
import { handleApiError } from '@/lib/apiUtils';

export async function GET(
  request: NextRequest,
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
      SELECT id, title, description, type, status
      FROM materials 
      WHERE id = ? AND type = 'quiz' AND status = 'published'
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
      questions: questions.map(q => ({
        id: q.id.toString(),
        question: q.question,
        type: q.type,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
        correctAnswer: q.correct_answer,
        explanation: q.explanation
      }))
    };
    
    return NextResponse.json({ quiz });
  } catch (error) {
    console.error('クイズ取得エラー:', error);
    return handleApiError(error, 'クイズの取得中にエラーが発生しました');
  }
}