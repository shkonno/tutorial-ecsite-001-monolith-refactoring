#!/bin/bash

# Docker環境データリストアスクリプト
# 使い方: ./scripts/restore.sh <backup-name>

set -e

# 色付きログ用の定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  ECサイト Docker環境 データリストア${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# スクリプトのディレクトリを取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# プロジェクトルートに移動
cd "$PROJECT_ROOT"

# バックアップ名の確認
if [ -z "$1" ]; then
    echo -e "${RED}❌ エラー: バックアップ名を指定してください${NC}"
    echo ""
    echo -e "${BLUE}利用可能なバックアップ:${NC}"
    if [ -d "$PROJECT_ROOT/backups" ]; then
        ls -1 "$PROJECT_ROOT/backups"
    else
        echo "  (バックアップが見つかりません)"
    fi
    echo ""
    echo -e "${BLUE}使い方:${NC}"
    echo "  ./scripts/restore.sh <backup-name>"
    exit 1
fi

BACKUP_NAME="$1"
BACKUP_DIR="$PROJECT_ROOT/backups/$BACKUP_NAME"

# バックアップの存在確認
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}❌ エラー: バックアップが見つかりません: $BACKUP_DIR${NC}"
    exit 1
fi

# バックアップ情報の表示
if [ -f "$BACKUP_DIR/info.txt" ]; then
    echo -e "${BLUE}バックアップ情報:${NC}"
    cat "$BACKUP_DIR/info.txt"
    echo ""
fi

# 確認プロンプト
echo -e "${RED}⚠️  警告: 現在のデータが上書きされます！${NC}"
read -p "本当に続行しますか？ (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${GREEN}キャンセルしました${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}[1/3] PostgreSQLデータベースのリストア中...${NC}"
if [ -f "$BACKUP_DIR/database.sql" ]; then
    # データベースを一度削除して再作成
    docker-compose exec -T db psql -U postgres -c "DROP DATABASE IF EXISTS ecommerce;" || true
    docker-compose exec -T db psql -U postgres -c "CREATE DATABASE ecommerce;"
    
    # バックアップをリストア
    cat "$BACKUP_DIR/database.sql" | docker-compose exec -T db psql -U postgres ecommerce
    echo -e "${GREEN}✅ データベースリストア完了${NC}"
else
    echo -e "${YELLOW}⚠️  database.sql が見つかりません。スキップします。${NC}"
fi
echo ""

echo -e "${YELLOW}[2/3] Redisデータのリストア中...${NC}"
if [ -f "$BACKUP_DIR/redis.rdb" ]; then
    # Redisを一時停止
    docker-compose stop redis
    
    # バックアップをリストア
    docker cp "$BACKUP_DIR/redis.rdb" ecommerce-redis:/data/dump.rdb
    
    # Redisを再起動
    docker-compose start redis
    sleep 3
    echo -e "${GREEN}✅ Redisリストア完了${NC}"
else
    echo -e "${YELLOW}⚠️  redis.rdb が見つかりません。スキップします。${NC}"
fi
echo ""

echo -e "${YELLOW}[3/3] アプリケーションコンテナを再起動中...${NC}"
docker-compose restart app
echo -e "${GREEN}✅ 再起動完了${NC}"
echo ""

echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}✅ リストアが完了しました！${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "${BLUE}🌐 アクセス情報:${NC}"
echo "  - Next.js App: http://localhost:3000"
echo ""

