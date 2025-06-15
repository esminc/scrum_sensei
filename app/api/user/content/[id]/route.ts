import { NextRequest, NextResponse } from 'next/server';
import { contentStore } from '@/lib/storage';
// Content型は使用されていないのでインポートを削除

// GET: 公開済みコンテンツの詳細を取得 /api/user/content/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: 'コンテンツIDが指定されていません' },
        { status: 400 }
      );
    }
    const content = await contentStore.getContentById(id);
    if (!content || content.status !== 'published') {
      return NextResponse.json(
        { error: '公開済みの教材が見つかりませんでした' },
        { status: 404 }
      );
    }
    return NextResponse.json({ content }, { status: 200 });
  } catch (error) {
    console.error('教材詳細取得エラー:', error);
    return NextResponse.json(
      { error: '教材の取得に失敗しました' },
      { status: 500 }
    );
  }
}
