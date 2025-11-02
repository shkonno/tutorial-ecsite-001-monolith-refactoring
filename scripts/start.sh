#!/bin/bash

# Docker環境一括起動スクリプト
# 使い方: ./scripts/start.sh

set -e

# 色付きログ用の定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  ECサイト Docker環境 起動スクリプト${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# スクリプトのディレクトリを取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# プロジェクトルートに移動
cd "$PROJECT_ROOT"

# Dockerが起動しているか確認
echo -e "${YELLOW}[1/4] Docker起動確認...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Dockerが起動していません。Docker Desktopを起動してください。${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker起動確認完了${NC}"
echo ""

# 既存のコンテナを停止・削除
echo -e "${YELLOW}[2/4] 既存コンテナのクリーンアップ...${NC}"
docker-compose down --remove-orphans
echo -e "${GREEN}✅ クリーンアップ完了${NC}"
echo ""

# コンテナをビルド・起動
echo -e "${YELLOW}[3/4] Dockerコンテナ起動中...${NC}"
echo -e "${BLUE}起動するサービス:${NC}"
echo "  - PostgreSQL (Port: 5432)"
echo "  - Redis (Port: 6379)"
echo "  - LocalStack (Port: 4566)"
echo "  - Next.js App (Port: 3000)"
echo ""

# オプション解析
BUILD_FLAG=""
if [ "$1" = "--build" ] || [ "$1" = "-b" ]; then
    BUILD_FLAG="--build"
    echo -e "${BLUE}ビルドオプションが指定されました。イメージを再ビルドします...${NC}"
fi

# バックグラウンドで起動
docker-compose up -d $BUILD_FLAG

echo -e "${GREEN}✅ コンテナ起動完了${NC}"
echo ""

# ヘルスチェック待ち
echo -e "${YELLOW}[4/4] サービスのヘルスチェック待機中...${NC}"
echo -e "${BLUE}各サービスの準備が整うまで待機します（最大60秒）${NC}"

MAX_WAIT=60
ELAPSED=0
INTERVAL=5

while [ $ELAPSED -lt $MAX_WAIT ]; do
    # 各サービスのヘルスステータスを確認
    DB_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' ecommerce-db 2>/dev/null || echo "starting")
    REDIS_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' ecommerce-redis 2>/dev/null || echo "starting")
    LOCALSTACK_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' ecommerce-localstack 2>/dev/null || echo "starting")
    
    if [ "$DB_HEALTH" = "healthy" ] && [ "$REDIS_HEALTH" = "healthy" ] && [ "$LOCALSTACK_HEALTH" = "healthy" ]; then
        echo -e "${GREEN}✅ 全サービスの準備完了！${NC}"
        break
    fi
    
    echo "  DB: $DB_HEALTH | Redis: $REDIS_HEALTH | LocalStack: $LOCALSTACK_HEALTH"
    sleep $INTERVAL
    ELAPSED=$((ELAPSED + INTERVAL))
done

if [ $ELAPSED -ge $MAX_WAIT ]; then
    echo -e "${YELLOW}⚠️  タイムアウト: 一部のサービスが準備できていない可能性があります${NC}"
    echo -e "${YELLOW}   docker-compose logs で詳細を確認してください${NC}"
fi

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}✅ Docker環境の起動が完了しました！${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "${BLUE}📊 起動中のコンテナ:${NC}"
docker-compose ps
echo ""
echo -e "${BLUE}🌐 アクセス情報:${NC}"
echo "  - Next.js App: http://localhost:3000"
echo "  - PostgreSQL:  localhost:5432"
echo "  - Redis:       localhost:6379"
echo "  - LocalStack:  http://localhost:4566"
echo ""
echo -e "${BLUE}💡 便利なコマンド:${NC}"
echo "  - ログ確認:     docker-compose logs -f"
echo "  - 停止:         ./scripts/stop.sh"
echo "  - 再起動:       docker-compose restart"
echo "  - ビルド起動:   ./scripts/start.sh --build"
echo "  - DB接続:       docker exec -it ecommerce-db psql -U postgres -d ecommerce"
echo "  - Redis接続:    docker exec -it ecommerce-redis redis-cli"
echo ""

