/**
 * Gemini 2.5 TTS (Text-to-Speech) エンジン
 * 最新のネイティブ音声生成API仕様に準拠
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';

interface TTSConfig {
  apiKey: string;
  model?: string;
  voice?: string;
  language?: string;
  style?: string;
}

export class GeminiTTSEngine {
  private genAI: GoogleGenerativeAI;
  private config: TTSConfig;

  constructor(config: TTSConfig) {
    this.config = {
      model: 'gemini-2.5-flash-preview-tts',
      voice: 'Kore',
      language: 'ja-JP',
      style: 'clear and friendly',
      ...config
    };
    this.genAI = new GoogleGenerativeAI(this.config.apiKey);
  }

  /**
   * テキストを音声に変換（Gemini 2.5 ネイティブTTS使用）
   * @param text 変換するテキスト
   * @param outputPath 出力ファイルパス
   * @returns 音声ファイルのパス
   */
  async textToSpeech(text: string, outputPath: string): Promise<string> {
    try {
      // デバッグ：使用するモデルをログ出力
      console.log('🔊 TTS設定:');
      console.log('- モデル:', this.config.model);
      console.log('- 音声:', this.config.voice);
      console.log('- 言語:', this.config.language);
      console.log('- スタイル:', this.config.style);
      
      // 音声スタイルを含むプロンプトを作成
      const styledText = this.createStyledPrompt(text);
      
      const model = this.genAI.getGenerativeModel({ model: this.config.model! });
      
      // 最新のGemini 2.5 TTS API仕様に合わせた呼び出し
      const response = await model.generateContent({
        contents: [{ 
          role: 'user',
          parts: [{ text: styledText }] 
        }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { 
                voiceName: this.config.voice! 
              }
            }
          }
        } as any
      });
      
      console.log('📡 API応答状況:', {
        hasResponse: !!response,
        hasCandidates: !!response?.response?.candidates,
        candidatesLength: response?.response?.candidates?.length || 0
      });

      // 音声データを取得
      const audioData = response.response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      
      if (!audioData) {
        throw new Error('音声データの生成に失敗しました');
      }

      // Base64デコードしてファイルに保存
      const audioBuffer = Buffer.from(audioData, 'base64');
      await fs.writeFile(outputPath, audioBuffer);
      
      return outputPath;
    } catch (error) {
      console.error('TTS変換エラー:', error);
      throw new Error(`音声変換に失敗しました: ${error}`);
    }
  }

  /**
   * 音声スタイルを含むプロンプトを作成
   * @param text 元のテキスト
   * @returns スタイル指定されたプロンプト
   */
  private createStyledPrompt(text: string): string {
    const style = this.config.style || 'clear and friendly';
    
    // 教育用音声材料として適切なスタイルプロンプトを作成
    return `Read the following educational content in a ${style} tone, appropriate for a learning environment. 
Speak at a comfortable pace that allows for easy comprehension:

${text}`;
  }

  /**
   * 複数のテキストセグメントを連続音声に変換
   * @param segments テキストセグメントの配列
   * @param outputPath 出力ファイルパス
   * @returns 音声ファイルのパス
   */
  async textSegmentsToSpeech(segments: string[], outputPath: string): Promise<string> {
    try {
      const combinedText = segments.join('\n\n');
      return await this.textToSpeech(combinedText, outputPath);
    } catch (error) {
      console.error('セグメント音声変換エラー:', error);
      throw new Error(`セグメント音声変換に失敗しました: ${error}`);
    }
  }

  /**
   * クイズを基に解説授業形式の音声教材スクリプトを生成
   * @param quiz クイズデータ
   * @param pdfContent PDFの内容（オプション）
   * @returns 音声用テキスト
   */
  async generateLectureAudioScript(quiz: any, pdfContent?: string): Promise<string> {
    try {
      // テキスト生成には利用可能なGeminiモデルを使用
      const textModel = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      // クイズから主要なトピックを抽出
      const topics = quiz.questions.map((q: any) => q.question).join('\n');
      const explanations = quiz.questions.map((q: any) => q.explanation).filter(Boolean).join('\n');
      
      const prompt = `
あなたは優秀な講師です。以下の情報を基に、教育的で分かりやすい解説授業の音声教材スクリプトを作成してください。

【教材タイトル】
${quiz.title}

【扱うべき問題・トピック】
${topics}

【既存の解説】
${explanations}

${pdfContent ? `【参考資料（PDF内容）】\n${pdfContent.substring(0, 3000)}\n` : ''}

【作成指示】
1. 導入部分で学習目標を明確にする
2. 各トピックを論理的な順序で解説する
3. 具体例や実例を交えて理解しやすくする
4. 重要なポイントは繰り返し強調する
5. 学習者が聞きやすい自然な話し方で構成する
6. 15-20分程度の音声授業として構成する
7. 最後に要点をまとめて振り返りを行う

【音声教材スクリプト形式】
- 自然な話し言葉で記述
- 適切な間（、）や（。）を使用
- 聞き手を意識した語りかけるような文体
- 専門用語は分かりやすく説明

スクリプトを作成してください：
`;

      const result = await textModel.generateContent(prompt);
      const response = result.response;
      return response.text();
      
    } catch (error) {
      console.error('授業スクリプト生成エラー:', error);
      // フォールバック：シンプルな解説形式
      return this.generateSimpleLectureScript(quiz);
    }
  }

  /**
   * シンプルな解説形式のフォールバック
   */
  private generateSimpleLectureScript(quiz: any): string {
    let script = `${quiz.title}について解説します。\n\n`;
    
    script += `今日は、${quiz.title}に関する重要なポイントを学習していきましょう。\n\n`;
    
    quiz.questions.forEach((question: any, index: number) => {
      script += `${index + 1}つ目のポイントです。\n`;
      script += `${question.question.replace('？', '')}について説明します。\n\n`;
      
      if (question.explanation) {
        script += `${question.explanation}\n\n`;
      }
      
      script += `このポイントをしっかりと理解しておきましょう。\n\n`;
    });
    
    script += `以上で${quiz.title}の解説を終わります。今日学んだ内容をよく復習して、理解を深めてください。お疲れさまでした。`;
    
    return script;
  }

  /**
   * 従来のクイズ音声化（互換性のため残す）
   */
  generateQuizAudioScript(quiz: any): string {
    return this.generateSimpleLectureScript(quiz);
  }
}

/**
 * デフォルトのTTSエンジンインスタンスを作成
 * @param customSettings カスタムTTS設定（オプション）
 */
export function createTTSEngine(customSettings?: Partial<TTSConfig>): GeminiTTSEngine {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  
  if (!apiKey) {
    throw new Error('Gemini API key is required. Set GEMINI_API_KEY or GOOGLE_API_KEY environment variable.');
  }
  
  // デフォルト設定
  const defaultConfig = {
    apiKey,
    model: process.env.GEMINI_TTS_MODEL || 'gemini-2.5-flash-preview-tts',
    voice: process.env.GEMINI_TTS_VOICE || 'Kore',
    language: process.env.GEMINI_TTS_LANGUAGE || 'ja-JP',
    style: process.env.GEMINI_TTS_STYLE || 'clear and friendly'
  };

  // カスタム設定があれば上書き
  const finalConfig = customSettings ? { ...defaultConfig, ...customSettings } : defaultConfig;
  
  // デバッグ：最終設定をログ出力
  console.log('🚀 TTSエンジン作成:');
  console.log('- 環境変数モデル:', process.env.GEMINI_TTS_MODEL);
  console.log('- 最終設定:', finalConfig);

  return new GeminiTTSEngine(finalConfig);
}