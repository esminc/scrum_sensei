/**
 * SQLiteデータベースへのアクセスを管理するユーティリティ
 */
import path from 'path';
import { Database, open as sqliteOpen } from 'sqlite';

// データベース接続
let db: Database | undefined = undefined;

/**
 * DBへの接続を初期化する
 */
export async function initDb(): Promise<Database> {
  // クライアントサイドでは実行しない
  if (typeof window !== 'undefined') {
    throw new Error('データベース操作はサーバーサイドでのみサポートされています');
  }

  if (db) return db;
  
  // サーバーサイドの場合のみモジュールをロード
  const sqlite3 = await import('sqlite3');
  
  // プロジェクトルートからの相対パスでDBファイルを指定
  const dbPath = path.resolve(process.cwd(), 'memory.db');
  
  db = await sqliteOpen({
    filename: dbPath,
    driver: sqlite3.default.Database
  });
  
  console.log('SQLiteデータベースに接続しました:', dbPath);
  
  // 必要なテーブルを作成
  await createTables();
  
  return db;
}

/**
 * 必要なテーブルを初期化する
 */
async function createTables(): Promise<void> {
  if (!db) throw new Error('データベースが初期化されていません');
  
  // 教材テーブル
  await db.exec(`
    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      content TEXT,
      type TEXT NOT NULL DEFAULT 'text',
      status TEXT DEFAULT 'draft',
      file_path TEXT,
      published_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  
  // コンテンツテーブル
  await db.exec(`
    CREATE TABLE IF NOT EXISTS contents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      content TEXT,
      type TEXT NOT NULL,
      file_path TEXT,
      sections TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  
  // ユーザー進捗テーブル
  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      content_id TEXT NOT NULL,
      completion_percentage INTEGER DEFAULT 0,
      last_accessed TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  
  // アドバイステーブル
  await db.exec(`
    CREATE TABLE IF NOT EXISTS advice (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      sources TEXT,
      created_at TEXT NOT NULL
    )
  `);
  
  // 質問テーブル（統一されたシステム）
  await db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      material_id INTEGER,
      question TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'multiple-choice',
      correct_answer TEXT,
      options TEXT,
      explanation TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (material_id) REFERENCES materials(id)
    )
  `);
  
  // 教材セクションテーブル
  await db.exec(`
    CREATE TABLE IF NOT EXISTS material_sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      material_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      audio_url TEXT,
      position INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (material_id) REFERENCES materials(id)
    )
  `);
}

/**
 * データベースインスタンスを取得する
 */
export async function getDb(): Promise<Database> {
  // クライアントサイドでは実行しない
  if (typeof window !== 'undefined') {
    throw new Error('データベース操作はサーバーサイドでのみサポートされています');
  }
  
  if (!db) {
    db = await initDb();
  }
  return db;
}

/**
 * タグ文字列を配列に変換
 */
export function parseTags(tagsString?: string): string[] {
  if (!tagsString) return [];
  return tagsString.split(',').map(tag => tag.trim()).filter(Boolean);
}

/**
 * タグ配列を文字列に変換
 */
export function stringifyTags(tags?: string[]): string | null {
  if (!tags || !Array.isArray(tags) || tags.length === 0) return null;
  return tags.join(',');
}