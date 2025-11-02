# Pattern 1: モノリス + コンテナアーキテクチャ

ECサイトのモノリスアーキテクチャ実装チュートリアル。Next.js 14、ECS Fargate、PostgreSQL、Redisを使用したシンプルで低コストなアーキテクチャパターン。

## 🎯 プロジェクト概要

このプロジェクトは、スタートアップや小規模プロジェクト向けのモノリスアーキテクチャのリファレンス実装です。単一のNext.jsアプリケーションで、フロントエンドとバックエンドの両方を実装します。

### 特徴

- ✅ **シンプル**: 単一コードベースで開発が容易
- ✅ **低コスト**: 最小限のAWSリソースで運用可能
- ✅ **高速開発**: フルスタックNext.jsで迅速な開発
- ✅ **ローカル完結**: LocalStackで本番環境をエミュレート
- ✅ **本番対応**: TerraformとGitHub Actionsでインフラ自動化

### 対象規模

- **ユーザー数**: ~10,000人
- **同時接続**: ~100-500
- **開発チーム**: 1-5人
- **予算**: 月額 $0（ローカル開発）〜 $200（本番環境）

## 📊 アーキテクチャ

詳細なアーキテクチャ図は [`pattern-1-monolith.drawio`](./pattern-1-monolith.drawio) を参照してください。

### 技術スタック

**アプリケーション:**
- Next.js 14 (App Router)
- TypeScript
- Prisma ORM
- NextAuth.js
- Tailwind CSS + shadcn/ui

**インフラ:**
- AWS ECS Fargate
- RDS PostgreSQL
- ElastiCache Redis
- S3 (画像ストレージ)
- Application Load Balancer

**開発環境:**
- Docker + Docker Compose
- LocalStack (AWSエミュレーター)
- PostgreSQL & Redis (コンテナ)

**DevOps:**
- Terraform (IaC)
- GitHub Actions (CI/CD)

## 📁 フォルダ構成

```
tutorial_ec_site_001_monolith/
├── app/                       # Next.js アプリケーション本体
│   ├── src/
│   │   ├── app/              # App Router（ルーティング）
│   │   ├── components/       # React コンポーネント
│   │   ├── lib/             # ユーティリティ・クライアント
│   │   ├── types/           # TypeScript 型定義
│   │   └── prisma/          # Prisma スキーマ・マイグレーション
│   ├── public/              # 静的ファイル
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── terraform/                 # AWS インフラコード (IaC)
│   ├── main.tf               # プロバイダー設定
│   ├── variables.tf          # 変数定義
│   ├── outputs.tf            # 出力値
│   ├── vpc.tf               # VPC・ネットワーク
│   ├── ecs.tf               # ECS クラスター・タスク
│   ├── alb.tf               # Application Load Balancer
│   ├── rds.tf               # RDS PostgreSQL
│   ├── elasticache.tf       # ElastiCache Redis
│   ├── s3.tf                # S3 バケット
│   ├── cloudwatch.tf        # CloudWatch ログ・アラーム
│   └── iam.tf               # IAM ロール・ポリシー
│
├── docker/                    # Docker 関連設定
│   ├── localstack/           # LocalStack 初期化スクリプト
│   │   └── init-aws.sh      # S3、Secrets Manager 設定
│   └── nginx/               # Nginx 設定（オプション）
│
├── docs/                      # プロジェクトドキュメント
│   ├── setup.md             # セットアップ手順
│   ├── api.md               # API 仕様書
│   ├── architecture.md      # アーキテクチャ説明
│   └── troubleshooting.md   # トラブルシューティング
│
├── .github/                   # GitHub Actions CI/CD
│   └── workflows/
│       ├── deploy.yml        # 本番デプロイ
│       ├── test.yml          # テスト実行
│       └── lint.yml          # コード品質チェック
│
├── Dockerfile                 # 本番環境用 Dockerfile
├── docker-compose.yml         # ローカル開発環境
├── .env.example              # 環境変数テンプレート
├── .gitignore                # Git 除外設定
│
├── pattern-1-monolith.drawio  # アーキテクチャ図
├── pattern-1-monolith.md      # 詳細仕様書
├── issues-and-todos.md        # イシュー & Todo リスト
└── README.md                  # このファイル
```

### 各ディレクトリの役割

#### `app/` - Next.js アプリケーション
フルスタックNext.jsアプリケーション。フロントエンドUIとバックエンドAPIを統合。

**主要な責務:**
- フロントエンド UI (React Server Components)
- API Routes / Server Actions
- データベース操作 (Prisma)
- 認証 (NextAuth.js)
- 外部サービス連携 (S3, Redis)

#### `terraform/` - インフラコード
AWS本番環境のリソース定義。VPC、ECS、RDS、ElastiCache等を管理。

**主要な責務:**
- VPC ネットワーク構成
- ECS Fargate 設定
- データベース・キャッシュ
- 監視・ログ基盤
- セキュリティ設定

#### `docker/` - Docker関連設定
ローカル開発環境用のDocker設定とLocalStack初期化スクリプト。

