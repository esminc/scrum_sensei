import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/dbUtils';
import { handleApiError } from '@/lib/apiUtils';

/**
 * 教材の公開ステータスを変更するAPI
 * PATCH /api/admin/materials/publish/[id]
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!id) {
      return NextResponse.json({ error: 'IDが不正です' }, { status: 400 });
    }

    const db = await getDb();
    
    // 教材の存在確認
    const material = await db.get('SELECT * FROM materials WHERE id = ?', [id]);
    
    if (!material) {
      return NextResponse.json({ error: '指定された教材は存在しません' }, { status: 404 });
    }
    
    const { status } = await req.json();
    
    if (!status || (status !== 'published' && status !== 'draft')) {
      return NextResponse.json({ 
        error: 'ステータスは"published"または"draft"のいずれかを指定してください' 
      }, { status: 400 });
    }
    
    // 現在と同じステータスの場合は何もしない
    if (material.status === status) {
      return NextResponse.json({
        success: true,
        material,
        message: `教材は既に${status === 'published' ? '公開' : '下書き'}状態です`
      });
    }
    
    // 公開日時の更新
    const publishedAt = status === 'published' ? "datetime('now')" : "null";
    
    // ステータスを更新
    await db.run(`
      UPDATE materials
      SET status = ?, 
          updated_at = datetime('now'),
          published_at = ${publishedAt}
      WHERE id = ?
    `, [status, id]);
    
    // 更新後の教材情報を取得
    const updatedMaterial = await db.get('SELECT * FROM materials WHERE id = ?', [id]);
    
    return NextResponse.json({
      success: true,
      material: updatedMaterial,
      message: status === 'published' ? '教材を公開しました' : '教材を下書き状態に変更しました'
    });
  } catch (e) {
    return handleApiError(e, '教材の公開ステータス変更に失敗しました');
  }
}
