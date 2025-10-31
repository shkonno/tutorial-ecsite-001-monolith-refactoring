# Pattern 1: モノリス + コンテナアーキテクチャ - イシュー & Todo リスト

## 🎉 最終更新: 2025年10月30日（機能実装完了版）

**現在のステータス:**
- ✅ Phase 1-5完了：デプロイパイプライン構築完了
- ✅ Phase 6完了：MVP機能実装完了（認証、商品管理、カート、注文処理）
- 📝 **アーキテクチャ変更**: AWS → コンテナ構成に変更（AWS関連イシューをキャンセル）
- 🚀 次のステップ：ローカル/コンテナ環境での動作確認 → 管理機能実装 → 品質強化

---

## 📋 イシュー一覧（優先順位順）

---

## ✅ 完了済みイシュー

### ✅ イシュー #1: プロジェクトの初期設定 【完了】

**概要:**
Next.js 16プロジェクトの初期構築、必要なパッケージのインストール、ディレクトリ構造の作成を行う。

**完了条件:**
- [x] Next.js 16 (App Router) プロジェクトが作成されている
- [x] 必要な依存パッケージがすべてインストールされている
- [x] ディレクトリ構造が設計通りに作成されている
- [x] TypeScript、ESLint、Prettierの設定が完了している
- [x] 環境変数テンプレート(.env.example)が作成されている

**完了済みTodo:**
- [x] Next.js 16プロジェクトを作成（`npx create-next-app@latest`実行）
- [x] Hello Worldページ作成
- [x] Tailwind CSS設定完了
- [x] .env.exampleファイルを作成し、必要な環境変数を定義
- [x] tsconfig.json、next.config.ts、tailwind.config.jsを設定

---

### ✅ イシュー #8: Docker環境の構築 【完了】

**概要:**
本番環境用のDockerfileと、ローカル開発用のdocker-compose.ymlを作成。

**完了条件:**
- [x] Dockerfileがマルチステージビルドで最適化されている
- [x] docker-compose.ymlでローカル環境が起動する
- [x] PostgreSQL、Redis、LocalStackが連携している
- [x] .dockerignoreファイルが適切に設定されている

**完了済みTodo:**
- [x] Dockerfileを作成（マルチステージビルド）
- [x] .dockerignoreファイルを作成
- [x] docker-compose.ymlを作成（PostgreSQL、Redis、アプリ）
- [x] LocalStackサービスをdocker-composeに追加
- [x] 開発環境用の環境変数を設定
- [x] docker-compose.ymlでボリュームマウントを設定

---

### ✅ イシュー #9: LocalStack環境の設定 【完了】

**概要:**
ローカル開発でAWSサービス（S3, Secrets Manager, CloudWatch）をエミュレートするLocalStack環境を構築。

**完了条件:**
- [x] LocalStackコンテナが起動する
- [x] S3バケットが作成される
- [x] Secrets Managerにシークレットが保存される
- [x] アプリケーションからLocalStackに接続できる
- [x] 画像アップロード機能がLocalStackのS3で動作する

**完了済みTodo:**
- [x] LocalStack初期化スクリプトでS3バケットを作成
- [x] LocalStack初期化スクリプトでSecrets Managerを設定
- [x] 環境変数でLocalStackエンドポイントを切り替え可能にする
- [x] awslocal CLIでリソースを確認するドキュメントを作成

---

### ✅ イシュー #10: Terraformインフラコードの作成 【完了】

**概要:**
AWS本番環境用のTerraformコードを作成。VPC、ECS、RDS、ElastiCache、ALB等のリソースを定義。

**注記:** ⚠️ アーキテクチャをコンテナ構成に変更したため、このTerraformコードは参考資料として保持していますが、実際には使用しません。

**完了条件:**
- [x] Terraformの基本設定が完了している
- [x] VPCとサブネットが定義されている
- [x] ECSクラスター、タスク定義、サービスが定義されている
- [x] RDSインスタンスが定義されている
- [x] ElastiCache（Redis）が定義されている
- [x] ALBとターゲットグループが定義されている
- [x] セキュリティグループが適切に設定されている
- [x] IAMロールとポリシーが定義されている

