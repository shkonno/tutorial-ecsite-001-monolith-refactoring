# デプロイ手順ガイド

## 🚀 AWSへのデプロイ手順

このガイドでは、Hello Worldアプリケーションをゼロから本番環境にデプロイする手順を説明します。

---

## 📋 前提条件

- AWS CLI がインストールされている
- AWS アカウントと適切な権限を持つIAMユーザー
- Terraform がインストールされている（v1.5.0以上）
- Docker がインストールされている
- GitHubリポジトリが作成されている

---

## ステップ1: AWSクレデンシャル設定

```bash
# AWS CLIの設定
aws configure

# 入力する情報:
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region name: ap-northeast-1
# Default output format: json

# 確認
aws sts get-caller-identity
```

---

## ステップ2: Terraform変数ファイルの作成

```bash
cd terraform

# terraform.tfvars.exampleをコピー
cp terraform.tfvars.example terraform.tfvars

# terraform.tfvarsを編集
# 特にdb_passwordを必ず変更してください！
vim terraform.tfvars
```

**terraform.tfvars の重要な設定:**

```hcl
project_name = "ecommerce"
environment  = "production"
aws_region   = "ap-northeast-1"

# データベースパスワードを必ず変更！
db_password = "your-secure-password-here"
```

---

## ステップ3: Terraformでインフラを作成

```bash
# Terraform初期化
terraform init

# プランを確認（何が作成されるか確認）
terraform plan

# インフラを作成（10-15分かかります）
terraform apply

# 確認を求められたら "yes" と入力

# 完了後、ALBのURLが出力されます
# 例: alb_url = "http://ecommerce-production-alb-123456789.ap-northeast-1.elb.amazonaws.com"
```

**作成されるリソース:**
- VPC、サブネット、NAT Gateway
- Application Load Balancer
- ECS Cluster、Service（初回は起動しません）
- ECR Repository
- RDS PostgreSQL（Multi-AZ）
- ElastiCache Redis
- S3 Bucket
- CloudWatch Logs、Alarms
- IAM Roles、Policies

---

## ステップ4: 初回Dockerイメージをビルド・プッシュ

Terraformでインフラが作成されたら、最初のDockerイメージを手動でプッシュします。

```bash
# ECRにログイン
aws ecr get-login-password --region ap-northeast-1 | \
  docker login --username AWS --password-stdin \
  $(aws sts get-caller-identity --query Account --output text).dkr.ecr.ap-northeast-1.amazonaws.com

# ECRリポジトリURLを取得
ECR_REPO=$(terraform output -raw ecr_repository_url)
echo $ECR_REPO

# プロジェクトルートに移動
cd ..

# Dockerイメージをビルド
docker build -t $ECR_REPO:latest .

# ECRにプッシュ
docker push $ECR_REPO:latest

# 確認
aws ecr list-images --repository-name ecommerce-production-app --region ap-northeast-1
```

---

## ステップ5: ECSサービスの起動確認

```bash
# ECSタスクの状態確認
aws ecs describe-services \
  --cluster ecommerce-production-cluster \
  --services ecommerce-production-service \
  --region ap-northeast-1 \
  --query 'services[0].[status,runningCount,desiredCount]'

# タスクが起動するまで待つ（3-5分）
aws ecs wait services-stable \
  --cluster ecommerce-production-cluster \
  --services ecommerce-production-service \
  --region ap-northeast-1

echo "✅ ECS Service is stable!"
```

---

## ステップ6: アプリケーションにアクセス

```bash
# ALB URLを取得
cd terraform
ALB_URL=$(terraform output -raw alb_url)
echo "🌐 Application URL: $ALB_URL"

# ブラウザでアクセスまたはcurlで確認
curl $ALB_URL
```

ブラウザで ALB URL にアクセスして、**Hello World** ページが表示されることを確認してください！

---

## ステップ7: GitHub Actions CI/CD設定

