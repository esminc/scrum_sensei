import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/dbUtils';

interface Params {
  params: {
    id: string;
  };
}

/**
 * 教材をクイズ形式で取得するAPIエンドポイント（GET /api/materials/[id]/quiz）
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: '教材IDが指定されていません' },
        { status: 400 }
      );
    }
    
    const db = await getDb();
    
    // 教材の基本情報を取得
    const material = await db.get(`
      SELECT id, title, description, content, type, status, created_at, updated_at
      FROM materials 
      WHERE id = ? AND type = 'quiz'
    `, id);
    
    if (!material) {
      return NextResponse.json(
        { success: false, message: 'クイズが見つかりません' },
        { status: 404 }
      );
    }
    
    // 関連する問題を取得
    const questions = await db.all(`
      SELECT id, question, type, correct_answer, options, explanation, created_at
      FROM questions
      WHERE material_id = ?
      ORDER BY created_at
    `, id);
    
    // 問題データをクイズ形式に変換
    const processedQuestions = questions.map(q => {
      let options = [];
      if (q.options) {
        try {
          options = JSON.parse(q.options);
        } catch (e) {
          console.error('選択肢の解析エラー:', e);
        }
      }
      
      return {
        id: q.id.toString(),
        question: q.question,
        type: q.type,
        options: options,
        correctAnswer: q.correct_answer,
        explanation: q.explanation,
        points: 1,
        difficulty: 'intermediate', // デフォルト値
        tags: []
      };
    });
    
    // contentフィールドから追加情報を取得（存在する場合）
    let contentData: any = {};
    if (material.content) {
      try {
        contentData = JSON.parse(material.content);
      } catch (e) {
        console.error('コンテンツデータの解析エラー:', e);
      }
    }
    
    // クイズオブジェクトを構築
    const quiz = {
      id: material.id.toString(),
      title: material.title,
      description: material.description,
      contentId: material.id.toString(),
      questions: processedQuestions,
      timeLimit: contentData.timeLimit || null,
      passingScore: contentData.passingScore || null,
      createdAt: material.created_at,
      updatedAt: material.updated_at
    };
    
    return NextResponse.json({
      success: true,
      quiz
    });
  } catch (error) {
    console.error('クイズ取得エラー:', error);
    return NextResponse.json(
      { success: false, message: 'クイズの取得中にエラーが発生しました', error: String(error) },
      { status: 500 }
    );
  }
}