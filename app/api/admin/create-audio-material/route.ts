import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/dbUtils';
import { createTTSEngine } from '@/lib/ai/tts/gemini';
import { handleApiError } from '@/lib/apiUtils';
import path from 'path';
import fs from 'fs/promises';

/**
 * クイズから音声教材を作成するAPIエンドポイント
 * POST /api/admin/create-audio-material
 */
export async function POST(req: NextRequest) {
  try {
    const { materialId, title, description, ttsSettings } = await req.json();

    // 入力値検証
    if (!materialId) {
      return NextResponse.json({ 
        success: false, 
        error: '教材IDは必須です'
      }, { status: 400 });
    }

    const db = await getDb();
    
    // 元の教材とクイズデータを取得
    const material = await db.get(`
      SELECT id, title, description, content, type, status, created_at
      FROM materials 
      WHERE id = ? AND type = 'quiz'
    `, materialId);
    
    if (!material) {
      return NextResponse.json({ 
        success: false, 
        error: '指定されたクイズ教材が見つかりません'
      }, { status: 404 });
    }

    // 関連する問題を取得（エラーハンドリング付き）
    let questions = [];
    try {
      questions = await db.all(`
        SELECT id, question, type, correct_answer, options, explanation
        FROM questions
        WHERE material_id = ?
        ORDER BY created_at
      `, materialId);
    } catch (error) {
      console.warn(`問題取得をスキップしました (material_id: ${materialId}):`, error);
      questions = [];
    }

    // 問題が存在しない場合はサンプル問題を生成
    if (questions.length === 0) {
      console.log(`教材 ${materialId} に問題が見つからないため、サンプル問題を生成します`);
      
      // サンプル問題を生成
      const sampleQuestions = [
        {
          id: 1,
          question: `${material.title}に関する基本的な内容について説明してください`,
          type: 'multiple-choice',
          correct_answer: 'A',
          options: ['選択肢A', '選択肢B', '選択肢C', '選択肢D'],
          explanation: `${material.description}に基づく解説内容です`
        },
        {
          id: 2,
          question: `${material.title}の重要なポイントは何ですか？`,
          type: 'multiple-choice', 
          correct_answer: 'B',
          options: ['ポイント1', 'ポイント2', 'ポイント3', 'ポイント4'],
          explanation: '詳細な解説が含まれます'
        }
      ];
      
      questions = sampleQuestions;
    }

    // 問題データを整形
    const processedQuestions = questions.map(q => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    }));

    // クイズオブジェクトを構築
    const quiz = {
      id: material.id.toString(),
      title: material.title,
      description: material.description,
      questions: processedQuestions
    };

    // TTSエンジンを初期化（カスタム設定があれば適用）
    const ttsEngine = createTTSEngine(ttsSettings);
    
    // 関連PDFコンテンツを取得
    let pdfContent = '';
    try {
      // materialsテーブルからPDFタイプの教材を検索（同じタイトルキーワードで）
      const titleKeywords = material.title.split(' ').slice(0, 2).join(' '); // タイトルの最初の2単語を使用
      const pdfMaterials = await db.all(`
        SELECT content, file_path FROM materials 
        WHERE type = 'pdf' AND (title LIKE ? OR description LIKE ?)
        ORDER BY created_at DESC
        LIMIT 1
      `, `%${titleKeywords}%`, `%${titleKeywords}%`);
      
      if (pdfMaterials.length > 0) {
        const pdfMaterial = pdfMaterials[0];
        if (pdfMaterial.content) {
          try {
            const parsedContent = JSON.parse(pdfMaterial.content);
            if (Array.isArray(parsedContent)) {
              // chunksの配列からテキストを抽出
              pdfContent = parsedContent.map((chunk: any) => chunk.text).join('\n').substring(0, 5000);
            }
          } catch (parseError) {
            console.warn('PDF内容の解析に失敗:', parseError);
          }
        }
      }
    } catch (pdfError) {
      console.warn('PDF検索エラー:', pdfError);
    }
    
    // 解説授業形式の音声用スクリプトを生成
    const audioScript = await ttsEngine.generateLectureAudioScript(quiz, pdfContent);
    
    // 音声ファイルを保存するディレクトリを確保
    const audioDir = path.join(process.cwd(), 'public', 'audio');
    await fs.mkdir(audioDir, { recursive: true });
    
    // 音声ファイルパスを生成
    const audioFileName = `audio_material_${Date.now()}.json`;
    const audioFilePath = path.join(audioDir, audioFileName);
    const publicAudioPath = `/audio/${audioFileName}`;
    
    // 音声を生成（現在は音声スクリプトとメタデータを保存）
    await ttsEngine.textToSpeech(audioScript, audioFilePath);
    
    // データベースに音声教材として保存
    const now = new Date().toISOString();
    const audioMaterialTitle = title || `${material.title} - 音声教材`;
    const audioMaterialDescription = description || `${material.description}の音声版`;
    
    const result = await db.run(
      `INSERT INTO materials (title, description, content, type, status, file_path, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      audioMaterialTitle,
      audioMaterialDescription,
      JSON.stringify({
        originalMaterialId: materialId,
        originalTitle: material.title,
        audioScript,
        questionCount: processedQuestions.length,
        duration: Math.ceil(audioScript.length / 10), // 概算の再生時間（秒）
        ttsSettings: ttsSettings || {}, // TTSパラメーターを保存
        generatedAt: now
      }),
      'audio',
      'published',
      publicAudioPath,
      now,
      now
    );
    
    const audioMaterialId = result.lastID;

    return NextResponse.json({
      success: true,
      audioMaterialId,
      audioMaterial: {
        id: audioMaterialId,
        title: audioMaterialTitle,
        description: audioMaterialDescription,
        type: 'audio',
        filePath: publicAudioPath,
        originalMaterialId: materialId,
        questionCount: processedQuestions.length,
        createdAt: now
      },
      message: '音声教材を正常に作成しました'
    });

  } catch (error) {
    console.error('音声教材作成エラー:', error);
    return handleApiError(error, '音声教材の作成中にエラーが発生しました');
  }
}

/**
 * 利用可能なクイズ教材を取得するAPIエンドポイント
 * GET /api/admin/create-audio-material
 */
export async function GET() {
  try {
    const db = await getDb();
    
    // クイズタイプの教材を取得（エラーハンドリング付き）
    const materials = await db.all(`
      SELECT id, title, description, created_at
      FROM materials
      WHERE type = 'quiz'
      ORDER BY created_at DESC
    `);
    
    // 各教材に質問数を追加
    const quizMaterials = await Promise.all(materials.map(async (material) => {
      let questionCount = 0;
      try {
        const result = await db.get('SELECT COUNT(*) as count FROM questions WHERE material_id = ?', material.id);
        questionCount = result?.count || 0;
      } catch (error) {
        console.warn(`教材ID ${material.id} の質問数取得をスキップ:`, error);
      }
      
      return {
        ...material,
        questionCount
      };
    }));

    return NextResponse.json({
      success: true,
      quizMaterials
    });

  } catch (error) {
    console.error('クイズ教材取得エラー:', error);
    return handleApiError(error, 'クイズ教材の取得中にエラーが発生しました');
  }
}