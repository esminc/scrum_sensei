import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/dbUtils';
import { join } from 'path';
import { readdir } from 'fs/promises';

// アクティビティの型を定義
type Activity = {
  id: string;
  action: string;
  date: string;
  type: string;
};

// コンテンツの型定義
type Content = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
  description?: string;
  type?: string;
  status?: string;
  url?: string | { url?: string; content?: string };
  published?: boolean;
};

/**
 * 管理者ダッシュボード情報を取得するAPIエンドポイント
 * 総コンテンツ数、PDFの数、クイズの数、最近のアクティビティを取得
 */
export async function GET() {
  try {
    const db = await getDb();
    
    // クイズの数と最新のクイズ情報を取得
    const quizzes = await db.all(`
      SELECT id, title, created_at
      FROM quizzes
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    const totalQuizzes = await db.get('SELECT COUNT(*) as count FROM quizzes');
    
    // コンテンツ数を取得（データベースまたはJSONファイルから）
    let contents: Content[] = [];
    try {
      // データファイルからコンテンツを読み込む（admin/content/route.tsと同様の方法で）
      const DATA_FILE_PATH = join(process.cwd(), 'data', 'contents.json');
      const { readFile } = await import('fs/promises');
      const data = await readFile(DATA_FILE_PATH, 'utf8');
      contents = JSON.parse(data);
    } catch (error) {
      console.error('コンテンツ読み込みエラー:', error);
      // エラー時は空配列のまま
    }
    
    // PDFファイルの数を取得
    let pdfCount = 0;
    try {
      const uploadsDir = join(process.cwd(), 'public', 'uploads');
      const files = await readdir(uploadsDir);
      pdfCount = files.filter(file => file.toLowerCase().endsWith('.pdf')).length;
    } catch (error) {
      console.error('PDFファイル数取得エラー:', error);
    }
    
    // 最近のアクティビティを収集
    const recentActivities: Activity[] = [];
    
    // クイズ作成アクティビティ
    quizzes.forEach(quiz => {
      recentActivities.push({
        id: `quiz-${quiz.id}`,
        action: `クイズ「${quiz.title}」が生成されました`,
        date: new Date(quiz.created_at).toISOString().split('T')[0],
        type: 'generate'
      });
    });
    
    // コンテンツアクティビティ
    contents.slice(0, 5).forEach((content: Content) => {
      const activityType = content.publishedAt ? 'edit' : 'add';
      recentActivities.push({
        id: `content-${content.id}`,
        action: content.publishedAt 
          ? `教材「${content.title}」が編集されました`
          : `教材「${content.title}」が追加されました`,
        date: (content.updatedAt || content.createdAt).split('T')[0],
        type: activityType
      });
    });
    
    // 日付順に並べ替え
    recentActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return NextResponse.json({
      success: true,
      stats: {
        totalContents: contents.length,
        totalPdfs: pdfCount,
        totalQuizzes: totalQuizzes?.count || 0,
        recentActivities: recentActivities.slice(0, 10) // 最大10件まで
      }
    });
  } catch (error) {
    console.error('ダッシュボード情報取得エラー:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'ダッシュボード情報の取得中にエラーが発生しました', 
        error: String(error) 
      },
      { status: 500 }
    );
  }
}