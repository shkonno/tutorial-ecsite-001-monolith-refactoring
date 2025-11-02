# 技術スタック詳細

> 📅 最終更新: 2025-10-30  
> 📊 アーキテクチャ図: [current-architecture.drawio](./current-architecture.drawio)

このドキュメントでは、Pattern 1: モノリス + コンテナアーキテクチャで使用している技術スタック、フレームワーク、ライブラリ、ツールの詳細を記載します。

---

## 📋 目次

1. [言語・ランタイム](#言語ランタイム)
2. [フロントエンド](#フロントエンド)
3. [バックエンド](#バックエンド)
4. [データベース・キャッシュ](#データベースキャッシュ)
5. [認証・セキュリティ](#認証セキュリティ)
6. [クラウドサービス (AWS)](#クラウドサービス-aws)
7. [DevOps・インフラ](#devopsインフラ)
8. [品質保証](#品質保証)
9. [開発ツール](#開発ツール)
10. [バージョン一覧](#バージョン一覧)

---

## 言語・ランタイム

### TypeScript
- **バージョン**: 5.x
- **用途**: アプリケーション全体の型安全性確保
- **設定ファイル**: `app/tsconfig.json`
- **特徴**:
  - 厳格な型チェック (`strict: true`)
  - Next.js App Router との統合
  - Prisma Client の自動型生成

### Node.js
- **バージョン**: 20 LTS
- **用途**: サーバーサイドランタイム
- **特徴**:
  - 長期サポート版 (LTS)
  - ES Modules サポート
  - 最新のパフォーマンス最適化

---

## フロントエンド

### React
- **バージョン**: 19.2.0
- **用途**: UI コンポーネント構築
- **特徴**:
  - React Server Components (RSC) 対応
  - Concurrent Features
  - 自動バッチ処理

### Next.js
- **バージョン**: 16.0.1
- **用途**: フルスタックフレームワーク
- **主要機能**:
  - **App Router**: ファイルベースルーティング
  - **Server Components**: サーバーサイドレンダリング
  - **API Routes**: バックエンド API 実装
  - **Server Actions**: サーバーサイド関数呼び出し
  - **Image Optimization**: 画像最適化
  - **Font Optimization**: フォント最適化
- **設定ファイル**: `app/next.config.ts`

### Tailwind CSS
- **バージョン**: 4.x
- **用途**: ユーティリティファーストCSSフレームワーク
- **設定ファイル**: `app/tailwind.config.js`, `app/postcss.config.mjs`
- **特徴**:
  - カスタムデザインシステム
  - JIT (Just-In-Time) モード
  - レスポンシブデザイン対応

### react-icons
- **バージョン**: 5.5.0
- **用途**: アイコンライブラリ
- **特徴**:
  - Font Awesome、Material Design、Feather Icons など統合
  - Tree-shaking 対応で軽量

### clsx
- **バージョン**: 2.1.1
- **用途**: 条件付き CSS クラス名管理
- **特徴**:
  - 動的なクラス名の組み合わせ
  - TypeScript フレンドリー

---

## バックエンド

### Next.js API Routes / Server Actions
- **用途**: RESTful API および RPC スタイルのサーバー処理
- **実装場所**:
  - API Routes: `app/app/api/`
  - Server Actions: `app/lib/actions/`
- **主要エンドポイント**:
  - `/api/auth/*` - 認証
  - `/api/products` - 商品管理
  - `/api/cart` - カート操作
  - `/api/orders` - 注文処理

### Prisma ORM
- **バージョン**: 6.18.0
- **用途**: データベース ORM
- **主要機能**:
  - 型安全なデータベースクエリ
  - マイグレーション管理
  - データベーススキーマ定義
- **設定ファイル**: 
  - `app/prisma/schema.prisma` - スキーマ定義
  - `app/prisma/migrations/` - マイグレーション履歴
- **主要コマンド**:
  ```bash
  npx prisma migrate dev    # マイグレーション作成・適用
  npx prisma generate       # Prisma Client 生成
  npx prisma studio         # データベースGUI
  npm run db:seed           # シードデータ投入
  ```

---

## データベース・キャッシュ

### PostgreSQL
- **バージョン**: 15-alpine
- **用途**: メインデータベース
- **本番環境**: AWS RDS PostgreSQL (db.t3.micro)
- **ローカル環境**: Docker コンテナ
- **主要テーブル**:
  - `users` - ユーザー情報
  - `products` - 商品マスタ
  - `cart_items` - カート内容
  - `orders` - 注文情報
  - `order_items` - 注文明細

### Redis
- **バージョン**: 7-alpine
- **用途**: キャッシュ・セッション管理
- **本番環境**: AWS ElastiCache Redis (cache.t3.micro)
- **ローカル環境**: Docker コンテナ
- **クライアントライブラリ**: `ioredis` (v5.8.2)
- **主な用途**:
  - セッションストア
  - API レスポンスキャッシュ
  - 商品一覧キャッシュ (TTL: 300秒)

---

## 認証・セキュリティ

### NextAuth.js
- **バージョン**: 5.0.0-beta.30
- **用途**: 認証・認可
- **認証方式**: Credentials Provider (Email + Password)
- **セッション方式**: JWT (JSON Web Token)
- **設定ファイル**: `app/lib/auth.ts`
- **型定義**: `app/types/next-auth.d.ts`
- **主要機能**:
  - ユーザー登録・ログイン
  - セッション管理
  - 保護されたルート
  - ミドルウェア認証

### bcryptjs
- **バージョン**: 3.0.2
- **用途**: パスワードハッシュ化
- **特徴**:
  - Salt ラウンド: 10
  - レインボーテーブル攻撃対策

---

## クラウドサービス (AWS)

### AWS SDK for JavaScript v3
- **パッケージ**: 
  - `@aws-sdk/client-s3` (v3.920.0)
  - `@aws-sdk/s3-request-presigner` (v3.920.0)
- **用途**: AWS サービス連携
- **設定**: `app/lib/s3.ts`

### Amazon S3
- **用途**: 画像・静的ファイルストレージ
- **バケット**: `ecommerce-images`
- **主な用途**:
  - 商品画像アップロード
  - 静的アセット配信
  - Pre-signed URL による一時アクセス

### Amazon ECS Fargate
- **用途**: コンテナオーケストレーション
- **設定**: CPU: 0.5 vCPU, Memory: 1GB
- **タスク定義**: Terraform で管理

### Amazon RDS
- **エンジン**: PostgreSQL 15
- **インスタンスタイプ**: db.t3.micro (開発), db.t3.small (本番)
- **構成**: Single-AZ (開発), Multi-AZ (本番)

### Amazon ElastiCache
- **エンジン**: Redis
- **インスタンスタイプ**: cache.t3.micro (開発), cache.t3.small (本番)

### Application Load Balancer (ALB)
- **用途**: HTTP/HTTPS トラフィック分散
- **ポート**: 80 (HTTP), 443 (HTTPS)
- **SSL/TLS**: AWS Certificate Manager (ACM)

### CloudWatch
- **用途**: ログ・メトリクス・アラーム
- **主な監視項目**:
  - CPU 使用率
  - メモリ使用率
  - リクエスト数
  - エラー率
  - レスポンスタイム

### Amazon ECR
- **用途**: Docker イメージレジストリ
- **リポジトリ**: `ecommerce-monolith`

### AWS Secrets Manager
- **用途**: シークレット管理
- **保存内容**:
  - データベース認証情報
  - API キー
  - JWT シークレット

### Route 53
- **用途**: DNS 管理
- **設定**: Terraform で管理

### CloudFront (オプション)
- **用途**: CDN (コンテンツ配信ネットワーク)
- **キャッシュ対象**: 静的アセット、画像

---

## DevOps・インフラ

### Docker
- **用途**: コンテナ化
- **Dockerfile**: 
  - `Dockerfile` - 本番環境用
  - `Dockerfile.minimal` - 最小構成版
- **マルチステージビルド**: 
  - `base` - ベースイメージ
  - `deps` - 依存関係インストール
  - `builder` - ビルド
  - `runner` - 本番実行

### Docker Compose
- **バージョン**: 3.8
- **設定ファイル**: 
  - `docker-compose.yml` - 開発環境 (フル構成)
  - `docker-compose.minimal.yml` - 最小構成
- **サービス構成**:
  - `app` - Next.js アプリケーション
  - `db` - PostgreSQL
  - `redis` - Redis
  - `localstack` - AWS エミュレーター

### LocalStack
- **バージョン**: latest
- **用途**: AWS サービスのローカルエミュレーション
- **エミュレートサービス**:
  - S3
  - Secrets Manager
  - CloudWatch Logs
- **初期化スクリプト**: `docker/localstack/init-aws.sh`
- **エンドポイント**: `http://localhost:4566`

### Terraform
- **バージョン**: >= 1.0
- **プロバイダー**: AWS Provider ~> 5.0
- **構成ファイル**:
  - `terraform/main.tf` - プロバイダー設定
  - `terraform/variables.tf` - 変数定義
  - `terraform/outputs.tf` - 出力値
  - `terraform/vpc.tf` - VPC・ネットワーク
  - `terraform/ecs.tf` - ECS クラスター・タスク
  - `terraform/alb.tf` - ALB 設定
  - `terraform/rds.tf` - RDS 設定
  - `terraform/elasticache.tf` - ElastiCache 設定
  - `terraform/s3.tf` - S3 バケット
  - `terraform/cloudwatch.tf` - CloudWatch
  - `terraform/iam.tf` - IAM ロール・ポリシー
  - `terraform/security_groups.tf` - セキュリティグループ
  - `terraform/ecr.tf` - ECR リポジトリ

### GitHub Actions (計画中)
- **用途**: CI/CD パイプライン
- **ワークフロー**:
  - コードリント
  - 型チェック
  - ビルド
  - ECR へのプッシュ
  - ECS デプロイ

---

## 品質保証

### ESLint
- **バージョン**: 9.x
- **設定ファイル**: `app/eslint.config.mjs`
- **プリセット**:
  - `eslint-config-next/core-web-vitals` - Next.js Core Web Vitals ルール
  - `eslint-config-next/typescript` - TypeScript ルール
- **除外設定**:
  - `.next/` - ビルド成果物
  - `out/` - エクスポート成果物
  - `build/` - ビルドディレクトリ
  - `next-env.d.ts` - Next.js 型定義
- **実行コマンド**:
  ```bash
  npm run lint          # リント実行
  npm run lint -- --fix # 自動修正
  ```

### TypeScript Compiler
- **用途**: 型チェック
- **設定**: `app/tsconfig.json`
- **主要設定**:
  - `strict: true` - 厳格な型チェック
  - `noUnusedLocals: true` - 未使用変数検出
  - `noUnusedParameters: true` - 未使用パラメータ検出
  - `noImplicitReturns: true` - 暗黙的な return 禁止

### Playwright
- **バージョン**: 1.52.0
- **用途**: E2Eテスト・ブラウザ自動操作
- **設定ファイル**: `app/playwright.config.ts`
- **Playwright MCP**: `@playwright/mcp` (v1.52.0-alpha-2025-03-26)
- **対応ブラウザ**:
  - Chromium (デフォルト有効)
  - Firefox (設定でオプション)
  - WebKit (設定でオプション)
- **主要機能**:
  - ブラウザ自動操作
  - スクリーンショット撮影
  - トレース記録 (失敗時のみ)
  - ビデオ録画 (失敗時のみ)
- **テストディレクトリ**: `app/tests/`
- **実行コマンド**:
  ```bash
  npx playwright test                # テスト実行
  npx playwright test --ui          # UIモードで実行
  npx playwright test --debug       # デバッグモード
  npx playwright codegen            # コード生成
  npx playwright show-report        # レポート表示
  ```
- **MCP 統合**:
  - Cursor チャットから直接ブラウザ操作可能
  - スナップショット取得・自動操作
  - 詳細: [PLAYWRIGHT-MCP-QUICKSTART.md](../PLAYWRIGHT-MCP-QUICKSTART.md)

### Prisma Validation
- **用途**: データベーススキーマ検証
- **実行**:
  ```bash
  npx prisma validate   # スキーマ検証
  npx prisma format     # スキーマフォーマット
  ```

### tsx
- **バージョン**: 4.20.6
- **用途**: TypeScript 実行環境
- **使用例**:
  - `npm run db:seed` - シードスクリプト実行 (`tsx prisma/seed.ts`)

---

## 開発ツール

### http-server
- **バージョン**: 14.1.1
- **用途**: 静的ファイル配信サーバー（Playwright MCP 用）
- **実行コマンド**:
  ```bash
  npm run serve   # ポート 8080 で起動
  ```

### Git
- **除外設定**: `.gitignore`
- **除外対象**:
  - `node_modules/`
  - `.next/`
  - `out/`
  - `.env`, `.env.local`
  - `postgres_data/`, `redis_data/`

### VS Code / Cursor (推奨)
- **推奨拡張機能**:
  - ESLint
  - Prettier
  - Prisma
  - Tailwind CSS IntelliSense
  - TypeScript + JavaScript

---

## バージョン一覧

### 本番依存関係 (dependencies)

| パッケージ | バージョン | 用途 |
|-----------|----------|------|
| `@aws-sdk/client-s3` | 3.920.0 | S3 クライアント |
| `@aws-sdk/s3-request-presigner` | 3.920.0 | S3 Pre-signed URL |
| `@prisma/client` | 6.18.0 | Prisma ORM クライアント |
| `bcryptjs` | 3.0.2 | パスワードハッシュ化 |
| `clsx` | 2.1.1 | CSS クラス名管理 |
| `ioredis` | 5.8.2 | Redis クライアント |
| `next` | 16.0.1 | Next.js フレームワーク |
| `next-auth` | 5.0.0-beta.30 | 認証ライブラリ |
| `prisma` | 6.18.0 | Prisma CLI |
| `react` | 19.2.0 | React ライブラリ |
| `react-dom` | 19.2.0 | React DOM |
| `react-icons` | 5.5.0 | アイコンライブラリ |

### 開発依存関係 (devDependencies)

| パッケージ | バージョン | 用途 |
|-----------|----------|------|
| `@playwright/mcp` | 1.52.0-alpha-2025-03-26 | Playwright MCP Server |
| `@tailwindcss/postcss` | 4.x | Tailwind CSS PostCSS |
| `@types/bcryptjs` | 2.4.6 | bcryptjs 型定義 |
| `@types/node` | 20.x | Node.js 型定義 |
| `@types/react` | 19.x | React 型定義 |
| `@types/react-dom` | 19.x | React DOM 型定義 |
| `eslint` | 9.x | リンター |
| `eslint-config-next` | 16.0.1 | Next.js ESLint 設定 |
| `http-server` | 14.1.1 | 静的ファイルサーバー |
| `playwright` | 1.52.0 | E2Eテスト |
| `tailwindcss` | 4.x | CSS フレームワーク |
| `tsx` | 4.20.6 | TypeScript 実行環境 |
| `typescript` | 5.x | TypeScript コンパイラ |

### インフラ・ミドルウェア

| サービス | バージョン | 環境 |
|---------|----------|------|
| Node.js | 20 LTS | アプリケーション |
| PostgreSQL | 15-alpine | データベース |
| Redis | 7-alpine | キャッシュ |
| LocalStack | latest | AWS エミュレーター |
| Docker | - | コンテナ化 |
| Docker Compose | 3.8 | オーケストレーション |
| Terraform | >= 1.0 | IaC |

---

## テスト戦略

### 現状のテスト実装

#### ✅ 実装済み

1. **Playwright E2E テスト環境**
   - 設定ファイル: `app/playwright.config.ts`
   - ブラウザ: Chromium (デフォルト)
   - MCP Server 統合で Cursor チャットから操作可能

2. **Playwright MCP による手動テスト**
   - ブラウザ自動操作
   - スナップショット撮影
   - 操作記録・再現

#### ⬜ 未実装（今後の計画）

1. **単体テスト (Unit Tests)**
   - フレームワーク: Jest または Vitest (検討中)
   - 対象:
     - Server Actions (`app/lib/actions/`)
     - ユーティリティ関数
     - Prisma クエリ

2. **統合テスト (Integration Tests)**
   - API Routes のテスト
   - データベース操作のテスト
   - Redis キャッシュのテスト

3. **E2E テスト (End-to-End Tests)**
   - Playwright を使用した自動テスト
   - 主要ユーザーフロー:
     - ユーザー登録・ログイン
     - 商品閲覧・検索
     - カート操作
     - 注文処理
   - テストシナリオ: `app/tests/example.spec.ts` (サンプル)

4. **パフォーマンステスト**
   - Lighthouse CI
   - Core Web Vitals 測定
   - レスポンスタイム監視

5. **セキュリティテスト**
   - OWASP ZAP (検討中)
   - SQL インジェクション対策検証
   - XSS 対策検証
   - CSRF 対策検証

---

## コード品質基準

### リント・フォーマット

- **ESLint**: 全ファイルで実行
- **TypeScript**: 厳格モード有効
- **Prettier**: (オプション、設定ファイルは未作成)

### コミット前チェック

現状は手動実行。将来的に Husky + lint-staged 導入を検討:

```bash
npm run lint           # リント実行
npx tsc --noEmit       # 型チェック
npx prisma validate    # スキーマ検証
```

### CI/CD パイプライン (計画中)

GitHub Actions ワークフロー:
1. リント実行
2. 型チェック
3. ビルド確認
4. (将来) ユニットテスト実行
5. (将来) E2E テスト実行
6. Docker イメージビルド
7. ECR プッシュ
8. ECS デプロイ

---

## セキュリティ対策

### 実装済み

1. **パスワードハッシュ化**: bcryptjs (Salt ラウンド: 10)
2. **JWT トークン**: NextAuth.js による安全なセッション管理
3. **環境変数管理**: `.env` ファイル (`.gitignore` で除外)
4. **シークレット管理**: AWS Secrets Manager (本番環境)
5. **HTTPS 通信**: ALB + ACM による SSL/TLS 証明書
6. **CORS 設定**: Next.js API Routes で制御
7. **SQL インジェクション対策**: Prisma ORM によるパラメータ化クエリ

### 今後の検討事項

1. **CSRF トークン**: フォーム送信時の検証
2. **レート制限**: API エンドポイントへのリクエスト制限
3. **セキュリティヘッダー**: `next.config.ts` での設定
4. **依存関係スキャン**: `npm audit` 定期実行
5. **Secrets スキャン**: git-secrets などの導入

---

## パフォーマンス最適化

### 実装済み

1. **Redis キャッシュ**: 商品一覧キャッシュ (TTL: 300秒)
2. **Next.js Image Optimization**: 自動画像最適化
3. **React Server Components**: サーバーサイドレンダリング
4. **Prisma Connection Pooling**: データベース接続プール
5. **Docker マルチステージビルド**: イメージサイズ最小化

### 今後の検討事項

1. **CloudFront CDN**: 静的アセット配信
2. **データベースインデックス**: クエリ最適化
3. **ページネーション**: 大量データ対応
4. **遅延ロード (Lazy Loading)**: コンポーネント分割
5. **Service Worker**: オフライン対応 (PWA)

---

## 参考資料

### 公式ドキュメント

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Playwright Documentation](https://playwright.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [LocalStack Documentation](https://docs.localstack.cloud)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

### プロジェクト内ドキュメント

- [README.md](../README.md) - プロジェクト概要
- [pattern-1-monolith.md](./pattern-1-monolith.md) - アーキテクチャ詳細
- [current-architecture.drawio](./current-architecture.drawio) - アーキテクチャ図
- [QUICKSTART.md](./QUICKSTART.md) - クイックスタートガイド
- [SETUP-CHECKLIST.md](./SETUP-CHECKLIST.md) - セットアップチェックリスト
- [PLAYWRIGHT-MCP-QUICKSTART.md](../PLAYWRIGHT-MCP-QUICKSTART.md) - Playwright MCP クイックスタート
- [issues-and-todos.md](../product/issues-and-todos.md) - 開発タスク一覧

---

**最終更新**: 2025-10-30  
**メンテナ**: プロジェクトチーム
