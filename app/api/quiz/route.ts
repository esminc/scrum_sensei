import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/dbUtils';
import { handleApiError } from '@/lib/apiUtils';

/**
 * クイズを新規作成するAPIエンドポイント
 * POST /api/quiz
 */
export async function POST(req: NextRequest) {
  try {
    const { title, description, questions } = await req.json();

    // 入力値検証
    if (!title || !title.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: 'タイトルは必須です'
      }, { status: 400 });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: '問題は少なくとも1つ必要です'
      }, { status: 400 });
    }

    const db = await getDb();
    const now = new Date().toISOString();
    
    // 教材としてクイズを保存
    const result = await db.run(
      `INSERT INTO materials (title, description, content, type, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      title.trim(),
      description || `${title}に関する問題集`,
      JSON.stringify(questions), // 問題データをJSONとして保存
      'quiz', // タイプ
      'published', // ステータス
      now,
      now
    );
    
    const materialId = result.lastID;
    
    if (!materialId) {
      return NextResponse.json({ 
        success: false, 
        error: '教材の作成に失敗しました'
      }, { status: 500 });
    }
    
    // 個別の問題を questions テーブルに保存
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      // 正解を特定
      let correctAnswer = question.correctAnswer;
      if (!correctAnswer && question.options && Array.isArray(question.options)) {
        const correctOption = question.options.find((opt: any) => opt.isCorrect);
        correctAnswer = correctOption?.text || '';
      }
      
      await db.run(
        `INSERT INTO questions (material_id, question, type, correct_answer, options, explanation, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        materialId,
        question.question || `問題 ${i + 1}`,
        question.type || 'multiple-choice',
        correctAnswer,
        JSON.stringify(question.options || []),
        question.explanation || '',
        now
      );
    }

    return NextResponse.json({
      success: true,
      id: materialId.toString(),
      message: 'クイズを正常に保存しました',
      materialId,
      questionCount: questions.length
    });

  } catch (error) {
    console.error('クイズ保存エラー:', error);
    return handleApiError(error, 'クイズの保存中にエラーが発生しました');
  }
}

/**
 * クイズ一覧を取得するAPIエンドポイント
 * GET /api/quizzes (quizRepositoryが呼び出すかもしれない)
 */
export async function GET() {
  try {
    const db = await getDb();
    
    // クイズタイプの教材を取得
    const quizzes = await db.all(`
      SELECT 
        m.id, 
        m.title, 
        m.description, 
        m.created_at,
        (SELECT COUNT(*) FROM questions q WHERE q.material_id = m.id) as questionCount
      FROM materials m
      WHERE m.type = 'quiz'
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
      quizzes: formattedQuizzes
    });

  } catch (error) {
    console.error('クイズ一覧取得エラー:', error);
    return handleApiError(error, 'クイズ一覧の取得中にエラーが発生しました');
  }
}