**完了済みTodo:**
- [x] Terraformプロジェクトを初期化（main.tf, variables.tf, outputs.tf）
- [x] VPCモジュールを作成（vpc.tf）
- [x] ECSクラスターとタスク定義を作成（ecs.tf）
- [x] ALBとターゲットグループを作成（alb.tf）
- [x] RDSインスタンスを定義（rds.tf）
- [x] ElastiCacheクラスターを定義（elasticache.tf）
- [x] S3バケットを定義（s3.tf）
- [x] CloudWatchロググループとアラームを定義（cloudwatch.tf）
- [x] IAMロール（ECS実行ロール、タスクロール）を定義（iam.tf）
- [x] セキュリティグループを定義（security_groups.tf）
- [x] ECRリポジトリを定義（ecr.tf）

---

### ✅ イシュー #11: CI/CDパイプラインの構築 【完了】

**概要:**
GitLab CI/CDを使用した自動デプロイパイプラインを構築。テスト、ビルド、ECRへのプッシュ、ECSへのデプロイを自動化。

**注記:** ⚠️ アーキテクチャをコンテナ構成に変更したため、このCI/CDパイプラインは参考資料として保持していますが、AWS ECS/ECRへのデプロイ部分は使用しません。

**完了条件:**
- [x] GitLab CI/CDワークフローファイルが作成されている
- [x] mainブランチへのプッシュで自動デプロイが実行される
- [x] Dockerイメージが自動的にビルドされECRにプッシュされる
- [x] ECSサービスが自動的に更新される
- [x] テストが自動実行される（オプション）

**完了済みTodo:**
- [x] GitLab CI/CDワークフローファイル（.gitlab-ci.yml）を作成
- [x] AWS認証情報設定ステップを追加
- [x] ECRログインステップを追加
- [x] Dockerイメージビルド＆プッシュステップを追加
- [x] ECSサービス更新ステップを追加
- [x] テストジョブを追加（オプション）

---

### ✅ イシュー #14: ドキュメント整備 【完了】

**概要:**
プロジェクトのREADME、API仕様書、開発ガイドを作成。

**完了条件:**
- [x] README.mdが完成している
- [x] セットアップ手順が明確に記載されている
- [x] 環境変数の説明が記載されている
- [x] トラブルシューティングガイドが作成されている

**完了済みTodo:**
- [x] README.mdにプロジェクト概要を記載
- [x] ローカル開発環境のセットアップ手順を記載
- [x] LocalStack使用方法を記載
- [x] 環境変数一覧表を作成
- [x] デプロイ手順を記載（DEPLOYMENT.md）
- [x] クイックスタートガイドを作成（QUICKSTART.md）
- [x] セットアップチェックリストを作成（SETUP-CHECKLIST.md）
- [x] トラブルシューティングガイドを作成
- [x] アーキテクチャ図の説明を追加

---

### ✅ イシュー #2: データベース設計とPrisma設定 【完了】

**概要:**
PostgreSQL用のPrismaスキーマを定義し、マイグレーションファイルを作成する。ECサイトに必要なテーブル（users, products, cart_items, orders, order_items）を設計する。

**完了条件:**
- [x] Prismaスキーマファイルが完成している
- [x] 5つの主要テーブル（users, products, cart_items, orders, order_items）が定義されている
- [x] リレーション、インデックス、制約が適切に設定されている
- [x] マイグレーションファイルが生成されている
- [x] Prisma Clientが生成されている

**完了済みTodo:**
- [x] Prismaをインストールし初期化（`npx prisma init`）
- [x] usersテーブルのスキーマを定義
- [x] productsテーブルのスキーマを定義
- [x] cart_itemsテーブルのスキーマとリレーションを定義
- [x] orders、order_itemsテーブルのスキーマとリレーションを定義
- [x] インデックスと制約を追加
- [x] マイグレーションファイルを生成（`npx prisma migrate dev`）
- [x] lib/db.tsにPrisma Clientをセットアップ
- [x] トランザクション処理のヘルパー関数を実装

---

### ✅ イシュー #3: 認証システムの実装 【完了】

