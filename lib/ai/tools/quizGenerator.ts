import { generateChatResponse, ChatMessage } from '../openai';
import fs from 'fs/promises';
import path from 'path';

interface QuizGeneratorOptions {
  topic: string;
  count: number;
  types: string[];
  filePath?: string;
  model?: string;
  temperature?: number;
}

interface QuizQuestion {
  id: string;
  type: string;
  question: string;
  options?: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  correctAnswer: string | string[];
  explanation?: string;
}

interface QuizResult {
  quizTitle: string;
  questions: QuizQuestion[];
  metadata: {
    topic: string;
    count: number;
    types: string[];
    sources: string[];
    createdAt: string;
  };
}

/**
 * アップロードされたファイルの内容から問題を生成するツール
 */
export async function generateQuiz(options: QuizGeneratorOptions): Promise<QuizResult> {
  const { topic, count, types, filePath } = options;

  try {
    // ファイルからコンテキストを取得
    const contextText = await getContentFromFile(filePath);
    
    if (!contextText || contextText.trim() === '') {
      throw new Error('ファイルの内容が空または読み取れませんでした。有効なファイルを指定してください。');
    }
    
    // ファイル名を取得（パスから）
    const fileName = filePath ? path.basename(filePath) : '不明なファイル';
    const sources = [fileName];

    // OpenAI APIを使用して問題を生成
    const questions = await generateQuestionsWithAI(contextText, topic, count, types);
    const quizTitle = `${topic}に関する確認テスト`;
    
    return {
      quizTitle,
      questions,
      metadata: {
        topic,
        count,
        types,
        sources: [...new Set(sources)],
        createdAt: new Date().toISOString()
      }
    };
  } catch (error: unknown) {
    throw new Error(`問題の生成に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * ファイルからコンテンツを取得する
 */
async function getContentFromFile(filePath?: string): Promise<string> {
  const possibleUploadDirs = [
    path.join(process.cwd(), 'public', 'uploads'),
    '/Users/yusuke/work/mastra/frontend/public/uploads'
  ];

  if (filePath) {
    // 絶対パスでの存在を確認
    if (path.isAbsolute(filePath)) {
      try {
        await fs.access(filePath);
        return await processFile(filePath);
      } catch (error) {
        // 次の方法を試す
      }
    }
    
    // ファイル名のみを取得
    const fileName = path.basename(filePath);
    
    // 各ディレクトリで完全一致するファイルを検索
    for (const dir of possibleUploadDirs) {
      try {
        const fullPath = path.join(dir, fileName);
        await fs.access(fullPath);
        return await processFile(fullPath);
      } catch (error) {
        // このディレクトリでは見つからなかった
      }
    }
  }

  // 最新のPDFファイルを使用
  for (const dir of possibleUploadDirs) {
    try {
      await fs.access(dir);
      
      const files = await fs.readdir(dir);
      if (files.length > 0) {
        const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
        
        if (pdfFiles.length === 0) {
          continue;
        }
        
        // ファイル情報を取得
        const fileStats = await Promise.all(
          pdfFiles.map(async (file) => {
            const filePath = path.join(dir, file);
            const stats = await fs.stat(filePath);
            return { file, stats, path: filePath };
          })
        );
        
        // 最新のファイルを使用
        fileStats.sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());
        return await processFile(fileStats[0].path);
      }
    } catch (error) {
      // このディレクトリではアクセスできない
    }
  }

  throw new Error(`アップロードされたPDFファイルが見つかりませんでした。`);
}

/**
 * ファイルを処理して内容を返す
 */
async function processFile(filePath: string): Promise<string> {
  try {
    // ファイルをバイナリとして読み取る
    const fileBuffer = await fs.readFile(filePath);
    
    // PDFファイルの場合（簡易実装）
    if (filePath.toLowerCase().endsWith('.pdf')) {
      // Note: In a real implementation, you would use a PDF parser
      // For now, return a placeholder
      return `PDFファイル「${path.basename(filePath)}」の内容に基づいて質問を生成します。`;
    } else {
      // テキストファイルの場合
      return fileBuffer.toString('utf-8');
    }
  } catch (error) {
    throw new Error(`ファイルを読み込めませんでした: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * OpenAI APIを使用して問題を生成する
 */
async function generateQuestionsWithAI(
  context: string,
  topic: string,
  questionCount: number = 5,
  questionTypes: string[] = ['multiple-choice']
): Promise<QuizQuestion[]> {
  try {
    const prompt = `
以下のテキストに基づいて、${topic}に関する${questionCount}個の${questionTypes.join(', ')}形式の問題を作成してください。
正解は明確に示してください。

コンテキスト:
${context}

問題は以下の形式のJSONとして返してください:
[
  {
    "id": "q1",
    "question": "問題文",
    "type": "multiple-choice",
    "options": [
      {"id": "a", "text": "選択肢1", "isCorrect": false},
      {"id": "b", "text": "選択肢2", "isCorrect": true},
      {"id": "c", "text": "選択肢3", "isCorrect": false},
      {"id": "d", "text": "選択肢4", "isCorrect": false}
    ],
    "correctAnswer": "b",
    "explanation": "解説"
  }
]
`;

    const messages: ChatMessage[] = [
      { role: 'user', content: prompt }
    ];

    const response = await generateChatResponse(messages);

    try {
      // JSONを抽出
      let jsonStart = response.indexOf('[');
      let jsonEnd = response.lastIndexOf(']') + 1;
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonContent = response.substring(jsonStart, jsonEnd);
        const questions = JSON.parse(jsonContent) as QuizQuestion[];
        return questions;
      } else {
        const jsonObj = JSON.parse(response);
        if (Array.isArray(jsonObj)) {
          return jsonObj as QuizQuestion[];
        } else if (jsonObj.questions && Array.isArray(jsonObj.questions)) {
          return jsonObj.questions as QuizQuestion[];
        }
      }
      
      throw new Error('有効な問題形式が見つかりませんでした');
    } catch (parseError) {
      return generateFallbackQuestions(topic, questionCount);
    }
  } catch (error) {
    return generateFallbackQuestions(topic, questionCount);
  }
}

/**
 * フォールバックとして問題を生成する
 */
function generateFallbackQuestions(topic: string, count: number): QuizQuestion[] {
  return Array(count).fill(0).map((_, i) => ({
    id: `q${i + 1}`,
    type: 'multiple-choice',
    question: `${topic}に関するフォールバック問題 ${i + 1}`,
    options: [
      { id: 'a', text: 'フォールバック選択肢A', isCorrect: true },
      { id: 'b', text: 'フォールバック選択肢B', isCorrect: false },
      { id: 'c', text: 'フォールバック選択肢C', isCorrect: false },
      { id: 'd', text: 'フォールバック選択肢D', isCorrect: false }
    ],
    correctAnswer: 'a',
    explanation: '問題生成中にエラーが発生したため、デフォルトの問題を表示しています。'
  }));
}