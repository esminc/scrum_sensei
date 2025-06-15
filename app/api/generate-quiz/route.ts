import { NextRequest, NextResponse } from 'next/server';
import { safeJsonParse } from '@/lib/jsonUtils';
import { handleApiError } from '@/lib/apiUtils';
import { generateQuiz } from '@/lib/ai/tools/quizGenerator';

export async function POST(req: NextRequest) {
  try {
    const { topic, difficulty, questionCount, pdfFileId } = await req.json();

    // 入力値検証
    if (!topic) {
      return NextResponse.json({ 
        success: false, 
        error: 'トピックは必須です'
      }, { status: 400 });
    }

    const count = Math.min(Math.max(1, questionCount || 5), 20); // 1-20の範囲
    
    // PDFファイルIDが指定されている場合の処理（今回は省略）
    if (pdfFileId) {
      console.log('PDF based quiz generation requested:', pdfFileId);
    }

    // AI quiz generatorを使用して問題を生成
    try {
      console.log(`AIクイズジェネレーターでクイズを生成中: ${topic}, 難易度: ${difficulty}, 問題数: ${count}`);
      
      const options = {
        topic,
        count,
        types: ['multiple-choice'],
        filePath: pdfFileId ? `/uploads/${pdfFileId}` : undefined
      };

      const quizData = await generateQuiz(options);
      
      if (!quizData || !quizData.questions || !Array.isArray(quizData.questions)) {
        throw new Error('問題生成結果の形式が不正です');
      }

      // 各質問に必要な情報を確認・補完
      const validatedQuestions = quizData.questions.map((question: any, index: number) => ({
        id: question.id || `q_${index + 1}`,
        question: question.question || question.text || '',
        type: question.type || 'multiple-choice',
        difficulty: question.difficulty || difficulty || 'medium',
        options: question.options || question.choices || [],
        correctAnswer: question.correctAnswer || question.correct_answer || '',
        explanation: question.explanation || '解説が提供されていません',
        tags: question.tags || [topic]
      }));

      // データベースに教材として保存
      const { getDb } = await import('@/lib/dbUtils');
      const db = await getDb();
      
      const now = new Date().toISOString();
      const materialTitle = `${topic} - AIクイズ (${difficulty})`;
      const materialDescription = `AI生成クイズ: ${topic} (${difficulty}) - ${validatedQuestions.length}問`;
      
      // materialsテーブルに保存
      const result = await db.run(
        `INSERT INTO materials (title, description, content, type, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        materialTitle,
        materialDescription,
        JSON.stringify({
          topic,
          difficulty,
          questionCount: validatedQuestions.length,
          generatedAt: now
        }),
        'quiz',
        'published',
        now,
        now
      );
      
      const materialId = result.lastID;
      
      // questionsテーブルに各質問を保存
      for (const question of validatedQuestions) {
        await db.run(
          `INSERT INTO questions (material_id, question, type, correct_answer, options, explanation, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          materialId,
          question.question,
          question.type,
          question.correctAnswer,
          JSON.stringify(question.options),
          question.explanation,
          now
        );
      }

      return NextResponse.json({
        success: true,
        materialId,
        questions: validatedQuestions,
        metadata: {
          topic,
          difficulty: difficulty || 'medium',
          questionCount: validatedQuestions.length,
          generatedAt: now,
          saved: true
        }
      });

    } catch (genError) {
      console.error('AI問題生成エラー:', genError);
      
      return NextResponse.json({ 
        success: false, 
        error: 'AI問題生成に失敗しました',
        message: genError instanceof Error ? genError.message : '不明なエラー',
        details: {
          topic,
          difficulty,
          questionCount: count,
          action: 'パラメータを確認して再度お試しください'
        }
      }, { status: 500 });
    }
    
  } catch (e) {
    return handleApiError(e, '問題生成中にエラーが発生しました');
  }
}