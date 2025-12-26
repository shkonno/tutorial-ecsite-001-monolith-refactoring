# テストガイド

このプロジェクトには3種類のテストが実装されています：

1. **ユニットテスト** - Server Actionsのビジネスロジックをテスト
2. **統合テスト** - API Routeのエンドポイントをテスト
3. **E2Eテスト** - ユーザーフローとUI遷移をテスト

## セットアップ

### 依存関係のインストール

```bash
cd app
npm install
```

### 環境変数の設定

テスト用の環境変数は `vitest.setup.ts` と `playwright.config.ts` に設定されています。

## テストの実行

### すべてのテストを実行

```bash
# ユニット・統合テスト（Vitest）
npm test

# E2Eテスト（Playwright）
npm run test:e2e
```

### 個別のテストを実行

```bash
# ユニットテストのみ
npm run test:unit

# 統合テストのみ
npm run test:integration

# E2Eナビゲーションテストのみ
npm run test:e2e-navigation

# ユーザーフローE2Eテスト
npx playwright test tests/user-flow.spec.ts
```

### テストをwatch モードで実行

```bash
# Vitest watch モード
npm test -- --watch

# PlaywrightをUI モードで実行
npm run test:ui
```

### カバレッジレポートを生成

```bash
npm run test:coverage
```

## テストファイルの構成

```
app/
├── tests/
│   ├── unit/              # ユニットテスト
│   │   └── actions/       # Server Actionsのテスト
│   │       └── cart.test.ts
│   ├── integration/       # 統合テスト
│   │   └── api/          # API Routeのテスト
│   │       └── products.test.ts
│   ├── e2e-navigation/    # UI遷移E2Eテスト
│   │   ├── header.spec.ts
│   │   ├── auth-pages.spec.ts
│   │   ├── shop-pages.spec.ts
│   │   ├── admin-pages.spec.ts
│   │   └── mobile-navigation.spec.ts
│   ├── user-flow.spec.ts  # ユーザーフローE2Eテスト
│   ├── helpers/           # テストヘルパー
│   │   └── navigation-helpers.ts
│   └── __mocks__/         # モックファイル
│       └── mocks.ts
├── vitest.config.ts       # Vitest設定
├── vitest.setup.ts        # Vitestセットアップ
└── playwright.config.ts   # Playwright設定
```

## 1. ユニットテスト (Vitest)

Server Actionsのビジネスロジックをテストします。

### 実装済みテスト

- ✅ **Cart Actions** (`tests/unit/actions/cart.test.ts`)
  - カート追加
  - カート更新
  - カート削除
  - カートクリア
  - カート数取得
  - カートアイテム取得

### テストの追加方法

1. `tests/unit/` ディレクトリに新しいテストファイルを作成
2. モックを設定（`tests/__mocks__/mocks.ts` を参照）
3. テストケースを記述

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: {
    // モック実装
  },
}))

describe('My Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should work correctly', async () => {
    // テストコード
  })
})
```

## 2. 統合テスト (Vitest + Next.js API Routes)

API Routeのエンドポイントをテストします。

### 実装済みテスト

- ✅ **Products API** (`tests/integration/api/products.test.ts`)
  - 商品一覧取得
  - カテゴリフィルタリング
  - 検索機能
  - ページネーション
  - エラーハンドリング

### テストの追加方法

1. `tests/integration/api/` ディレクトリに新しいテストファイルを作成
2. NextRequestオブジェクトを作成してAPIハンドラをテスト

```typescript
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/your-endpoint/route'

