# Pattern 1: フォルダ構成計画

## 概要

`tutorial_ec_site_001_monolith/` 配下に、Next.js アプリケーション、Docker設定、Terraform インフラコード、ドキュメントを含む完全なモノリスアーキテクチャのフォルダ構成を作成します。

## プロジェクトルート構成

```
tutorial_ec_site_001_monolith/
├── app/                    # Next.js アプリケーション本体
├── terraform/              # AWS インフラコード
├── docker/                 # Docker 関連設定
├── docs/                   # プロジェクトドキュメント
├── .github/                # GitHub Actions CI/CD
├── Dockerfile              # 本番環境用 Dockerfile
├── docker-compose.yml      # ローカル開発環境
├── .env.example            # 環境変数テンプレート
├── .gitignore              # Git 除外設定
└── README.md               # プロジェクト説明
```

## 各ディレクトリの役割

### 1. app/ - Next.js アプリケーション

Next.js 14 (App Router) を使用したフルスタックアプリケーション。

```
app/
├── src/
│   ├── app/              # App Router（ルーティング）
│   ├── components/       # React コンポーネント
│   ├── lib/             # ユーティリティ・クライアント
│   ├── types/           # TypeScript 型定義
│   └── prisma/          # Prisma スキーマ・マイグレーション
├── public/              # 静的ファイル
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

**主要な責務:**

- フロントエンド UI (React Server Components)
- API Routes / Server Actions
- データベース操作 (Prisma)
- 認証 (NextAuth.js)
- 外部サービス連携 (S3, Redis)

### 2. terraform/ - インフラストラクチャコード

AWS リソースを定義する Terraform コード。

```
terraform/
├── main.tf              # プロバイダー設定
├── variables.tf         # 変数定義
├── outputs.tf           # 出力値
├── vpc.tf              # VPC・ネットワーク
├── ecs.tf              # ECS クラスター・タスク
├── alb.tf              # Application Load Balancer
├── rds.tf              # RDS PostgreSQL
├── elasticache.tf      # ElastiCache Redis
├── s3.tf               # S3 バケット
├── cloudwatch.tf       # CloudWatch ログ・アラーム
└── iam.tf              # IAM ロール・ポリシー
```

**主要な責務:**

- VPC ネットワーク構成
- ECS Fargate 設定
- データベース・キャッシュ
- 監視・ログ基盤
- セキュリティ設定

### 3. docker/ - Docker 関連設定

ローカル開発環境用の設定ファイル。

```
docker/
├── localstack/          # LocalStack 初期化スクリプト
│   └── init-aws.sh     # S3、Secrets Manager 設定
└── nginx/              # Nginx 設定（オプション）
```

**主要な責務:**

- LocalStack によるAWSサービスエミュレート
- ローカル開発環境の初期化

### 4. .github/ - CI/CD パイプライン

GitHub Actions ワークフロー定義。

```
.github/
└── workflows/
    ├── ci.yml           # Lint / Typecheck / Vitest / Docker build（検証）
    ├── e2e.yml          # E2E（手動実行）
    └── (削除) deploy.yml # 旧: AWS(ECS)デプロイ（AWS未運用のため削除）
