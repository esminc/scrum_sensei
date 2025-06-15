import Database from 'better-sqlite3';

export default Database;
import path from 'path';

// データベースファイルのパス
const dbPath = path.join(process.cwd(), 'memory.db');

// データベース接続を作成
let db: Database.Database | null = null;

export function getDatabase() {
  if (!db) {
    db = new Database(dbPath);
    
    // WALモードを有効にする（パフォーマンス向上）
    db.pragma('journal_mode = WAL');
    
    // 外部キー制約を有効にする
    db.pragma('foreign_keys = ON');
    
    // 初期化処理があれば実行
    initializeTables();
  }
  
  return db;
}

function initializeTables() {
  if (!db) return;
  
  // Adviceテーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS advice (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      metadata TEXT
    )
  `);
  
  // Quiz関連テーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      topic TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      metadata TEXT
    )
  `);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS quiz_questions (
      id TEXT PRIMARY KEY,
      quizId TEXT NOT NULL,
      type TEXT NOT NULL,
      question TEXT NOT NULL,
      options TEXT,
      correctAnswer TEXT NOT NULL,
      explanation TEXT,
      FOREIGN KEY (quizId) REFERENCES quizzes (id)
    )
  `);
  
  // Materials関連テーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT,
      filePath TEXT,
      createdAt TEXT NOT NULL,
      metadata TEXT
    )
  `);
  
  // Progress関連テーブル
  db.exec(`
    CREATE TABLE IF NOT EXISTS progress (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      topic TEXT NOT NULL,
      completionLevel INTEGER NOT NULL,
      notes TEXT,
      createdAt TEXT NOT NULL
    )
  `);
}

// データベース接続を閉じる
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

// プロセス終了時にデータベースを閉じる
process.on('exit', closeDatabase);
process.on('SIGINT', closeDatabase);
process.on('SIGTERM', closeDatabase);