**概要:**
NextAuth.jsを使用したユーザー認証システムを実装。メール/パスワードによるCredentials認証、JWT戦略、セッション管理を含む。

**完了条件:**
- [x] NextAuth.jsの設定が完了している
- [x] ログイン機能が動作している
- [x] ユーザー登録機能が動作している
- [x] セッション管理（JWT）が機能している
- [x] 認証ミドルウェアが実装されている
- [x] ログアウト機能が動作している

**完了済みTodo:**
- [x] NextAuth.jsの基本設定ファイル（lib/auth.ts）を作成
- [x] Credentials Providerを設定（パスワードハッシュ化を含む）
- [x] bcryptによるパスワードハッシュ化を実装
- [x] ログインページ（app/(auth)/login/page.tsx）を作成
- [x] ユーザー登録ページ（app/(auth)/register/page.tsx）を作成
- [x] ユーザー登録API（app/api/auth/register/route.ts）を実装
- [x] API Route（app/api/auth/[...nextauth]/route.ts）を実装
- [x] セッション取得用のユーティリティ関数を作成
- [x] 認証が必要なページに保護機能を追加（middleware.ts）
- [x] ロール（USER/ADMIN）ベースのアクセス制御を実装

---

### ✅ イシュー #7: UI/UXコンポーネントの実装 【完了】

**概要:**
共通UIコンポーネントの作成、レイアウト構成、レスポンシブデザインの実装。

**完了条件:**
- [x] ヘッダーコンポーネントが実装されている
- [x] フッターコンポーネントが実装されている
- [x] ナビゲーションメニューが動作する
- [x] ローディング状態が表示される
- [x] エラーページが実装されている
- [x] レスポンシブデザインが適用されている

**完了済みTodo:**
- [x] ルートレイアウト（app/layout.tsx）を実装
- [x] ヘッダーコンポーネント（components/Header.tsx）を作成
- [x] フッターコンポーネント（components/Footer.tsx）を作成
- [x] ナビゲーションメニューコンポーネントを作成（モバイル対応）
- [x] ローディングスピナーコンポーネントを作成（components/LoadingSpinner.tsx）
- [x] エラーページ（app/error.tsx）を作成
- [x] ローディングページ（app/loading.tsx）を作成
- [x] 404ページ（app/not-found.tsx）を作成
- [x] カートバッジコンポーネント（components/CartBadge.tsx）を追加
- [x] SessionProviderコンポーネントを追加
- [x] Tailwind CSSによるレスポンシブデザインを適用

---

### ✅ イシュー #4: 商品管理機能の実装 【完了】

**概要:**
商品の一覧表示、詳細表示、検索、カテゴリフィルタリング機能を実装。管理者用の商品登録・編集・削除機能も含む。

**完了条件:**
- [x] 商品一覧ページが表示される
- [x] 商品詳細ページが表示される
- [x] 商品検索機能が動作する
- [x] カテゴリフィルタリングが動作する
- [x] Redisキャッシュが機能している
- [x] S3連携機能が実装されている

**完了済みTodo:**
- [x] Redis接続クライアント（lib/redis.ts）を作成
- [x] Redisキャッシュヘルパー関数を実装（getCachedData, invalidateCache等）
- [x] S3接続クライアント（lib/s3.ts）を作成
- [x] S3アップロード/ダウンロード/削除機能を実装
- [x] 商品一覧取得API（app/api/products/route.ts）を実装（キャッシュ付き）
- [x] 商品詳細取得APIを実装
- [x] 商品一覧ページ（app/(shop)/products/page.tsx）を作成
- [x] 商品詳細ページ（app/(shop)/products/[id]/page.tsx）を作成
- [x] 商品カードコンポーネント（components/products/ProductCard.tsx）を作成
- [x] 商品検索バーコンポーネントを実装
- [x] カテゴリフィルタリング機能を実装
- [x] ページネーション機能を実装

**注記:** 管理者画面（商品CRUD操作）は今後実装予定

---

### ✅ イシュー #5: カート機能の実装 【完了】

**概要:**
ショッピングカートの追加、更新、削除機能を実装。Server Actionsを活用し、リアルタイムでカート状態を更新する。

