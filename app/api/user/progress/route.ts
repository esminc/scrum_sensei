// filepath: /Users/y-matsushima/work/mastra/next-app/app/api/user/progress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { progressStore } from '@/lib/storage';
import { CreateProgressRequest, UpdateProgressRequest } from '@/lib/models/progress';

/**
 * ユーザー向け進捗取得API
 * GET /api/user/progress?userId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const contentId = searchParams.get('contentId');
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'ユーザーIDが必要です'
      }, { status: 400 });
    }
    
    // 特定のコンテンツの進捗を取得
    if (contentId) {
      const progress = await progressStore.getContentProgress(userId, contentId);
      return NextResponse.json(progress || { exists: false }, { status: 200 });
    }
    
    // ユーザーの全進捗を取得
    const progressList = await progressStore.getUserProgress(userId);
    const stats = await progressStore.getUserStats(userId);
    
    return NextResponse.json({ 
      progress: progressList,
      stats,
      count: progressList.length
    }, { status: 200 });
  } catch (error) {
    console.error('進捗取得エラー:', error);
    return NextResponse.json({ 
      error: '進捗情報の取得に失敗しました'
    }, { status: 500 });
  }
}

/**
 * 新しい進捗の作成
 * POST /api/user/progress
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateProgressRequest;
    
    if (!body.userId || !body.contentId) {
      return NextResponse.json({ 
        error: 'ユーザーIDとコンテンツIDが必要です'
      }, { status: 400 });
    }
    
    const progress = await progressStore.createProgress(body);
    
    return NextResponse.json(progress, { status: 201 });
  } catch (error) {
    console.error('進捗作成エラー:', error);
    return NextResponse.json({ 
      error: '進捗情報の作成に失敗しました'
    }, { status: 500 });
  }
}

/**
 * 進捗の更新
 * PUT /api/user/progress?id=xxx
 */
export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        error: '進捗IDが必要です'
      }, { status: 400 });
    }
    
    const body = await request.json() as UpdateProgressRequest;
    const updatedProgress = await progressStore.updateProgress(id, body);
    
    if (!updatedProgress) {
      return NextResponse.json({ 
        error: '指定された進捗が見つかりません'
      }, { status: 404 });
    }
    
    return NextResponse.json(updatedProgress, { status: 200 });
  } catch (error) {
    console.error('進捗更新エラー:', error);
    return NextResponse.json({ 
      error: '進捗情報の更新に失敗しました'
    }, { status: 500 });
  }
}