it('should return data', async () => {
  const request = new NextRequest('http://localhost:3000/api/your-endpoint')
  const response = await GET(request)
  const data = await response.json()
  
  expect(response.status).toBe(200)
  expect(data).toBeDefined()
})
```

## 3. E2Eテスト (Playwright)

### 3.1. UI遷移テスト (Issue #52)

すべてのページのナビゲーションとUI要素をテストします。

**テストファイル:**
- `tests/e2e-navigation/header.spec.ts` - ヘッダーナビゲーション
- `tests/e2e-navigation/auth-pages.spec.ts` - 認証ページ
- `tests/e2e-navigation/shop-pages.spec.ts` - ショップページ
- `tests/e2e-navigation/admin-pages.spec.ts` - 管理者ページ
- `tests/e2e-navigation/mobile-navigation.spec.ts` - モバイルナビゲーション

**実行方法:**
```bash
npm run test:e2e-navigation
npm run test:e2e-navigation:headed  # ブラウザを表示
npm run test:e2e-navigation:debug   # デバッグモード
```

### 3.2. ユーザーフローテスト (Issue #45)

主要なユーザーフローをエンドツーエンドでテストします。

**テストファイル:**
- `tests/user-flow.spec.ts`

**テスト対象:**
- ユーザー登録
- ログイン・ログアウト
- 商品閲覧・カート追加
- チェックアウト・注文

**実行方法:**
```bash
npx playwright test tests/user-flow.spec.ts
npx playwright test tests/user-flow.spec.ts --headed
```

## デバッグ

### Vitest

```bash
# デバッグ情報を表示
npm test -- --reporter=verbose

# 特定のテストのみ実行
npm test -- cart.test.ts

# Watch モード
npm test -- --watch
```

### Playwright

```bash
# UIモードで実行（インタラクティブ）
npx playwright test --ui

# デバッグモード
npx playwright test --debug

# 特定のブラウザで実行
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# ヘッドレスモードを無効化
npx playwright test --headed

# スクリーンショットとトレースを保存
npx playwright test --trace on
```

## レポート

### Vitest

カバレッジレポートは `coverage/` ディレクトリに生成されます。

```bash
npm run test:coverage
open coverage/index.html  # macOS
```

### Playwright

テストレポートは `playwright-report/` ディレクトリに生成されます。

```bash
npm run test:report
```

## CI/CD統合

### GitHub Actions

CI（lint/typecheck/vitest）は `.github/workflows/ci.yml` で実行します。
E2Eは現状フレーク要因が残り得るため、手動実行の `.github/workflows/e2e.yml` に分離しています。

```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test

  e2e-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

## ベストプラクティス

### ユニットテスト

- 各テストケースは独立して実行可能にする
- モックを適切に使用してテストを高速化
- エッジケースをテストする
- `beforeEach` でモックをクリアする

### 統合テスト

- 実際のHTTPリクエスト/レスポンスをテスト
- エラーハンドリングをテスト
- 認証・認可をテスト
- ページネーションやフィルタリングをテスト

### E2Eテスト

- ユーザーの視点でテストを書く
- 適切な待機（`waitForSelector`, `waitForURL`）を使用
- テストデータを適切に管理
- スクリーンショットを活用
- フレイキー（不安定）なテストを避ける

## トラブルシューティング

### Vitestのエラー

**問題:** `Cannot find module '@/lib/db'`

**解決策:**
- `vitest.config.ts` の `resolve.alias` を確認
- パスエイリアスが正しく設定されているか確認

### Playwrightのエラー

**問題:** `Timeout 30000ms exceeded`

**解決策:**
- `waitForSelector` のタイムアウトを増やす
- `page.waitForLoadState('networkidle')` を使用
- `playwright.config.ts` のタイムアウト設定を調整

**問題:** ブラウザがインストールされていない

**解決策:**
```bash
npx playwright install --with-deps
```

## 関連Issue

- **Issue #42**: Server Actionsのユニットテスト
- **Issue #43**: API Routeの統合テスト
- **Issue #44**: E2Eテストのセットアップ
- **Issue #45**: E2Eテストの実装
- **Issue #52**: フロントエンドUI遷移の網羅的E2Eテスト

## 参考資料

- [Vitest公式ドキュメント](https://vitest.dev/)
- [Playwright公式ドキュメント](https://playwright.dev/)
- [Testing Library公式ドキュメント](https://testing-library.com/)

