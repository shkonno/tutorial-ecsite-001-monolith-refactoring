#!/bin/bash

# Docker環境データバックアップスクリプト
# 使い方: ./scripts/backup.sh [backup-name]

set -e

# 色付きログ用の定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  ECサイト Docker環境 データバックアップ${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# スクリプトのディレクトリを取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# プロジェクトルートに移動
cd "$PROJECT_ROOT"

# バックアップ名の設定
BACKUP_NAME="${1:-backup-$(date +%Y%m%d-%H%M%S)}"
BACKUP_DIR="$PROJECT_ROOT/backups/$BACKUP_NAME"

# バックアップディレクトリを作成
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}[1/3] PostgreSQLデータベースのバックアップ中...${NC}"
docker-compose exec -T db pg_dump -U postgres ecommerce > "$BACKUP_DIR/database.sql"
echo -e "${GREEN}✅ データベースバックアップ完了: $BACKUP_DIR/database.sql${NC}"
echo ""

echo -e "${YELLOW}[2/3] Redisデータのバックアップ中...${NC}"
docker-compose exec -T redis redis-cli --rdb /data/dump.rdb SAVE > /dev/null 2>&1 || true
docker cp ecommerce-redis:/data/dump.rdb "$BACKUP_DIR/redis.rdb" 2>/dev/null || echo "  Redis dump.rdb not found, skipping..."
echo -e "${GREEN}✅ Redisバックアップ完了${NC}"
echo ""

echo -e "${YELLOW}[3/3] バックアップ情報を保存中...${NC}"
cat > "$BACKUP_DIR/info.txt" << EOF
バックアップ情報
================
作成日時: $(date '+%Y-%m-%d %H:%M:%S')
バックアップ名: $BACKUP_NAME
プロジェクト: tutorial_ec_site_001_monolith

含まれるデータ:
- PostgreSQL データベース (database.sql)
- Redis データ (redis.rdb)

リストア方法:
./scripts/restore.sh $BACKUP_NAME
EOF

echo -e "${GREEN}✅ バックアップ情報保存完了${NC}"
echo ""

echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}✅ バックアップが完了しました！${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "${BLUE}📦 バックアップ保存先:${NC}"
echo "  $BACKUP_DIR"
echo ""
echo -e "${BLUE}📄 バックアップ内容:${NC}"
ls -lh "$BACKUP_DIR"
echo ""
echo -e "${BLUE}💡 リストア方法:${NC}"
echo "  ./scripts/restore.sh $BACKUP_NAME"
echo ""

