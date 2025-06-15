#!/usr/bin/env node

/**
 * Scrum Sensei データベース初期化スクリプト
 * 既存のデータベースをバックアップして新しいデータベースを作成します
 */

const path = require('path');
const fs = require('fs');

// プロジェクトルートを設定
const projectRoot = path.join(__dirname, '..');
const dbPath = path.join(projectRoot, 'memory.db');
const backupPath = path.join(projectRoot, `memory.db.backup.${Date.now()}`);

console.log('🔄 Scrum Sensei データベース初期化');
console.log('=====================================');

async function initializeDatabase() {
  try {
    // 既存のDBファイルをバックアップ
    if (fs.existsSync(dbPath)) {
      console.log('📦 既存のデータベースをバックアップ中...');
      fs.copyFileSync(dbPath, backupPath);
      console.log(`✅ バックアップ作成: ${backupPath}`);
      
      // 既存のDBファイルを削除
      fs.unlinkSync(dbPath);
      console.log('🗑️  既存のデータベースファイルを削除');
    }

    // Better SQLite3を使用してデータベースを初期化
    const Database = require('better-sqlite3');
    const db = new Database(dbPath);

    console.log('🔧 データベース設定を適用中...');
    
    // WALモードとforeign keysを有効化
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    
    console.log('📋 テーブルを作成中...');

    // ==============================================
    // 教材関連テーブル
    // ==============================================
    
    // materialsテーブル（教材）
    db.exec(`
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

    // questionsテーブル（問題）
    db.exec(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        material_id INTEGER,
        question TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'multiple-choice',
        correct_answer TEXT,
        options TEXT,
        explanation TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE
      )
    `);

    // material_sectionsテーブル（教材セクション）
    db.exec(`
      CREATE TABLE IF NOT EXISTS material_sections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        material_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        audio_url TEXT,
        position INTEGER DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE
      )
    `);

    // ==============================================
    // コンテンツ関連テーブル
    // ==============================================
    
    // contentsテーブル（コンテンツ）
    db.exec(`
      CREATE TABLE IF NOT EXISTS contents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        content TEXT,
        type TEXT NOT NULL,
        file_path TEXT,
        sections TEXT,
        status TEXT DEFAULT 'draft',
        tags TEXT,
        difficulty TEXT,
        estimated_time INTEGER,
        published_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // content_sectionsテーブル（コンテンツセクション）
    db.exec(`
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

    // ==============================================
    // ユーザー進捗関連テーブル
    // ==============================================
    
    // user_progressテーブル（ユーザー進捗）
    db.exec(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        content_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'not_started',
        completion_percentage INTEGER NOT NULL DEFAULT 0,
        time_spent INTEGER NOT NULL DEFAULT 0,
        last_accessed TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(user_id, content_id)
      )
    `);

    // section_progressテーブル（セクション進捗）
    db.exec(`
      CREATE TABLE IF NOT EXISTS section_progress (
        id TEXT PRIMARY KEY,
        progress_id TEXT NOT NULL,
        section_id TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        time_spent INTEGER NOT NULL DEFAULT 0,
        last_accessed TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (progress_id) REFERENCES user_progress (id) ON DELETE CASCADE
      )
    `);

    // ==============================================
    // クイズ関連テーブル
    // ==============================================
    
    // quizzesテーブル（クイズ）
    db.exec(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        topic TEXT NOT NULL,
        difficulty TEXT DEFAULT 'medium',
        question_count INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        metadata TEXT
      )
    `);

    // quiz_questionsテーブル（クイズ問題）
    db.exec(`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id TEXT PRIMARY KEY,
        quiz_id TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'multiple-choice',
        question TEXT NOT NULL,
        options TEXT,
        correct_answer TEXT NOT NULL,
        explanation TEXT,
        difficulty TEXT DEFAULT 'medium',
        created_at TEXT NOT NULL,
        FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE
      )
    `);

    // quiz_resultsテーブル（クイズ結果）
    db.exec(`
      CREATE TABLE IF NOT EXISTS quiz_results (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        quiz_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        correct_answers INTEGER NOT NULL,
        completed_at TEXT NOT NULL,
        time_spent INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      )
    `);

    // answer_detailsテーブル（解答詳細）
    db.exec(`
      CREATE TABLE IF NOT EXISTS answer_details (
        id TEXT PRIMARY KEY,
        quiz_result_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        user_answer TEXT NOT NULL,
        is_correct INTEGER NOT NULL,
        time_spent INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (quiz_result_id) REFERENCES quiz_results (id) ON DELETE CASCADE
      )
    `);

    // ==============================================
    // AIアドバイス関連テーブル
    // ==============================================
    
    // adviceテーブル（AIアドバイス）
    db.exec(`
      CREATE TABLE IF NOT EXISTS advice (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        sources TEXT,
        metadata TEXT,
        created_at TEXT NOT NULL
      )
    `);

    // advice_feedbackテーブル（アドバイスフィードバック）
    db.exec(`
      CREATE TABLE IF NOT EXISTS advice_feedback (
        id TEXT PRIMARY KEY,
        advice_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        rating INTEGER,
        feedback TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (advice_id) REFERENCES advice (id) ON DELETE CASCADE
      )
    `);

    // ==============================================
    // その他のテーブル
    // ==============================================
    
    // progressテーブル（一般的な進捗）
    db.exec(`
      CREATE TABLE IF NOT EXISTS progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        topic TEXT NOT NULL,
        completion_level INTEGER NOT NULL DEFAULT 0,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // ==============================================
    // インデックスの作成
    // ==============================================
    
    console.log('📊 インデックスを作成中...');
    
    // パフォーマンス向上のためのインデックス
    db.exec(`CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_user_progress_content_id ON user_progress(content_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_advice_user_id ON advice(user_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_advice_created_at ON advice(created_at)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_materials_type ON materials(type)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_materials_status ON materials(status)`);

    // ==============================================
    // サンプルデータの挿入
    // ==============================================
    
    console.log('📝 サンプルデータを挿入中...');
    
    // サンプル教材
    const insertMaterial = db.prepare(`
      INSERT OR IGNORE INTO materials (title, description, content, type, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    insertMaterial.run(
      'スクラム基礎',
      'スクラムフレームワークの基本概念を学習します',
      'スクラムは、複雑な製品開発のためのフレームワークです。',
      'text',
      'published'
    );

    insertMaterial.run(
      'スプリント計画',
      'スプリント計画の進め方について学習します',
      'スプリント計画は、スプリントで実施する作業を計画するイベントです。',
      'text',
      'published'
    );

    // サンプルコンテンツ
    const insertContent = db.prepare(`
      INSERT OR IGNORE INTO contents (id, title, description, type, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const now = new Date().toISOString();
    insertContent.run(
      'content-1',
      'スクラム入門',
      'スクラムフレームワークの概要',
      'lesson',
      'published',
      now,
      now
    );

    insertContent.run(
      'content-2',
      'スプリントの進め方',
      'スプリントプロセスの詳細',
      'lesson',
      'published',
      now,
      now
    );

    // データベース接続を閉じる
    db.close();

    console.log('✅ データベース初期化完了');
    console.log(`📍 データベースファイル: ${dbPath}`);
    console.log(`📦 バックアップファイル: ${backupPath}`);
    console.log('');
    console.log('🎉 初期化が正常に完了しました！');
    
  } catch (error) {
    console.error('❌ データベース初期化エラー:', error);
    
    // エラーが発生した場合、バックアップから復元
    if (fs.existsSync(backupPath)) {
      console.log('🔄 バックアップからデータベースを復元中...');
      fs.copyFileSync(backupPath, dbPath);
      console.log('✅ データベースを復元しました');
    }
    
    process.exit(1);
  }
}

// メイン処理実行
initializeDatabase();