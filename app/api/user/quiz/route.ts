import { NextResponse } from 'next/server';
import { getDb } from '@/lib/dbUtils';

/**
 * ユーザー向けクイズ一覧を取得するAPIエンドポイント
 * GET /api/user/quiz
 */
export async function GET() {
  try {
    const db = await getDb();
    
    // materialsテーブルから公開済みのクイズタイプの教材を取得
    const quizzes = await db.all(`
      SELECT m.id, m.title, m.description, m.created_at,
        (SELECT COUNT(*) FROM questions q WHERE q.material_id = m.id) as questionCount
      FROM materials m
      WHERE m.type = 'quiz' AND m.status = 'published'
      ORDER BY m.created_at DESC
    `);
    
    const formattedQuizzes = quizzes.map(quiz => ({
      id: quiz.id.toString(),
      title: quiz.title,
      description: quiz.description,
      createdAt: quiz.created_at,
      questionCount: quiz.questionCount
    }));

    return NextResponse.json({
      success: true,
      quizzes: formattedQuizzes,
      count: formattedQuizzes.length
    });
  } catch (error) {
    console.error('ユーザー向けクイズ一覧取得エラー:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'クイズ一覧の取得中にエラーが発生しました', 
        error: String(error),
        quizzes: [],
        count: 0
      },
      { status: 500 }
    );
  }
}