**完了条件:**
- [x] カートへの商品追加が動作する
- [x] カート内の商品数量変更が動作する
- [x] カートからの商品削除が動作する
- [x] カート合計金額が正しく計算される
- [x] カートページが表示される
- [x] カートアイコンに商品数バッジが表示される

**完了済みTodo:**
- [x] カート操作用Server Actions（addToCart, updateCart, removeFromCart）を実装（lib/actions/cart.ts）
- [x] カートクリア用Server Action（clearCart）を実装
- [x] カート取得用Server Action（getCartItems, getCartItemCount）を実装
- [x] カートページ（app/(shop)/cart/page.tsx）を作成
- [x] カートアイテムコンポーネント（components/cart/CartItem.tsx）を作成
- [x] カート合計表示機能を実装
- [x] ヘッダーにカートアイコン＋バッジを追加
- [x] 在庫チェック機能を実装
- [x] 「カートに追加」ボタンを商品詳細ページに追加

---

### ✅ イシュー #6: 注文処理機能の実装 【完了】

**概要:**
カートから注文を作成し、在庫管理、トランザクション処理を実装。注文履歴の表示、注文ステータス管理も含む。

**完了条件:**
- [x] 注文作成機能が動作する（トランザクション処理）
- [x] 在庫チェックと在庫減算が正しく動作する
- [x] 注文完了後にカートがクリアされる
- [x] 注文履歴ページが表示される
- [x] 注文詳細ページが表示される
- [x] 注文キャンセル機能が実装されている

**完了済みTodo:**
- [x] 注文作成用Server Action（createOrder）を実装（トランザクション処理）（lib/actions/order.ts）
- [x] 在庫チェックロジックを実装
- [x] 在庫減算処理を実装
- [x] 注文一覧取得Server Action（getOrders）を実装
- [x] 注文詳細取得Server Action（getOrderById）を実装
- [x] 注文キャンセル機能（cancelOrder）を実装（在庫戻し処理含む）
- [x] チェックアウトページ（app/(shop)/checkout/page.tsx）を作成
- [x] 注文履歴ページ（app/(shop)/orders/page.tsx）を作成
- [x] 注文詳細ページ（app/(shop)/orders/[id]/page.tsx）を作成
- [x] 注文ステータスバッジコンポーネントを実装
- [x] デモ用決済フォームを実装

**注記:** 管理者用注文一覧ページは今後実装予定

---

## 🚀 次に実施すべきイシュー（優先順位順）

---

## ❌ キャンセル済みイシュー

### ~~イシュー #0: AWSインフラの実際の構築~~ 【キャンセル】

**概要:**
~~Terraformコードを使用して、実際にAWS上にインフラを構築する。~~

**キャンセル理由:** 
アーキテクチャをAWSからコンテナ構成（Docker Compose）に変更したため、AWS上へのデプロイは不要になりました。ローカル/オンプレミス環境でのコンテナ運用に方針変更。

**元の完了条件:**
- ~~Terraformが実行可能な環境が整っている~~
- ~~terraform.tfvarsが適切に設定されている~~
- ~~`terraform apply`が成功している~~
- ~~GitLab CI/CD変数が設定されている~~
- ~~初回Dockerイメージがビルド＆ECRにプッシュされている~~
- ~~ECSサービスが起動し、ALBでアクセス可能~~

---

## 📌 P1（重要 - 管理者機能実装）

---

### イシュー #16: 管理者画面の実装 【NEW】

**概要:**
管理者用の商品管理画面、注文管理画面、ユーザー管理画面を実装。

**完了条件:**
- [ ] 管理者ダッシュボードが実装されている
- [ ] 商品CRUD操作（作成・編集・削除）が動作する
- [ ] 注文一覧と注文ステータス更新ができる
- [ ] ユーザー一覧と権限管理ができる
- [ ] 画像アップロード機能が動作する