```

**主要な責務:**

- 自動テスト実行
- Docker イメージビルド（検証）

### 5. docs/ - ドキュメント

プロジェクト関連ドキュメント。

```
docs/
├── folder-structure-plan.md  # このファイル
├── setup.md                  # セットアップ手順
├── api.md                    # API 仕様書
├── architecture.md           # アーキテクチャ説明
└── troubleshooting.md        # トラブルシューティング
```

## ルートレベルのファイル

### Dockerfile

本番環境用マルチステージビルド。Node.js 20ベースで最適化。

**構成:**
- `base`: Node.js 20 Alpine
- `deps`: 本番依存関係のみインストール
- `builder`: 開発依存関係とビルド
- `runner`: 本番実行環境（非rootユーザー）

### docker-compose.yml

ローカル開発環境定義。以下のサービスを含む:

- **app** (Next.js): フルスタックアプリケーション
- **db** (PostgreSQL 15): メインデータベース
- **redis** (Redis 7): キャッシュストア
- **localstack** (LocalStack): AWS サービスエミュレーター

### .env.example

必要な環境変数のテンプレート:

- `DATABASE_URL`: PostgreSQL接続文字列
- `REDIS_URL`: Redis接続文字列
- `NEXTAUTH_SECRET`: NextAuth.js認証シークレット
- `AWS_REGION`: AWSリージョン
- `AWS_ACCESS_KEY_ID`: AWS認証情報
- `AWS_SECRET_ACCESS_KEY`: AWS認証情報
- `S3_BUCKET`: S3バケット名
- `AWS_ENDPOINT_URL`: LocalStackエンドポイント（開発環境のみ）

## 既存ファイルの扱い

現在 `tutorial_ec_site_001_monolith/` に存在する以下のファイルは保持:

- `pattern-1-monolith.drawio` (アーキテクチャ図)
- `pattern-1-monolith.md` (詳細仕様書)
- `issues-and-todos.md` (タスクリスト)
- `README.md` (概要説明)

## 実装状況

### ✅ 完了済み

- [x] 主要ディレクトリ（app, terraform, docker, docs, .github）を作成
- [x] docker配下のサブディレクトリ（localstack, nginx）を作成
- [x] .github/workflows ディレクトリを作成
- [x] ルートレベルの設定ファイル（.env.example, .gitignore）を作成
- [x] Dockerfileを作成（マルチステージビルド）
- [x] docker-compose.ymlを作成（4サービス構成）
- [x] LocalStack初期化スクリプトを作成
- [x] README.mdにフォルダ構成の説明を追加

### 🚧 次のステップ

このフォルダ構成を基に、[issues-and-todos.md](../product/issues-and-todos.md) のイシューリストに従って順次実装を進めます。

**推奨開発順序:**

1. **イシュー #1: プロジェクトの初期設定** ✅ 完了
2. **イシュー #2: データベース設計とPrisma設定** ← 次はここから
3. **イシュー #3: 認証システムの実装**
4. **イシュー #4: 商品管理機能の実装**
5. 以降、[issues-and-todos.md](../product/issues-and-todos.md) を参照

## 開発フェーズごとの実装計画

### フェーズ1: 基盤構築 (Week 1-2)
```
app/              # Next.jsプロジェクト作成
├── src/
│   ├── prisma/  # スキーマ定義
│   └── lib/     # DB・Redis・S3クライアント
docker/           # ローカル開発環境
```

### フェーズ2: コア機能開発 (Week 3-4)
```
app/src/
├── app/
│   ├── (auth)/     # 認証ページ
│   ├── (shop)/     # 商品・カート・注文ページ
│   └── api/        # API Routes
└── components/     # UIコンポーネント
```

### フェーズ3: UI/UX改善 (Week 5)
```
app/src/
├── components/
│   └── ui/         # shadcn/ui コンポーネント
└── app/
    └── layout.tsx  # グローバルレイアウト
```

### フェーズ4: 本番環境準備 (Week 6-7)
```
terraform/          # インフラコード
└── *.tf

.github/
└── workflows/      # CI/CDパイプライン
```

### フェーズ5: 品質向上 (Week 8)
```
app/
├── __tests__/     # テストコード
└── src/
    └── middleware.ts  # セキュリティミドルウェア
```

## ディレクトリ命名規則

### ファイル命名
- **コンポーネント**: PascalCase (`ProductCard.tsx`)
- **ユーティリティ**: camelCase (`db.ts`, `redis.ts`)
- **ページ**: kebab-case または lowercase (`page.tsx`, `not-found.tsx`)
- **設定ファイル**: kebab-case (`next.config.js`, `tailwind.config.js`)

### フォルダ構造のベストプラクティス

1. **関心事の分離**: 機能ごとにディレクトリを分ける
2. **コロケーション**: 関連ファイルは近くに配置
3. **命名の一貫性**: プロジェクト全体で統一
4. **浅い階層**: 3-4階層以内を推奨
5. **明確な責務**: 各ディレクトリは単一責務を持つ

## 参考資料

- [Next.js Project Structure](https://nextjs.org/docs/getting-started/project-structure)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

---

**Last Updated**: 2025-10-29  
**Status**: ✅ 基盤構築完了
