#!/bin/bash

# Docker環境一括停止スクリプト
# 使い方: ./scripts/stop.sh [--clean]
#   --clean, -c: ボリュームも削除（データが消えます）

set -e

# 色付きログ用の定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  ECサイト Docker環境 停止スクリプト${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# スクリプトのディレクトリを取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# プロジェクトルートに移動
cd "$PROJECT_ROOT"

# 起動中のコンテナを確認
echo -e "${YELLOW}起動中のコンテナを確認中...${NC}"
RUNNING_CONTAINERS=$(docker-compose ps -q)

if [ -z "$RUNNING_CONTAINERS" ]; then
    echo -e "${GREEN}✅ 停止するコンテナはありません${NC}"
    exit 0
fi

echo -e "${BLUE}停止するコンテナ:${NC}"
docker-compose ps
echo ""

# オプション解析
CLEAN_FLAG=""
if [ "$1" = "--clean" ] || [ "$1" = "-c" ]; then
    echo -e "${RED}⚠️  警告: ボリュームも削除します（データが消えます）${NC}"
    read -p "本当に続行しますか？ (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        echo -e "${GREEN}キャンセルしました${NC}"
        exit 0
    fi
    CLEAN_FLAG="-v"
fi

# コンテナを停止
echo -e "${YELLOW}コンテナを停止中...${NC}"
docker-compose down $CLEAN_FLAG

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}✅ Docker環境の停止が完了しました！${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

if [ -n "$CLEAN_FLAG" ]; then
    echo -e "${RED}🗑️  ボリュームが削除されました（データは消去されています）${NC}"
    echo ""
fi

echo -e "${BLUE}💡 次のコマンド:${NC}"
echo "  - 再起動:           ./scripts/start.sh"
echo "  - データリセット:   ./scripts/reset.sh --seed"
echo "  - データバックアップ: ./scripts/backup.sh"
echo ""

