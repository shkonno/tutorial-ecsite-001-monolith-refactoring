# 🚀 クイックスタートガイド

## ローカル開発環境のセットアップ

### 前提条件
- Docker & Docker Compose
- Node.js 20+

### 手順

```bash
# 1. ローカル開発用の環境変数を設定
cp app/.env.example app/.env

# 2. Docker Composeで全サービスを起動
docker-compose up -d

# 3. LocalStackが起動するまで待機（初回は少し時間がかかります）
docker logs ecommerce-localstack -f

# LocalStackの初期化が完了したら Ctrl+C で抜ける

# 4. アプリケーションにアクセス
# ブラウザで http://localhost:3000 を開く
```

Hello Worldページが表示されれば成功です！🎉

---

## 📦 ローカルでのDockerビルドテスト

```bash
# Dockerイメージをビルド
docker build -t ecommerce-app:test .

# ビルドが成功したか確認
docker images | grep ecommerce-app
```

---

## 🌩️ AWSへのデプロイ

詳細な手順は [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) を参照してください。

### クイックデプロイ手順

```bash
# 1. Terraform変数を設定
cd terraform
cp terraform.tfvars.example terraform.tfvars
vim terraform.tfvars  # db_passwordを必ず変更！

# 2. AWSインフラを作成（10-15分）
terraform init
terraform apply

# 3. Dockerイメージをビルド＆プッシュ
cd ..
aws ecr get-login-password --region ap-northeast-1 | \
  docker login --username AWS --password-stdin \
  $(aws sts get-caller-identity --query Account --output text).dkr.ecr.ap-northeast-1.amazonaws.com

ECR_REPO=$(cd terraform && terraform output -raw ecr_repository_url)
docker build -t $ECR_REPO:latest .
docker push $ECR_REPO:latest

# 4. ALB URLにアクセス
cd terraform
terraform output alb_url
# ブラウザで表示されたURLを開く
```

---

## 🔄 GitHub Actions自動デプロイの設定

1. GitHubリポジトリの Settings > Secrets and variables > Actions に以下を追加:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

2. mainブランチにpush:
```bash
git add .
git commit -m "Deploy via GitHub Actions"
git push origin main
```

3. GitHub Actionsタブで自動デプロイを確認

---

## 📊 デプロイ後の確認

### ECSサービスの状態確認
```bash
aws ecs describe-services \
  --cluster ecommerce-production-cluster \
  --services ecommerce-production-service \
  --region ap-northeast-1
```

### CloudWatchログの確認
```bash
aws logs tail /ecs/ecommerce-production-app --follow --region ap-northeast-1
```

### ALBヘルスチェックの確認
```bash
ALB_URL=$(cd terraform && terraform output -raw alb_url)
curl $ALB_URL
```

---

## 🧪 LocalStackの確認

```bash
# S3バケットの確認
docker exec ecommerce-localstack awslocal s3 ls

# Secrets Managerの確認
docker exec ecommerce-localstack awslocal secretsmanager list-secrets
```

---

## 📝 次のステップ

Hello Worldのデプロイが完了したら、以下の機能を追加できます：

### Phase 6: 本格的な機能実装

1. **データベース設計** (イシュー #2)
   - Prismaスキーマ定義
   - マイグレーション

2. **認証システム** (イシュー #3)
   - NextAuth.js設定
   - ログイン/登録機能

3. **商品管理** (イシュー #4)
   - 商品一覧・詳細
   - Redisキャッシュ
   - S3画像アップロード

4. **カート機能** (イシュー #5)
   - カート追加・更新・削除
   - Server Actions

5. **注文処理** (イシュー #6)
   - 注文作成
   - トランザクション処理

詳細は [docs/issues-and-todos.md](./docs/issues-and-todos.md) を参照してください。

---

## 💰 コスト見積もり

### ローカル開発環境
- **$0/月** - すべてローカルで実行

### AWS本番環境
- **月額 約$174** (詳細は [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) 参照)

コスト削減オプション:
- 開発環境用の変数ファイルを使用: 月額 $67程度
- 使わない時はECSタスクを停止: 大幅削減可能

---

## 🧹 リソースのクリーンアップ

```bash
cd terraform
terraform destroy
```

**警告**: すべてのAWSリソースが削除されます！

---

## 🛠️ トラブルシューティング

### ローカル開発環境

#### ポート競合エラー
```bash
lsof -i :3000   # Next.js
lsof -i :5432   # PostgreSQL
lsof -i :6379   # Redis
lsof -i :4566   # LocalStack
```

#### LocalStackに接続できない
```bash
docker logs ecommerce-localstack
docker-compose restart localstack
```

### AWS環境

詳細は [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) のトラブルシューティングセクションを参照。

---

## 📚 ドキュメント

- **[詳細仕様書](./docs/pattern-1-monolith.md)** - アーキテクチャの詳細
- **[デプロイガイド](./docs/DEPLOYMENT.md)** - AWS デプロイ手順
- **[イシュー & Todo](./docs/issues-and-todos.md)** - 開発タスク一覧
- **[フォルダ構成](./docs/folder-structure-plan.md)** - ディレクトリ構造

---

## 📖 参考資料

- [Next.js Documentation](https://nextjs.org/docs)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [LocalStack Documentation](https://docs.localstack.cloud/)
- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/intro.html)

---

## 🤝 コントリビューション

プルリクエストは歓迎します！大きな変更の場合は、まずissueを開いて変更内容を議論してください。

