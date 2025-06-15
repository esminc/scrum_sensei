import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/dbUtils';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { handleApiError } from '@/lib/apiUtils';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!id) {
    return NextResponse.json({ error: 'IDが不正です' }, { status: 400 });
  }

  try {
    const db = await getDb();
    
    // ファイルパス取得
    const row = await db.get('SELECT file_path FROM materials WHERE id = ?', id);
    if (row && row.file_path) {
      const filePath = join(process.cwd(), 'public', row.file_path.replace(/^\//, ''));
      try {
        await unlink(filePath);
      } catch (fileError) {
        // ファイル削除失敗のログ記録（ただしDBの削除処理は続行）
        console.warn(`ファイル削除に失敗しましたが処理を継続します: ${filePath}`, fileError);
      }
    }
    
    // DBから削除
    await db.run('DELETE FROM materials WHERE id = ?', id);
    await db.run('DELETE FROM questions WHERE material_id = ?', id);
    
    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e, '教材の削除に失敗しました');
  }
}
