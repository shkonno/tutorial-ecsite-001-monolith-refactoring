# Playwright MCP セットアップガイド

このガイドでは、Playwright MCPを使用してアプリケーションをCursorチャットから操作する方法を説明します。

## 📋 前提条件

- Node.js 20+
- Cursor エディタ
- Docker & Docker Compose（データベースとRedisの起動用）

## 🔧 セットアップ手順

### 1. Cursor Settings の MCP Server 設定

Cursor の設定ファイルに以下の MCP Server 設定を追加してください：

**macOS/Linux**: `~/.cursor/mcp.json`  
**Windows**: `%APPDATA%\Cursor\mcp.json`

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest"
      ]
    }
  }
}
```

または、Cursor Settings の GUI から：
1. `Settings` > `Features` > `MCP Servers` を開く
2. 上記の JSON 設定を追加

### 2. 依存関係のインストール

```bash
cd /Users/s-konno/Documents/archtecture/tutorial_ec_site_001_monolith/app
npm install
```

これにより以下のパッケージがインストールされます：
- `playwright@1.52.0` - ブラウザ自動化ツール
- `@playwright/mcp@1.52.0-alpha-2025-03-26` - Playwright MCP サーバー
- `http-server@^14.1.1` - 静的ファイルサーバー

### 3. Playwright MCP Server の起動

**重要**: Playwright MCP Server は、Cursor のターミナルではなく、**別のターミナルウィンドウ**から起動してください。

```bash
npx @playwright/mcp --port 9323
```

このコマンドは起動したままにしておいてください。

### 4. アプリケーションの起動

#### オプション A: Next.js 開発サーバーを使用（推奨）

データベースとRedisを起動：
```bash
cd /Users/s-konno/Documents/archtecture/tutorial_ec_site_001_monolith
docker-compose up -d postgres redis
```

Next.js アプリケーションを起動：
```bash
cd /Users/s-konno/Documents/archtecture/tutorial_ec_site_001_monolith/app
npm run dev
```

アプリケーションは `http://localhost:3000` でアクセス可能です。

#### オプション B: http-server を使用（静的ファイル配信）

ビルド済みアプリケーションを配信する場合：

```bash
cd /Users/s-konno/Documents/archtecture/tutorial_ec_site_001_monolith/app
npm run build
npm run serve
```

アプリケーションは `http://localhost:8080` でアクセス可能です。

## 🎯 Cursor チャットから操作

Playwright MCP Server が起動している状態で、Cursor のチャットから以下のような指示を出せます：

### 基本的な操作例

```
ブラウザで http://localhost:3000 を開いてください
```

```
ログインページに移動して、スクリーンショットを撮ってください
```

```
商品一覧ページで最初の商品をクリックしてください
```

```
カートに商品を追加して、チェックアウトページまで進んでください
```

### 利用可能な MCP ツール

Playwright MCP は以下のようなツールを提供します：

- `mcp_chrome-devtools_navigate_page` - ページへの移動
- `mcp_chrome-devtools_click` - 要素のクリック
- `mcp_chrome-devtools_fill` - フォーム入力
- `mcp_chrome-devtools_take_screenshot` - スクリーンショット撮影
- `mcp_chrome-devtools_take_snapshot` - ページのスナップショット取得
- その他多数...

詳細は Playwright MCP のドキュメントを参照してください。

## 🐛 トラブルシューティング

### Playwright MCP Server に接続できない

1. Playwright MCP Server が起動しているか確認
   ```bash
   # ポート 9323 が使用されているか確認
   lsof -i :9323
   ```

2. MCP Server を再起動
   ```bash
   # Ctrl+C で停止後、再起動
   npx @playwright/mcp --port 9323
   ```

3. Cursor を再起動

### アプリケーションにアクセスできない

1. Next.js サーバーが起動しているか確認
   ```bash
   lsof -i :3000
   ```

2. データベースとRedisが起動しているか確認
   ```bash
   docker ps | grep -E 'postgres|redis'
   ```

3. 環境変数が正しく設定されているか確認
   ```bash
   cat /Users/s-konno/Documents/archtecture/tutorial_ec_site_001_monolith/app/.env
   ```

### ブラウザが起動しない

1. Playwright のブラウザをインストール
   ```bash
   npx playwright install chromium
   ```

## 📚 参考資料

- [Playwright Documentation](https://playwright.dev/)
- [Playwright MCP GitHub](https://github.com/microsoft/playwright-mcp)
- [Cursor MCP Documentation](https://docs.cursor.com/advanced/mcp)

## 📝 注意事項

- `npm test` コマンドは使用しません。すべての操作は Cursor チャットから Playwright MCP Server を通じて行います。
- Playwright MCP Server は常に別ターミナルで起動しておく必要があります。
- テスト実行ではなく、インタラクティブなブラウザ操作が主な用途です。

