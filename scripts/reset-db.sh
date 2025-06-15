#!/bin/bash

# ==============================================
# Scrum Sensei データベースリセットスクリプト
# データベースを完全に初期化します
# ==============================================

echo "🔄 Scrum Sensei データベースリセット"
echo "===================================="

# プロジェクトルートに移動
cd "$(dirname "$0")/.."

DB_FILE="memory.db"
BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# バックアップディレクトリを作成
mkdir -p "$BACKUP_DIR"

# 既存のデータベースが存在する場合、バックアップ
if [ -f "$DB_FILE" ]; then
    echo "📦 既存のデータベースをバックアップ中..."
    cp "$DB_FILE" "$BACKUP_DIR/memory.db.backup.$TIMESTAMP"
    echo "✅ バックアップ完了: $BACKUP_DIR/memory.db.backup.$TIMESTAMP"
    
    # 既存のデータベースファイルを削除
    rm -f "$DB_FILE"
    echo "🗑️  既存のデータベースファイルを削除"
else
    echo "ℹ️  既存のデータベースファイルが見つかりません"
fi

# WALファイルとSHMファイルも削除
if [ -f "${DB_FILE}-wal" ]; then
    rm -f "${DB_FILE}-wal"
    echo "🗑️  WALファイルを削除"
fi

if [ -f "${DB_FILE}-shm" ]; then
    rm -f "${DB_FILE}-shm"
    echo "🗑️  SHMファイルを削除"
fi

# 初期化スクリプトを実行
echo "🔧 データベースを初期化中..."
node scripts/init-db.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 データベースリセット完了！"
    echo ""
    echo "📍 利用可能なコマンド:"
    echo "   npm run dev          # 開発サーバー起動"
    echo "   ./local-test.sh      # ローカルAPIテスト"
    echo "   ./quick-test.sh      # 簡易テスト"
    echo ""
    echo "📊 データベース情報:"
    if [ -f "$DB_FILE" ]; then
        echo "   ファイルサイズ: $(du -h "$DB_FILE" | cut -f1)"
        echo "   作成日時: $(date -r "$DB_FILE")"
    fi
else
    echo "❌ データベース初期化に失敗しました"
    exit 1
fi