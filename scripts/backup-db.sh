#!/bin/bash

# ==============================================
# Scrum Sensei データベースバックアップスクリプト
# データベースの安全なバックアップを作成
# ==============================================

echo "📦 Scrum Sensei データベースバックアップ"
echo "========================================"

# プロジェクトルートに移動
cd "$(dirname "$0")/.."

DB_FILE="memory.db"
BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="memory.db.backup.$TIMESTAMP"

# バックアップディレクトリを作成
mkdir -p "$BACKUP_DIR"

# データベースファイルの存在確認
if [ ! -f "$DB_FILE" ]; then
    echo "❌ データベースファイルが見つかりません: $DB_FILE"
    exit 1
fi

echo "📊 データベース情報:"
echo "   ファイル: $DB_FILE"
echo "   サイズ: $(du -h "$DB_FILE" | cut -f1)"
echo "   更新日時: $(date -r "$DB_FILE")"
echo ""

# メインのデータベースファイルをバックアップ
echo "📦 メインデータベースをバックアップ中..."
cp "$DB_FILE" "$BACKUP_DIR/$BACKUP_NAME"

# WALファイルが存在する場合もバックアップ
if [ -f "${DB_FILE}-wal" ]; then
    echo "📦 WALファイルをバックアップ中..."
    cp "${DB_FILE}-wal" "$BACKUP_DIR/${BACKUP_NAME}-wal"
fi

# SHMファイルが存在する場合もバックアップ
if [ -f "${DB_FILE}-shm" ]; then
    echo "📦 SHMファイルをバックアップ中..."
    cp "${DB_FILE}-shm" "$BACKUP_DIR/${BACKUP_NAME}-shm"
fi

echo "✅ バックアップ完了!"
echo ""
echo "📍 バックアップファイル:"
echo "   メイン: $BACKUP_DIR/$BACKUP_NAME"
if [ -f "$BACKUP_DIR/${BACKUP_NAME}-wal" ]; then
    echo "   WAL: $BACKUP_DIR/${BACKUP_NAME}-wal"
fi
if [ -f "$BACKUP_DIR/${BACKUP_NAME}-shm" ]; then
    echo "   SHM: $BACKUP_DIR/${BACKUP_NAME}-shm"
fi

echo ""
echo "📊 バックアップサイズ:"
echo "   $(du -h "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)"

# 古いバックアップファイルの整理（7日以上前のファイルを削除）
echo ""
echo "🧹 古いバックアップファイルを整理中..."
find "$BACKUP_DIR" -name "memory.db.backup.*" -mtime +7 -delete
echo "✅ 7日以上前のバックアップファイルを削除しました"

echo ""
echo "🎉 バックアップ処理完了!"