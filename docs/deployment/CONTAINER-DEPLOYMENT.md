# コンテナ環境デプロイガイド

このドキュメントでは、ローカルもしくはセルフホスト型のコンテナランタイム（例: Docker Swarm、ECS on EC2、Kubernetesクラスタなど）へデプロイするための共通手順を整理します。AWS Fargate 版の手順は `legacy-aws/DEPLOYMENT.md` を参照してください。

## 前提条件

- コンテナレジストリが利用可能（Docker Hub / GHCR / プライベートレジストリなど）
- `.env.production` やシークレットがデプロイ先に渡せる状態
- Docker 24+ / Compose Plugin 2.23+（ローカル検証用）

## ビルド & プッシュ

```bash
# イメージのビルド
REGISTRY_HOST=registry.example.com
IMAGE_NAME=ecommerce-app
TAG=$(git rev-parse --short HEAD)

docker build -t $REGISTRY_HOST/$IMAGE_NAME:$TAG .
docker push $REGISTRY_HOST/$IMAGE_NAME:$TAG
```

## デプロイ例: Docker Compose (Production profile)

```bash
# 例: docker-compose.production.yml を使用
ssh deploy@your-server
cd /opt/ecommerce

docker compose -f docker-compose.production.yml pull
docker compose -f docker-compose.production.yml up -d
```

## デプロイ後の確認

1. アプリケーションログ: `docker compose logs app`
2. ヘルスチェック: `curl https://app.example.com/health`
3. 監視/アラート: 監視ツールにエラーがないか確認

## 次のアクション

- IaC（Terraform, Pulumi など）でコンテナ基盤をコード化
- ローリングアップデートやヘルスチェックの自動化を導入
- パブリッククラウドへ移行する場合は `legacy-aws/DEPLOYMENT.md` の差分を参照
