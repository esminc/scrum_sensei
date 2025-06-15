import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/dbUtils';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    
    // materialsテーブルからクイズタイプの教材を取得
    const materials = await db.all(`
      SELECT 
        id,
        title,
        description,
        created_at,
        content
      FROM materials
      WHERE type = 'quiz'
      ORDER BY created_at DESC
    `);
    
    // 各教材の質問数を取得
    const materialsWithQuestions = await Promise.all(materials.map(async (material) => {
      let questionCount = 0;
      let questions = [];
      
      try {
        // questionsテーブルから質問を取得
        questions = await db.all(`
          SELECT 
            id,
            question,
            type,
            correct_answer,
            options,
            explanation
          FROM questions
          WHERE material_id = ?
          ORDER BY created_at ASC
        `, material.id);
        
        questionCount = questions.length;
        
        // optionsをJSONからパース
        questions = questions.map(q => ({
          ...q,
          options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
        }));
        
      } catch (error) {
        console.warn(`質問取得をスキップ (material_id: ${material.id}):`, error);
      }
      
      return {
        id: material.id,
        title: material.title,
        description: material.description,
        created_at: material.created_at,
        questions: questions,
        questionCount: questionCount
      };
    }));
    
    return NextResponse.json({ 
      success: true, 
      materials: materialsWithQuestions || [],
      count: materialsWithQuestions.length
    });
    
  } catch (error) {
    console.error('クイズ教材取得エラー:', error);
    return NextResponse.json(
      { error: 'クイズ教材の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}