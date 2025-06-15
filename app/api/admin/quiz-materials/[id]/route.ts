import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';

// 型定義
interface Quiz {
  id: string;
  title: string;
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
    const id = params.id; // UUIDなので文字列のまま
    
    const db = getDatabase();
    
    try {
      // クイズの情報を取得
      const quiz = db.prepare(`
        SELECT id, title 
        FROM quizzes 
        WHERE id = ?
      `).get(id) as Quiz | undefined;
      
      if (!quiz) {
        return NextResponse.json({ error: 'クイズが見つかりません' }, { status: 404 });
      }
      
      // 関連する選択肢と質問を削除（外部キー制約によって自動削除されるはず）
      const deleteQuiz = db.prepare(`
        DELETE FROM quizzes 
        WHERE id = ?
      `);
      
      const result = deleteQuiz.run(id);
      
      if (result.changes === 0) {
        return NextResponse.json({ error: 'クイズの削除に失敗しました' }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'クイズが削除されました',
        deletedId: id,
        deletedTitle: quiz.title
      });
      
    } finally {
      db.close();
    }
    
  } catch (error) {
    console.error('クイズ教材削除エラー:', error);
    return NextResponse.json(
      { error: 'クイズ教材の削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
}