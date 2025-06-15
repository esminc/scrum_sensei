import { NextResponse } from 'next/server';
import { getDb } from '@/lib/dbUtils';

/**
 * システムの健全性をチェックするAPI (旧Mastraサーバーチェック)
 * GET /api/mastra/health
 */
export async function GET() {
  try {
    // データベース接続をチェック
    await getDb();
    
    // システムが正常に稼働している場合
    return NextResponse.json({
      success: true,
      status: 'online',
      message: 'システムは正常に稼働しています',
      details: {
        database: 'connected',
        aiSystem: 'integrated'
      }
    });
  } catch (error) {
    console.error('システム健全性チェックエラー:', error);
    
    // エラーメッセージを生成
    let errorMessage = 'システムの健全性チェック中にエラーが発生しました';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({
      success: false,
      status: 'error',
      message: errorMessage,
      details: {
        error: error instanceof Error ? error.toString() : '不明なエラー',
        action: 'システムの状態を確認してください'
      }
    }, { status: 500 });
  }
}