**主要な責務:**
- LocalStack によるAWSサービスエミュレート
- ローカル開発環境の初期化

#### `.github/` - CI/CD
GitHub Actionsワークフロー定義。自動テスト、ビルド、デプロイを管理。

**主要な責務:**
- 自動テスト実行
- Docker イメージビルド・ECR プッシュ
- ECS サービス更新

## 🚀 クイックスタート

### 前提条件

- Node.js 20+
- Docker & Docker Compose
- Git

### ローカル開発環境のセットアップ

```bash
# リポジトリのクローン
git clone <repository-url>
cd tutorial_ec_site_001_monolith

# 環境変数の設定
cp .env.example .env

# Docker Composeで全サービスを起動
docker-compose up -d

# LocalStackが起動するまで待機
sleep 10

# アプリケーションのセットアップ
cd app
npm install
npx prisma migrate dev
npm run dev
```

アプリケーションは http://localhost:3000 でアクセス可能です。

### LocalStackの確認

```bash
# S3バケットの確認
docker exec ecommerce-localstack awslocal s3 ls

# Secrets Managerの確認
docker exec ecommerce-localstack awslocal secretsmanager list-secrets
```

## 📚 ドキュメント

- **[詳細仕様書](./pattern-1-monolith.md)** - アーキテクチャの詳細、技術スタック、実装例
- **[イシュー & Todo](./issues-and-todos.md)** - 開発タスク一覧とチェックリスト
- **[アーキテクチャ図](./pattern-1-monolith.drawio)** - システム構成図（Draw.io）
- **[Playwright MCP クイックスタート](./PLAYWRIGHT-MCP-QUICKSTART.md)** - 5分で始めるブラウザ自動操作
- **[Playwright MCP セットアップガイド](./PLAYWRIGHT-MCP-SETUP.md)** - 詳細なセットアップ手順

## 🛠️ 開発ワークフロー

### 1. ローカル開発

```bash
# アプリケーション起動
cd app
npm run dev

# データベースマイグレーション
npx prisma migrate dev

# Prisma Studioでデータ確認
npx prisma studio
```

### 2. テスト実行

```bash
# ユニットテスト
npm test

# E2Eテスト（実装時）
npm run test:e2e
```

### 3. 本番デプロイ

```bash
# Terraformでインフラ構築
cd terraform
terraform init
terraform plan
terraform apply

# GitHub Actionsで自動デプロイ
# mainブランチへのプッシュで自動実行
git push origin main
```

## 💰 コスト見積もり

### ローカル開発環境
- **$0/月** - すべてローカルで実行

### 本番環境（AWS）
- 開発環境: 約 $67/月
- 本番環境（小規模）: 約 $195/月

詳細は[pattern-1-monolith.md](./pattern-1-monolith.md#-コスト見積もり月額)を参照。

## 📋 開発タスク

開発タスクは[issues-and-todos.md](./issues-and-todos.md)で管理しています。

### 主要イシュー

1. ✅ プロジェクトの初期設定
2. ⬜ データベース設計とPrisma設定
3. ⬜ 認証システムの実装
4. ⬜ 商品管理機能の実装
5. ⬜ カート機能の実装
6. ⬜ 注文処理機能の実装
7. ⬜ UI/UXコンポーネントの実装
8. ⬜ Docker環境の構築
9. ⬜ LocalStack環境の設定
10. ⬜ Terraformインフラコードの作成
11. ⬜ CI/CDパイプラインの構築
12. ⬜ 監視とロギングの設定
13. ⬜ テストの実装
14. ⬜ ドキュメント整備
15. ⬜ セキュリティ対策

## 🎯 適用場面

### ✅ 適している
- MVP開発
- スタートアップ
- 社内ツール
- 小規模ECサイト

### ❌ 適していない
- 大規模トラフィック
- 複数チーム開発（10人以上）
- 複雑なビジネスロジック（マイクロサービスを検討）

## 🔧 トラブルシューティング

### LocalStackに接続できない

```bash
# LocalStackコンテナの状態確認
docker ps | grep localstack

# ログ確認
docker logs ecommerce-localstack

# 再起動
docker-compose restart localstack
```

### データベース接続エラー

```bash
# PostgreSQLコンテナの状態確認
docker ps | grep postgres

# データベース接続テスト
docker exec ecommerce-db psql -U postgres -d ecommerce -c "SELECT 1"
```

### ポート競合エラー

```bash
# 使用中のポート確認
lsof -i :3000  # Next.js
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :4566  # LocalStack
```

## 📖 参考資料

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [LocalStack Documentation](https://docs.localstack.cloud/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

## 📝 ライセンス

このプロジェクトはチュートリアル目的で作成されています。

## 👥 コントリビューション

プルリクエストは歓迎します！大きな変更の場合は、まずissueを開いて変更内容を議論してください。

---

**Next Step**: [issues-and-todos.md](./issues-and-todos.md) を確認して、イシュー#2から実装を開始してください。
