/**
 * データベースの初期設定用ユーティリティ
 */
import { getDb } from '@/lib/dbUtils';

/**
 * コンテンツ用のテーブルを初期化する
 */
export async function initContentTables(): Promise<void> {
  const db = await getDb();
  
  // コンテンツテーブル
  await db.exec(`
    CREATE TABLE IF NOT EXISTS contents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      tags TEXT,
      difficulty TEXT,
      estimated_time INTEGER,
      source_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      published_at TEXT
    )
  `);
  
  // コンテンツセクションテーブル
  await db.exec(`
    CREATE TABLE IF NOT EXISTS content_sections (
      id TEXT PRIMARY KEY,
      content_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      \`order\` INTEGER NOT NULL,
      audio_url TEXT,
      source_text TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
    )
  `);
  
  // ユーザープログレステーブル
  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      content_id TEXT NOT NULL,
      status TEXT NOT NULL,
      completion_percentage INTEGER NOT NULL,
      time_spent INTEGER NOT NULL,
      last_accessed TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(user_id, content_id)
    )
  `);

  // セクションプログレステーブル
  await db.exec(`
    CREATE TABLE IF NOT EXISTS section_progress (
      id TEXT PRIMARY KEY,
      progress_id TEXT NOT NULL,
      section_id TEXT NOT NULL,
      completed INTEGER NOT NULL,
      time_spent INTEGER NOT NULL,
      last_accessed TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (progress_id) REFERENCES user_progress (id) ON DELETE CASCADE
    )
  `);

  // クイズ結果テーブル
  await db.exec(`
    CREATE TABLE IF NOT EXISTS quiz_results (
      id TEXT PRIMARY KEY,
      progress_id TEXT NOT NULL,
      quiz_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      correct_answers INTEGER NOT NULL,
      completed_at TEXT NOT NULL,
      time_spent INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (progress_id) REFERENCES user_progress (id) ON DELETE CASCADE
    )
  `);

  // 解答詳細テーブル
  await db.exec(`
    CREATE TABLE IF NOT EXISTS answer_details (
      id TEXT PRIMARY KEY,
      quiz_result_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      user_answer TEXT NOT NULL,
      is_correct INTEGER NOT NULL,
      time_spent INTEGER,
      created_at TEXT NOT NULL,
      FOREIGN KEY (quiz_result_id) REFERENCES quiz_results (id) ON DELETE CASCADE
    )
  `);
  
  console.log('コンテンツ関連のテーブル初期化が完了しました');
}