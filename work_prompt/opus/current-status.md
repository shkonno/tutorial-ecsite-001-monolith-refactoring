# 現状分析

## テスト資産の状態

### E2Eテスト

| ファイル | 内容 | 品質評価 |
|----------|------|----------|
| `tests/user-flow.spec.ts` | ユーザー登録/ログイン/商品閲覧/カート追加/チェックアウト | フレーク要因あり |
| `tests/e2e-navigation/shop-pages.spec.ts` | ショップページのナビゲーション | 安定 |
| `tests/e2e-navigation/auth-pages.spec.ts` | 認証ページのナビゲーション | 安定 |
| `tests/e2e-navigation/admin-pages.spec.ts` | 管理ページのナビゲーション | 安定 |
| `tests/bug-fixes.spec.ts` | バグ修正シナリオ | - |

### フレーク要因（user-flow.spec.ts）

1. **waitForTimeout依存**: 固定時間待ちが多い（1000ms等）
2. **曖昧なセレクタ**: `'[class*="product"], article, .card'` のような複合セレクタ
3. **検証スキップ**: `isVisible().catch(() => false)` でエラーを握りつぶし
4. **Given-When-Then形式ではない**: 仕様書としての読みやすさが低い

### ユニットテスト

| ファイル | 内容 | 品質評価 |
|----------|------|----------|
| `tests/unit/actions/cart.test.ts` | カート操作（addToCart, updateCartItem, removeFromCart, clearCart, getCartItemCount, getCartItems） | 高品質（540行） |

**カバレッジ**:
- 認証チェック ✓
- 権限チェック ✓
- 在庫チェック ✓
- 正常系/異常系 ✓

### 結合テスト

| ファイル | 内容 | 品質評価 |
|----------|------|----------|
| `tests/integration/api/products.test.ts` | GET /api/products（一覧取得、カテゴリ絞り込み、検索、ページネーション） | モック使用（真の結合テストではない） |

**課題**:
- Prisma/Redisをモックしているため「ユニットテスト」に近い
- 実際のDB/Redisを使った結合テストがない

---

## I/O境界の構造

### lib/ 配下

| ファイル | 役割 | 依存先 |
|----------|------|--------|
| `lib/db.ts` | Prisma DB接続 | PostgreSQL |
| `lib/redis.ts` | Redis接続（キャッシュ/セッション） | Redis |
| `lib/auth.ts` | 認証（NextAuth） | DB, セッション |
| `lib/s3.ts` | S3ファイルストレージ | AWS S3 / LocalStack |
| `lib/rateLimit.ts` | レート制限 | Redis |
| `lib/metrics.ts` | メトリクス収集 | - |

### lib/actions/ 配下（Server Actions）

| ファイル | 役割 | I/O依存 |
|----------|------|---------|
| `lib/actions/cart.ts` | カート操作 | DB, Auth |
| `lib/actions/product.ts` | 商品操作 | DB |
| `lib/actions/order.ts` | 注文操作 | DB, Auth |
| `lib/actions/admin.ts` | 管理者操作 | DB, Auth, S3 |

### app/api/ 配下（API Routes）

| エンドポイント | 役割 | I/O依存 |
|----------------|------|---------|
| `/api/products` | 商品一覧 | DB, Redis(cache) |
| `/api/products/[id]` | 商品詳細 | DB |
| `/api/cart` | カート操作 | DB, Auth |
| `/api/auth/[...nextauth]` | 認証 | DB |
| `/api/upload` | ファイルアップロード | S3 |
| `/api/metrics` | メトリクス | - |

---

## ドキュメント構造

### docs/ 配下

```
docs/
├── AI-models/           # AIモデル関連
├── architecture/        # アーキテクチャ
│   ├── decisions/       # ADR（1件あり）
│   └── OVERVIEW.md
├── Demo/                # デモ画像
├── getting-started/     # 開始手順
├── operations/          # 運用
│   ├── deployment/
│   ├── testing/
│   └── troubleshooting.md
├── product/             # プロダクト管理
│   ├── bug-fixes.md
│   ├── issues-and-todos.md
│   └── roadmap.md
├── references/          # リファレンス
│   ├── api/
│   ├── glossary.md
│   └── tech-stack.md
└── ui/                  # UI関連
```

### 課題
- `docs/`に残す基準（昇格ルール）が未定義
- 散在しているドキュメントの索引がない

