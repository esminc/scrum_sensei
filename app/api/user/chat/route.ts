// filepath: /Users/y-matsushima/work/mastra/next-app/app/api/user/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { contentStore, progressStore } from '@/lib/storage';
import { LearningCoachAgent } from '@/lib/ai/agents/learningCoach';

// 環境変数からOpenAI APIキーを取得
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// 学習コーチエージェントのインスタンスを作成
const learningCoach = new LearningCoachAgent(OPENAI_API_KEY);

/**
 * 学習AIチャットAPI
 * POST /api/user/chat
 */
export async function POST(request: NextRequest) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API キーが設定されていません' },
      { status: 500 }
    );
  }
  
  try {
    const body = await request.json();
    const { userId, contentId, message } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { status: 400 }
      );
    }
    
    if (!message) {
      return NextResponse.json(
        { error: 'メッセージが必要です' },
        { status: 400 }
      );
    }
    
    // 関連データの取得
    let content;
    let progress;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let relatedQuizzes: any[] = [];
    
    // 指定されたコンテンツに関連するデータを取得
    if (contentId) {
      // コンテンツ情報を取得
      content = await contentStore.getContentById(contentId);
      
      // 進捗情報を取得
      progress = await progressStore.getContentProgress(userId, contentId);
      
      // 関連するクイズを取得
      const quizzes = await contentStore.getQuizzesByContentId(contentId);
      if (quizzes && quizzes.length > 0) {
        relatedQuizzes = quizzes;
      }
    }
    
    // ユーザーの全体的な進捗を取得
    const allProgress = await progressStore.getUserProgress(userId);
    
    // AIチャットからの応答を生成
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aiResponse = await (learningCoach as any).chat(
      [{ role: 'user', content: message }],
      userId,
      content,
      progress,
      relatedQuizzes,
      allProgress
    );
    
    return NextResponse.json({ message: aiResponse }, { status: 200 });
  } catch (error) {
    console.error('チャットエラー:', error);
    return NextResponse.json(
      { error: 'チャットの処理に失敗しました' },
      { status: 500 }
    );
  }
}