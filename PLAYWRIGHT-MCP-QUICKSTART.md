# Playwright MCP クイックスタート 🚀

このガイドでは、最短でPlaywright MCPを使ってアプリケーションを操作開始できます。

## ⚡ 最速セットアップ（5分）

### ステップ 1: 依存関係インストール

```bash
cd /Users/s-konno/Documents/archtecture/tutorial_ec_site_001_monolith/app
npm install
```

### ステップ 2: Playwright ブラウザインストール

```bash
npx playwright install chromium
```

### ステップ 3: データベース起動

```bash
cd /Users/s-konno/Documents/archtecture/tutorial_ec_site_001_monolith
docker-compose up -d postgres redis
```

### ステップ 4: アプリケーション起動

```bash
cd /Users/s-konno/Documents/archtecture/tutorial_ec_site_001_monolith/app
npm run dev
```

ブラウザで http://localhost:3000 が開けることを確認してください。

### ステップ 5: Playwright MCP Server 起動（別ターミナル）

**新しいターミナルウィンドウを開いて**以下を実行：

```bash
npx @playwright/mcp --port 9323
```

このターミナルは開いたままにしておきます。

### ステップ 6: Cursor で試す

Cursor のチャットで以下を試してください：

```
http://localhost:3000 を開いて、ページのスクリーンショットを撮ってください
```

## 🎮 よく使う操作例

### ページ移動とスクリーンショット

```
ログインページに移動して、スクリーンショットを撮影してください
```

### フォーム入力

```
ログインフォームに以下を入力してください：
- メールアドレス: test@example.com
- パスワード: password123
```

### クリック操作

```
商品一覧ページで、最初の商品カードをクリックしてください
```

### 複雑なシナリオ

```
以下の手順を実行してください：
1. 商品一覧ページに移動
2. 最初の商品をクリック
3. 「カートに追加」ボタンをクリック
4. カートページに移動
5. スクリーンショットを撮影
```

## 🔧 トラブルシューティング

### エラー: "Cannot connect to MCP server"

→ Playwright MCP Server が起動しているか確認
```bash
lsof -i :9323
```

### エラー: "Application not found"

→ Next.js が起動しているか確認
```bash
lsof -i :3000
```

### エラー: "Browser not installed"

→ Playwright ブラウザをインストール
```bash
npx playwright install chromium
```

## 📦 必要なプロセス（起動状態を保つ）

1. **Docker Compose** - PostgreSQL と Redis
   ```bash
   docker-compose up -d postgres redis
   ```

2. **Next.js サーバー** - アプリケーション本体
   ```bash
   npm run dev
   ```

3. **Playwright MCP Server** - 別ターミナルで
   ```bash
   npx @playwright/mcp --port 9323
   ```

## 🎯 次のステップ

詳細なセットアップ手順は [PLAYWRIGHT-MCP-SETUP.md](./PLAYWRIGHT-MCP-SETUP.md) を参照してください。

## 🧹 クリーンアップ

作業終了時：

```bash
# Next.js サーバー停止（Ctrl+C）
# Playwright MCP Server 停止（Ctrl+C）

# Docker コンテナ停止
docker-compose down
```