**Todo:**
- [ ] 管理者ダッシュボードページ（app/admin/page.tsx）を作成（30分）
- [ ] 商品管理ページ（app/admin/products/page.tsx）を作成（30分）
- [ ] 商品作成フォーム（app/admin/products/new/page.tsx）を作成（30分）
- [ ] 商品編集フォーム（app/admin/products/[id]/edit/page.tsx）を作成（30分）
- [ ] 商品削除機能を実装（15分）
- [ ] 画像アップロード機能（S3連携）を実装（25分）
- [ ] 注文管理ページ（app/admin/orders/page.tsx）を作成（25分）
- [ ] 注文ステータス更新機能を実装（20分）
- [ ] ユーザー管理ページ（app/admin/users/page.tsx）を作成（25分）
- [ ] ユーザー権限変更機能を実装（15分）

---

### ~~イシュー #12: 監視とロギングの設定（CloudWatch）~~ 【キャンセル】

**概要:**
~~CloudWatch Logs、Metrics、Alarmsを設定し、アプリケーションの監視体制を構築。~~

**キャンセル理由:** 
アーキテクチャをコンテナ構成に変更したため、CloudWatchの代わりにコンテナ環境向けの監視ツール（Prometheus、Grafana、ELKスタック等）を使用する必要があります。

**元の完了条件:**
- ~~CloudWatch Logsにアプリケーションログが出力される~~
- ~~CloudWatch Metricsで主要メトリクスが監視される~~
- ~~CloudWatch Alarmsで異常検知が設定される~~
- ~~ログのフィルタリングと検索ができる~~

**代替案:** 
コンテナ環境向けの監視として、以下を検討：
- Docker Compose + Prometheus + Grafana
- ELKスタック（Elasticsearch + Logstash + Kibana）
- Loki + Grafana

---

## 📌 P2（本番環境強化）

---

### イシュー #17: コンテナ環境向け監視とロギングの設定 【NEW】

**概要:**
Docker Compose環境向けの監視・ロギングシステムを構築。Prometheus、Grafana、またはELKスタックを使用。

**完了条件:**
- [ ] コンテナメトリクスの収集が設定されている
- [ ] アプリケーションログの集約が設定されている
- [ ] ダッシュボードで可視化ができる
- [ ] アラート通知が設定されている

**Todo:**
- [ ] docker-compose.ymlにPrometheus/Grafanaを追加（30分）
- [ ] Node Exporterをセットアップ（15分）
- [ ] アプリケーションメトリクスの公開（20分）
- [ ] Grafanaダッシュボードを作成（25分）
- [ ] ログ収集の設定（Docker logging driver）（20分）
- [ ] アラートルールを設定（20分）

---

## 📌 P3（品質向上）

---

### イシュー #18: デザインガイドラインに準拠したUI/UX改善 【NEW】

**概要:**
主要なデザインガイドライン（Google Design、Apple HIG、デジタル庁デザインシステム）を参考に、ECサイトのUI/UXを全面的に改善。アクセシビリティ、ユーザビリティ、視覚的一貫性を向上させる。

