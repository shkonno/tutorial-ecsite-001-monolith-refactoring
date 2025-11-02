#!/bin/bash

# Docker環境データリセットスクリプト
# 使い方: ./scripts/reset.sh [--seed]

set -e

# 色付きログ用の定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  ECサイト Docker環境 データリセット${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# スクリプトのディレクトリを取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# プロジェクトルートに移動
cd "$PROJECT_ROOT"

# 確認プロンプト
echo -e "${RED}⚠️  警告: この操作により全てのデータが削除されます！${NC}"
echo -e "${YELLOW}以下のデータが削除されます:${NC}"
echo "  - PostgreSQLのデータベース"
echo "  - Redisのキャッシュ"
echo "  - Grafanaの設定"
echo "  - Prometheusのメトリクス"
echo ""
read -p "本当に続行しますか？ (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${GREEN}キャンセルしました${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}[1/4] コンテナを停止中...${NC}"
docker-compose down

echo ""
echo -e "${YELLOW}[2/4] ボリュームを削除中...${NC}"
docker-compose down -v
echo -e "${GREEN}✅ ボリューム削除完了${NC}"

echo ""
echo -e "${YELLOW}[3/4] コンテナを再起動中...${NC}"
docker-compose up -d

echo ""
echo -e "${YELLOW}[4/4] サービスの準備待機中...${NC}"
sleep 10

# データベースのヘルスチェック
MAX_WAIT=30
ELAPSED=0
INTERVAL=5

while [ $ELAPSED -lt $MAX_WAIT ]; do
    DB_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' ecommerce-db 2>/dev/null || echo "starting")
    
    if [ "$DB_HEALTH" = "healthy" ]; then
        echo -e "${GREEN}✅ データベース準備完了${NC}"
        break
    fi
    
    echo "  データベース: $DB_HEALTH"
    sleep $INTERVAL
    ELAPSED=$((ELAPSED + INTERVAL))
done

# シードデータ投入オプション
if [ "$1" = "--seed" ] || [ "$1" = "-s" ]; then
    echo ""
    echo -e "${YELLOW}シードデータを投入中...${NC}"
    docker-compose exec -T app npx prisma migrate deploy
    docker-compose exec -T app npx prisma db seed
    echo -e "${GREEN}✅ シードデータ投入完了${NC}"
fi

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}✅ データリセットが完了しました！${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "${BLUE}📊 起動中のコンテナ:${NC}"
docker-compose ps
echo ""
echo -e "${BLUE}💡 次のコマンド:${NC}"
echo "  - シードデータ投入:  docker-compose exec app npx prisma db seed"
echo "  - マイグレーション:  docker-compose exec app npx prisma migrate deploy"
echo "  - アプリアクセス:    http://localhost:3000"
echo ""