### 7.1 GitHubシークレットの設定

GitHubリポジトリの Settings > Secrets and variables > Actions に以下を追加:

- `AWS_ACCESS_KEY_ID`: AWSアクセスキーID
- `AWS_SECRET_ACCESS_KEY`: AWSシークレットアクセスキー

### 7.2 コードをGitHubにプッシュ

```bash
# Gitリポジトリ初期化（まだの場合）
git init
git add .
git commit -m "Initial commit: Hello World with complete infrastructure"

# リモートリポジトリを追加
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# mainブランチにプッシュ
git branch -M main
git push -u origin main
```

### 7.3 自動デプロイの確認

- GitHubの Actions タブで、デプロイワークフローが自動実行されることを確認
- 完了後、再度ALB URLにアクセスして更新を確認

---

## 🎉 完了！

これで以下が完成しました：

✅ AWS上で動作するNext.js Hello Worldアプリ  
✅ 完全なインフラ（VPC、ECS、RDS、Redis、S3）  
✅ 自動デプロイパイプライン（GitHub Actions）  
✅ 監視・アラート（CloudWatch）

---

## 🛠️ トラブルシューティング

### ECSタスクが起動しない

```bash
# タスクのログを確認
aws ecs describe-tasks \
  --cluster ecommerce-production-cluster \
  --tasks $(aws ecs list-tasks --cluster ecommerce-production-cluster --query 'taskArns[0]' --output text) \
  --region ap-northeast-1

# CloudWatchログを確認
aws logs tail /ecs/ecommerce-production-app --follow --region ap-northeast-1
```

### ALBヘルスチェックが失敗する

```bash
# ターゲットグループのヘルスチェック状態
aws elbv2 describe-target-health \
  --target-group-arn $(aws elbv2 describe-target-groups --names ecommerce-production-tg --query 'TargetGroups[0].TargetGroupArn' --output text) \
  --region ap-northeast-1
```

### データベース接続エラー

- セキュリティグループでECSからRDSへの接続が許可されているか確認
- RDSエンドポイントが正しく設定されているか確認

---

## 💰 コスト管理

**月間想定コスト（production環境）:**

- NAT Gateway: ~$32
- RDS (db.t3.micro Multi-AZ): ~$50
- ElastiCache (cache.t3.micro): ~$12
- ECS Fargate (2タスク常時実行): ~$50
- ALB: ~$20
- その他（データ転送、CloudWatch等）: ~$10

**合計: 約 $174/月**

### コスト削減のヒント

1. **開発環境用**に別のTerraform変数ファイルを作成:
   - RDS Single-AZ
   - ElastiCache 1ノード
   - ECS 1タスク
   - NAT Gateway 1個のみ
   → 月額 $67程度に削減可能

2. **使わない時は停止**:
   ```bash
   # ECSサービスを停止
   aws ecs update-service \
     --cluster ecommerce-production-cluster \
     --service ecommerce-production-service \
     --desired-count 0
   ```

---

## 🧹 クリーンアップ（リソース削除）

**警告**: 以下を実行するとすべてのリソースが削除されます！

```bash
cd terraform

# すべて削除
terraform destroy

# 確認を求められたら "yes" と入力

# ECRイメージも削除する場合
aws ecr delete-repository \
  --repository-name ecommerce-production-app \
  --force \
  --region ap-northeast-1
```

---

## 📚 次のステップ

Phase 5が完了したら、Phase 6で以下の機能を追加できます：

1. データベース設計（Prisma）
2. 認証システム（NextAuth.js）
3. 商品管理機能
4. カート機能
5. 注文処理

詳細は [`issues-and-todos.md`](../../product/issues-and-todos.md) を参照してください。

---

## 📞 サポート

問題が発生した場合は、以下を確認してください：

- CloudWatchログ: `/ecs/ecommerce-production-app`
- ECSタスクの状態
- セキュリティグループの設定
- IAMロールの権限
