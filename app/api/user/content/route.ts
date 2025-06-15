// filepath: /Users/y-matsushima/work/mastra/next-app/app/api/user/content/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { contentStore } from '@/lib/storage';
import { Content } from '@/lib/models/content';
import { Quiz } from '@/lib/models/quiz';

interface ContentWithQuizzes extends Content {
  quizzes?: Quiz[];
}

/**
 * ユーザー向けコンテンツ一覧取得
 * GET /api/user/content
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const includeQuizzes = searchParams.get('includeQuizzes') === 'true';
    
    // 公開済みコンテンツのみを取得
    const allContents = await contentStore.getContentsByStatus('published');
    
    // タイプでフィルタリング（オプション）
    let contents: Content[] = allContents;
    if (type) {
      contents = allContents.filter(content => content.type === type);
    }

    // クイズ情報も含める場合
    let contentsWithQuizzes: ContentWithQuizzes[] = contents;
    
    if (includeQuizzes) {
      // 各コンテンツに関連するクイズを追加
      contentsWithQuizzes = await Promise.all(contents.map(async (content) => {
        const quizzes = await contentStore.getQuizzesByContentId(content.id);
        return {
          ...content,
          quizzes: quizzes.length > 0 ? quizzes : undefined
        };
      }));
    }
    
    return NextResponse.json({ 
      contents: contentsWithQuizzes,
      count: contentsWithQuizzes.length
    }, { status: 200 });
  } catch (error) {
    console.error('コンテンツ取得エラー:', error);
    return NextResponse.json({ 
      error: 'コンテンツの取得に失敗しました'
    }, { status: 500 });
  }
}