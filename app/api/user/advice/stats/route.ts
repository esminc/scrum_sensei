// filepath: /Users/y-matsushima/work/mastra/frontend/app/api/user/advice/stats/route.ts
import { NextResponse } from 'next/server';
import { generateAdviceStats } from '../../../../../lib/clientAdviceGenerator';

/**
 * ユーザーのAIアドバイス統計を取得するAPI
 * クライアントサイドで生成したモックデータを返す
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default-user';
    
    // クライアントサイドで統計データを生成
    const stats = generateAdviceStats(userId);
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error generating advice stats:', error);
    return NextResponse.json(
      { error: 'アドバイス統計の生成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
