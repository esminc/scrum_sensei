#!/usr/bin/env node

/**
 * Scrum Sensei データベース状態確認スクリプト
 * データベースの構造とデータを確認します
 */

const path = require('path');
const fs = require('fs');

// プロジェクトルートを設定
const projectRoot = path.join(__dirname, '..');
const dbPath = path.join(projectRoot, 'memory.db');

console.log('🔍 Scrum Sensei データベース状態確認');
console.log('====================================');

async function checkDatabase() {
  try {
    // データベースファイルの存在確認
    if (!fs.existsSync(dbPath)) {
      console.log('❌ データベースファイルが見つかりません:', dbPath);
      console.log('');
      console.log('🔧 データベースを初期化するには:');
      console.log('   npm run init-db');
      console.log('   または');
      console.log('   node scripts/init-db.js');
      return;
    }

    console.log('✅ データベースファイルが見つかりました');
    console.log(`📍 パス: ${dbPath}`);
    
    // ファイル情報
    const stats = fs.statSync(dbPath);
    console.log(`📊 サイズ: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`📅 更新日時: ${stats.mtime.toLocaleString()}`);
    console.log('');

    // Better SQLite3を使用してデータベースに接続
    const Database = require('better-sqlite3');
    const db = new Database(dbPath, { readonly: true });

    console.log('📋 テーブル一覧:');
    console.log('================');

    // テーブル一覧を取得
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all();

    for (const table of tables) {
      const tableName = table.name;
      
      // レコード数を取得
      const countResult = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get();
      const recordCount = countResult.count;
      
      // テーブル構造を取得
      const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
      const columnNames = columns.map(col => `${col.name}(${col.type})`).join(', ');
      
      console.log(`📊 ${tableName}:`);
      console.log(`   レコード数: ${recordCount}`);
      console.log(`   カラム: ${columnNames}`);
      console.log('');
    }

    // 主要テーブルのサンプルデータを表示
    console.log('📝 サンプルデータ:');
    console.log('=================');

    // materialsテーブル
    if (tables.some(t => t.name === 'materials')) {
      console.log('📚 Materials (最新5件):');
      const materials = db.prepare(`
        SELECT id, title, type, status, created_at 
        FROM materials 
        ORDER BY created_at DESC 
        LIMIT 5
      `).all();
      
      if (materials.length > 0) {
        materials.forEach(material => {
          console.log(`   ${material.id}: ${material.title} (${material.type}, ${material.status})`);
        });
      } else {
        console.log('   データがありません');
      }
      console.log('');
    }

    // contentsテーブル
    if (tables.some(t => t.name === 'contents')) {
      console.log('📄 Contents (最新5件):');
      const contents = db.prepare(`
        SELECT id, title, type, status, created_at 
        FROM contents 
        ORDER BY created_at DESC 
        LIMIT 5
      `).all();
      
      if (contents.length > 0) {
        contents.forEach(content => {
          console.log(`   ${content.id}: ${content.title} (${content.type})`);
        });
      } else {
        console.log('   データがありません');
      }
      console.log('');
    }

    // user_progressテーブル
    if (tables.some(t => t.name === 'user_progress')) {
      console.log('📈 User Progress (最新5件):');
      const progress = db.prepare(`
        SELECT user_id, content_id, completion_percentage, last_accessed
        FROM user_progress 
        ORDER BY updated_at DESC 
        LIMIT 5
      `).all();
      
      if (progress.length > 0) {
        progress.forEach(p => {
          console.log(`   ${p.user_id} -> ${p.content_id}: ${p.completion_percentage}%`);
        });
      } else {
        console.log('   データがありません');
      }
      console.log('');
    }

    // adviceテーブル
    if (tables.some(t => t.name === 'advice')) {
      console.log('💡 Advice (最新5件):');
      const advice = db.prepare(`
        SELECT user_id, type, created_at, substr(content, 1, 50) as content_preview
        FROM advice 
        ORDER BY created_at DESC 
        LIMIT 5
      `).all();
      
      if (advice.length > 0) {
        advice.forEach(a => {
          console.log(`   ${a.user_id} (${a.type}): ${a.content_preview}...`);
        });
      } else {
        console.log('   データがありません');
      }
      console.log('');
    }

    // データベース接続を閉じる
    db.close();

    console.log('🎉 データベース確認完了!');
    console.log('');
    console.log('🔧 利用可能なコマンド:');
    console.log('   npm run backup-db    # データベースバックアップ');
    console.log('   npm run reset-db     # データベースリセット');
    console.log('   ./local-test.sh      # APIテスト');
    
  } catch (error) {
    console.error('❌ データベース確認エラー:', error);
    console.log('');
    console.log('🔧 問題解決方法:');
    console.log('   1. データベースを初期化: npm run init-db');
    console.log('   2. 必要なパッケージをインストール: npm install');
    console.log('   3. エラーが続く場合はデータベースをリセット: npm run reset-db');
  }
}

// メイン処理実行
checkDatabase();