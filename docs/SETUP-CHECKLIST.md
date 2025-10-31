# デプロイ準備チェックリスト

## ✅ 完了済み

- [x] Next.js Hello Worldアプリケーション作成
- [x] Terraform完全インフラコード実装
- [x] GitLab CI/CDパイプライン設定
- [x] LocalStack開発環境構築
- [x] デプロイドキュメント作成
- [x] GitLabへのコード push完了

## 📋 デプロイ前に必要な作業（順番に実施）

### 1. 必要なツールのインストール

#### Terraform
```bash
# macOS
brew tap hashicorp/tap
brew install hashicorp/tap/terraform

# 確認
terraform version
```

#### Docker Desktop
- https://www.docker.com/products/docker-desktop/
- ダウンロード＆インストール後、起動

#### AWS CLI設定確認
```bash
aws --version
aws configure list

# 未設定の場合
aws configure
# AWS Access Key ID: （入力）
# AWS Secret Access Key: （入力）
# Default region name: ap-northeast-1
# Default output format: json
```

---

### 2. AWSインフラの作成（約10-15分）

```bash
cd /Users/s-konno/Documents/archtecture/tutorial_ec_site_001_monolith/terraform

# Terraform初期化
terraform init

# 実行プランの確認（何が作成されるか確認）
terraform plan

# 作成されるリソース確認後、実行
terraform apply
# "yes" と入力して確定

# 完了後、重要な出力値をメモ
terraform output
```

**作成されるAWSリソース:**
- VPC、サブネット × 4、NAT Gateway × 2
- Application Load Balancer
- ECS Cluster、Service
- ECR Repository
- RDS PostgreSQL (Multi-AZ)
- ElastiCache Redis
- S3 Bucket
- CloudWatch Logs、Alarms
- IAM Roles、Policies

**月額コスト見積もり:** 約 $174/月

---

### 3. GitLab CI/CD変数の設定

1. GitLabプロジェクトを開く:
   https://gl.creationline.com/s-konno/tutorial_ec_site_001_monolith

2. Settings > CI/CD > Variables に移動

3. 以下の変数を追加:

| Key | Value | Protected | Masked |
|-----|-------|-----------|--------|
| `AWS_ACCESS_KEY_ID` | （あなたのAWSアクセスキーID） | ✓ | ✓ |
| `AWS_SECRET_ACCESS_KEY` | （あなたのAWSシークレットアクセスキー） | ✓ | ✓ |
| `AWS_DEFAULT_REGION` | `ap-northeast-1` | ✓ | - |

---

### 4. 初回Dockerイメージのビルド＆ECRプッシュ

```bash
cd /Users/s-konno/Documents/archtecture/tutorial_ec_site_001_monolith

# ECRにログイン
aws ecr get-login-password --region ap-northeast-1 | \
  docker login --username AWS --password-stdin \
  $(aws sts get-caller-identity --query Account --output text).dkr.ecr.ap-northeast-1.amazonaws.com

# ECRリポジトリURLを取得
ECR_REPO=$(cd terraform && terraform output -raw ecr_repository_url)
echo "ECR Repository: $ECR_REPO"

# Dockerイメージをビルド
docker build -t $ECR_REPO:latest .

# ECRにプッシュ
docker push $ECR_REPO:latest

# 確認
aws ecr describe-images \
  --repository-name ecommerce-production-app \
  --region ap-northeast-1
```

---

### 5. ECSサービスの起動確認

```bash
# ECSタスクが起動するまで待機（3-5分）
aws ecs wait services-stable \
  --cluster ecommerce-production-cluster \
  --services ecommerce-production-service \
  --region ap-northeast-1

echo "✅ ECS Service is running!"

# ALB URLを取得
cd terraform
ALB_URL=$(terraform output -raw alb_url)
echo "🌐 Application URL: $ALB_URL"

# ブラウザでアクセス
open $ALB_URL
```

---

### 6. マージリクエストのマージ

1. GitLabでマージリクエストを開く:
   https://gl.creationline.com/s-konno/tutorial_ec_site_001_monolith/-/merge_requests/3

2. "Merge"ボタンをクリック

3. GitLab CI/CDパイプラインが自動実行される

4. パイプラインの成功を確認:
   - Pipeline > Jobs で各ジョブの状態確認
   - デプロイジョブが成功すれば完了！

---

### 7. 動作確認

```bash
# ALB URLにアクセス
curl $ALB_URL

# または、ブラウザで開く
# Hello Worldページが表示されれば成功！🎉
```

---

## 🎯 完了後の状態

✅ Hello Worldアプリケーションが本番環境で動作  
✅ GitLabへのpushで自動デプロイが動作  
✅ インフラがコードで管理されている  
✅ 監視・ログ収集が有効

---

## 🧹 後片付け（リソース削除）

テスト後、リソースを削除する場合：

```bash
cd /Users/s-konno/Documents/archtecture/tutorial_ec_site_001_monolith/terraform

# すべてのAWSリソースを削除
terraform destroy
# "yes" と入力して確定

# ECRイメージも削除する場合
aws ecr delete-repository \
  --repository-name ecommerce-production-app \
  --force \
  --region ap-northeast-1
```

**警告**: `terraform destroy`を実行すると、すべてのデータが削除されます！

---

## 📚 参考ドキュメント

- [詳細デプロイガイド](./DEPLOYMENT.md)
- [クイックスタート](./QUICKSTART.md)
- [イシュー管理](./issues-and-todos.md)

---

## 💡 トラブルシューティング

### ECSタスクが起動しない
```bash
# CloudWatchログを確認
aws logs tail /ecs/ecommerce-production-app --follow --region ap-northeast-1
```

### ALBヘルスチェックが失敗する
```bash
# ターゲットの状態確認
aws elbv2 describe-target-health \
  --target-group-arn $(terraform output -raw target_group_arn) \
  --region ap-northeast-1
```

### パイプラインが失敗する
- GitLab CI/CD > Jobs でエラーログ確認
- GitLab CI/CD変数が正しく設定されているか確認
- ECRリポジトリとECSサービスが存在するか確認

