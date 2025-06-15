import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import Database from 'better-sqlite3';

// 型定義
interface AudioMaterial {
  id: number;
  title: string;
  audio_path?: string;
}

// データベース接続
function getDatabase() {
  const dbPath = process.env.DATABASE_PATH || './memory.db';
  return new Database(dbPath);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: '無効なIDです' }, { status: 400 });
    }

    const db = getDatabase();
    
    try {
      // 音声教材の情報を取得
      const material = db.prepare(`
        SELECT id, title, audio_path 
        FROM audio_materials 
        WHERE id = ?
      `).get(id) as AudioMaterial | undefined;
      
      if (!material) {
        return NextResponse.json({ error: '音声教材が見つかりません' }, { status: 404 });
      }
      
      // 音声ファイルを削除
      if (material.audio_path) {
        try {
          const audioFilePath = path.join(process.cwd(), 'frontend/public/uploads', material.audio_path);
          await fs.unlink(audioFilePath);
        } catch (fileError) {
          console.warn('音声ファイルの削除に失敗しました:', fileError);
          // ファイルが既に存在しない場合は続行
        }
      }
      
      // データベースから削除
      const result = db.prepare(`
        DELETE FROM audio_materials 
        WHERE id = ?
      `).run(id);
      
      if (result.changes === 0) {
        return NextResponse.json({ error: '音声教材の削除に失敗しました' }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: '音声教材が削除されました',
        deletedId: id,
        deletedTitle: material.title
      });
      
    } finally {
      db.close();
    }
    
  } catch (error) {
    console.error('音声教材削除エラー:', error);
    return NextResponse.json(
      { error: '音声教材の削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
}