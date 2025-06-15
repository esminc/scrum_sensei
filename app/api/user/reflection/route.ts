// filepath: /Users/y-matsushima/work/mastra/next-app/app/api/user/reflection/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { contentStore } from '@/lib/storage';
import { LearningCoachAgent } from '@/lib/ai/agents/learningCoach';

// 環境変数からOpenAI APIキーを取得
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// 学習コーチエージェントのインスタンスを作成
const learningCoach = new LearningCoachAgent(OPENAI_API_KEY);

/**
 * 振り返り質問生成API
 * POST /api/user/reflection
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
    const { userId, contentId } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { status: 400 }
      );
    }
    
    if (!contentId) {
      return NextResponse.json(
        { error: 'コンテンツIDが必要です' },
        { status: 400 }
      );
    }
    
    // コンテンツ情報を取得
    const content = await contentStore.getContentById(contentId);
    
    if (!content) {
      return NextResponse.json(
        { error: '指定されたコンテンツは存在しません' },
        { status: 404 }
      );
    }
    
    // 振り返り質問を生成
    const questions = await learningCoach.generateReflectionQuestions(content);
    
    return NextResponse.json({ questions }, { status: 200 });
  } catch (error) {
    console.error('振り返り質問生成エラー:', error);
    return NextResponse.json(
      { error: '振り返り質問の生成に失敗しました' },
      { status: 500 }
    );
  }
}