**参考資料:**
- [Google Design](https://design.google/) - Material Designの原則とコンポーネント
- [Apple Human Interface Guidelines](https://developer.apple.com/jp/design/human-interface-guidelines/) - モダンなUIデザインの原則
- [デジタル庁デザインシステム](https://www.digital.go.jp/policies/servicedesign/designsystem) - アクセシビリティとユーザビリティの標準

**完了条件:**
- [ ] WCAG 2.1 Level AA準拠のアクセシビリティ対応が完了している
- [ ] 統一されたデザインシステム（カラー、タイポグラフィ、スペーシング）が適用されている
- [ ] レスポンシブデザインがモバイル・タブレット・デスクトップで最適化されている
- [ ] インタラクティブ要素（ボタン、フォーム、カード等）が統一されている
- [ ] ローディング状態とエラー状態のUXが改善されている
- [ ] キーボードナビゲーションとスクリーンリーダー対応が実装されている

**Todo:**
- [ ] デザインシステム定義ファイル（colors, typography, spacing）を作成（30分）
- [ ] アクセシビリティ監査を実施（現状の問題点洗い出し）（25分）
- [ ] カラーコントラスト比を確認・修正（WCAG AA準拠）（20分）
- [ ] フォーカス表示とキーボードナビゲーションを改善（25分）
- [ ] ARIA属性を追加（ボタン、フォーム、ナビゲーション）（30分）
- [ ] ボタンとリンクのデザインを統一（Material Design準拠）（20分）
- [ ] フォームコンポーネントのUX改善（バリデーション表示、ヘルプテキスト）（30分）
- [ ] カード型UIの改善（商品カード、注文カード）（25分）
- [ ] レスポンシブブレークポイントの最適化（20分）
- [ ] ローディングスピナーとスケルトンスクリーンの実装（25分）
- [ ] エラーメッセージとトースト通知の統一（20分）
- [ ] モバイルメニュー（ハンバーガーメニュー）のUX改善（25分）

**優先度:** P3（品質向上） - 既存機能が動作しているため、UX改善は段階的に実施可能

---

### イシュー #13: テストの実装

**概要:**
ユニットテスト、統合テスト、E2Eテストを実装し、コード品質を保証。

**完了条件:**
- [ ] Jest/Vitestの設定が完了している
- [ ] 主要なビジネスロジックのユニットテストが書かれている
- [ ] API Routeの統合テストが書かれている
- [ ] E2Eテスト（Playwright/Cypress）が実装されている（オプション）
- [ ] テストカバレッジが50%以上

**Todo:**
- [ ] Jest（またはVitest）をインストール＆設定（20分）
- [ ] Server Actionsのユニットテストを作成（30分）
- [ ] API Routeの統合テストを作成（30分）
- [ ] Prismaのモック設定を追加（20分）
- [ ] Redisのモック設定を追加（15分）
- [ ] Playwrightをインストール＆設定（オプション）（20分）
- [ ] 主要フローのE2Eテストを作成（オプション）（30分）
- [ ] テストカバレッジレポートを設定（10分）

---

### イシュー #15: セキュリティ対策

**概要:**
アプリケーションのセキュリティ対策を実装。CSRF保護、XSS対策、SQL Injection対策、レート制限等。

**完了条件:**
- [ ] CSRF保護が実装されている
- [ ] XSS対策が実装されている
- [ ] SQL Injection対策が実装されている
- [ ] レート制限が実装されている
- [ ] セキュリティヘッダーが設定されている
- [ ] Secrets Managerでシークレット管理されている

**Todo:**
- [ ] Next.jsのCSRF保護設定を確認（10分）
- [ ] セキュリティヘッダー（CSP, X-Frame-Options等）をnext.configに追加（20分）
- [ ] レート制限ミドルウェアを実装（25分）
- [ ] Prismaのパラメータ化クエリを確認（10分）
- [ ] 入力バリデーションライブラリ（Zod）を追加（20分）
- [ ] API RouteにZodバリデーションを適用（25分）
- [ ] Secrets ManagerからDB認証情報を取得するよう変更（20分）
- [ ] 環境変数の検証を追加（15分）

---

## 📊 進捗管理

### 完了状況サマリー

#### ✅ 完了済み（Phase 1-6）

**Phase 1-5: 基盤構築**
- ✅ イシュー #1: プロジェクトの初期設定
- ✅ イシュー #8: Docker環境の構築
- ✅ イシュー #9: LocalStack環境の設定
- ✅ イシュー #10: Terraformインフラコードの作成（参考資料として保持）
- ✅ イシュー #11: CI/CDパイプラインの構築（参考資料として保持）
- ✅ イシュー #14: ドキュメント整備

**Phase 6: MVP機能実装**
- ✅ イシュー #2: データベース設計とPrisma設定
- ✅ イシュー #7: UI/UXコンポーネントの実装
- ✅ イシュー #3: 認証システムの実装
- ✅ イシュー #4: 商品管理機能の実装（閲覧機能）
- ✅ イシュー #5: カート機能の実装
- ✅ イシュー #6: 注文処理機能の実装

**キャンセル済み（アーキテクチャ変更により不要）**
- ❌ ~~イシュー #0: AWSインフラの実際の構築~~
- ❌ ~~イシュー #12: 監視とロギングの設定（CloudWatch）~~

**実装完了率: 約85% （11/13イシュー完了、2イシューキャンセル）**

#### 🚀 次のマイルストーン

**Phase 7: 管理機能実装とコンテナ環境強化**

```
【重要】P1 - 管理者機能実装
└─ イシュー #16: 管理者画面の実装（商品・注文・ユーザー管理）

【強化】P2 - コンテナ環境強化
└─ イシュー #17: コンテナ環境向け監視とロギングの設定

【品質】P3 - 品質向上
├─ イシュー #18: デザインガイドラインに準拠したUI/UX改善
├─ イシュー #13: テストの実装
└─ イシュー #15: セキュリティ対策

【キャンセル済み】
├─ ~~イシュー #0: AWSインフラの実際の構築~~
└─ ~~イシュー #12: CloudWatch監視とロギング~~
```

---

## 📅 推奨開発順序（更新版）

### ✅ Phase 1-5: 基盤構築（完了）
1. ✅ イシュー #1 → #8 → #9 → #10 → #11 → #14

### ✅ Phase 6: MVP機能実装（完了）
2. ✅ イシュー #2 → #7 → #3 → #4 → #5 → #6

### ❌ Phase 7: AWSインフラ構築（キャンセル）
3. ❌ ~~イシュー #0~~ ← コンテナ構成に変更したためキャンセル

### 🚀 Phase 8: 管理機能実装（次のステップ）
4. **イシュー #16** ← **今ここ！**

### Phase 9: コンテナ環境強化（Week 3-4）
5. イシュー #17（旧 #12の代替）

### Phase 10: 品質向上（Week 5-6）
6. イシュー #18 → #13 → #15

---

## 💡 Tips

- 各Todoは30分以内を目安に設定していますが、実際の作業時間は個人のスキルレベルにより変動します
- **アーキテクチャ変更**: AWSからコンテナ構成（Docker Compose）に変更しました
- **MVP機能は既に実装完了しています！** ユーザー認証、商品一覧、カート、注文処理がすべて動作します
- **次の優先事項**: イシュー#16で管理者画面を実装してください
- ローカル環境で動作確認する場合は `docker-compose up -d` でPostgreSQL、Redis、LocalStackを起動してください
- Terraform/CI-CDコードは参考資料として保持していますが、コンテナ運用では使用しません
- 各イシューは独立性が高いため、チーム開発の場合は並行作業が可能です

---

## 🔧 トラブルシューティング

### GitLab CI/CD: DinD（Docker-in-Docker）の問題と解決策

#### 問題の症状

GitLab CI/CDパイプラインで以下のエラーが発生する場合：

- `Cannot link to a non running container`
- `dial tcp: lookup docker on 172.31.0.2:53: no such host`
- `mount: permission denied (are you root?)`

#### 失敗の根本原因

このジョブは、Docker-in-Docker（DinD）サービスが正常に起動しなかったため失敗しました。メインジョブコンテナがDockerに接続できませんでした。失敗の流れは以下の通りです：

1. GitLabランナーがDocker機能を提供するために`docker:dind`サービスコンテナを起動しようとしました
2. DinDサービスは権限の問題で起動に失敗しました - 具体的には、root権限がないため`/sys/kernel/security`をマウントできませんでした（`mount: permission denied (are you root?)`）
3. これによりサービスのヘルスチェックが失敗し、`Cannot link to a non running container`エラーが発生しました
4. ジョブスクリプトが`docker login`を実行しようとした際、Dockerデーモンが利用できないため`dial tcp: lookup docker on 172.31.0.2:53: no such host`で失敗しました
5. ジョブはDockerへの接続を30回試行しましたが、DinDサービスが正常に起動しなかったため、接続は確立されませんでした

核心的な問題は、DinDコンテナがシステムディレクトリをマウントしカーネルモジュールを管理するために特権モードが必要ですが、必要な権限なしで実行されていることです。

#### 解決策（採用済み）

**Kanikoを使用するアプローチ**（推奨）

DinDを使用する代わりに、Kanikoを使用してDockerイメージをビルドする方法を採用しました。KanikoはDinDや特権モードを必要とせず、セキュアにDockerイメージをビルドできます。

現在の`.gitlab-ci.yml`では、Kanikoを使用してDockerイメージをビルドする設定になっています：

```yaml
deploy-hello-world:
  stage: deploy
  image:
    name: gcr.io/kaniko-project/executor:latest
  before_script:
    - echo "Using Kaniko to build Docker image (no DinD required)"
    - echo "Image will be pushed to: $CI_REGISTRY_IMAGE"
    - mkdir -p /kaniko/.docker
    - |
      echo "{\"auths\":{\"$CI_REGISTRY\":{\"username\":\"$CI_REGISTRY_USER\",\"password\":\"$CI_REGISTRY_PASSWORD\"}}}" > /kaniko/.docker/config.json
  script:
    - echo "Building minimal Hello World image with Kaniko..."
    - |
      /kaniko/executor \
        --context $CI_PROJECT_DIR \
        --dockerfile $CI_PROJECT_DIR/Dockerfile.minimal \
        --destination $CI_REGISTRY_IMAGE:hello-world-$IMAGE_TAG \
        --destination $CI_REGISTRY_IMAGE:hello-world-latest \
        --cache=true \
        --cache-ttl=24h
```

#### 代替解決策（参考）

DinDを使用する場合は、GitLab Runnerの設定で特権モードを有効にする必要があります：

```toml
[[runners]]
  [runners.docker]
    privileged = true
```

または、`.gitlab-ci.yml`で以下のように設定：

```yaml
deploy-hello-world:
  image: docker:24
  services:
    - docker:dind
  variables:
    DOCKER_DRIVER: overlay2
    DOCKER_TLS_CERTDIR: ""
  before_script:
    - docker info  # Docker接続をテスト
```

**注意**: セキュリティポリシーにより特権モードを有効にできない場合は、Kanikoを使用する方法を推奨します。

---

## 🎯 次のアクション

### 現在の状況まとめ

✅ **完了済み:**
- 基盤構築（Docker、Terraform、CI/CD、ドキュメント）
- **MVP機能実装完了！** 以下の機能がすべて動作可能です：
  - ✅ ユーザー認証（ログイン・登録・セッション管理）
  - ✅ 商品一覧・詳細表示（検索・フィルタリング・ページネーション）
  - ✅ ショッピングカート（追加・更新・削除）
  - ✅ 注文処理（チェックアウト・注文履歴・キャンセル）
  - ✅ Redis キャッシュ連携
  - ✅ S3 画像ストレージ連携（LocalStack）
  - ✅ トランザクション処理（在庫管理）
  - ✅ レスポンシブUI

❌ **キャンセル済み（アーキテクチャ変更）:**
- ~~AWS ECS/RDS/ElastiCache へのデプロイ（イシュー #0）~~
- ~~CloudWatch 監視・ロギング（イシュー #12）~~
- 👉 **方針変更**: コンテナ構成（Docker Compose）での運用に変更

### 推奨される次のステップ

#### ステップ 1: ローカル環境で動作確認 ✨ 必須！

```bash
# 1. 依存サービスを起動
cd tutorial_ec_site_001_monolith
docker-compose up -d

# 2. 環境変数を設定
cd app
cp .env.example .env
# DATABASE_URL、REDIS_URL等を設定

# 3. データベース準備
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed  # サンプルデータ投入

# 4. アプリケーション起動
npm run dev

# 5. ブラウザで確認
# http://localhost:3000
```

#### ステップ 2: 管理者画面の実装（イシュー #16）

管理者用の商品CRUD、注文管理、ユーザー管理機能を実装します。

#### ステップ 3: コンテナ環境の監視設定（イシュー #17）

Prometheus + Grafana または ELKスタックで監視・ロギングを構築します。

### 今後の開発優先度

1. **P1（重要）:** イシュー #16 - 管理者画面実装（商品・注文・ユーザー管理）
2. **P2（強化）:** イシュー #17 - コンテナ環境向け監視とロギング
3. **P3（品質）:** イシュー #18, #13, #15 - UI/UX改善・テスト・セキュリティ対策

### 参考情報（保持）

TerraformコードとGitLab CI/CDパイプラインは、将来AWSにデプロイする可能性がある場合の参考資料として保持しています。

