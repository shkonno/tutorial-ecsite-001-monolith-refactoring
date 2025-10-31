# Docker環境管理スクリプト

このディレクトリには、Docker環境を簡単に管理するためのスクリプトが含まれています。

## 📁 スクリプト一覧

### `start.sh` - Docker環境の起動

全てのDockerコンテナを一括で起動します。

**機能:**
- ✅ Docker起動状態の確認
- ✅ 既存コンテナのクリーンアップ
- ✅ 全サービスのビルド・起動
- ✅ ヘルスチェック待機
- ✅ 起動確認とアクセス情報の表示

**使い方:**
```bash
# プロジェクトルートから実行
./scripts/start.sh

# または、scriptsディレクトリから実行
cd scripts
./start.sh
```

**起動されるサービス:**
- 🗄️ PostgreSQL (Port: 5432)
- 🔴 Redis (Port: 6379)
- ☁️ LocalStack (Port: 4566)
- ⚛️ Next.js App (Port: 3000)

---

### `stop.sh` - Docker環境の停止

全てのDockerコンテナを一括で停止します。

**機能:**
- ✅ 起動中のコンテナ確認
- ✅ 全サービスの停止・削除
- ✅ ネットワークのクリーンアップ

**使い方:**
```bash
# プロジェクトルートから実行
./scripts/stop.sh

# または、scriptsディレクトリから実行
cd scripts
./stop.sh
```

---

## 🚀 クイックスタート

### 初回起動
```bash
# 1. スクリプトに実行権限を付与（初回のみ）
chmod +x scripts/*.sh

# 2. Docker環境を起動
./scripts/start.sh

# 3. ブラウザでアクセス
open http://localhost:3000
```

### 停止
```bash
./scripts/stop.sh
```

### 再起動
```bash
./scripts/stop.sh
./scripts/start.sh
```

---

## 💡 便利なコマンド

### ログ確認
```bash
# 全サービスのログをリアルタイムで表示
docker-compose logs -f

# 特定のサービスのログのみ表示
docker-compose logs -f db
docker-compose logs -f redis
docker-compose logs -f localstack
docker-compose logs -f app
```

### データベース接続
```bash
# PostgreSQLに接続
docker exec -it ecommerce-db psql -U postgres -d ecommerce

# よく使うSQLコマンド
# \dt          - テーブル一覧
# \d users     - usersテーブルの構造
# \q           - 終了
```

### Redis接続
```bash
# Redisに接続
docker exec -it ecommerce-redis redis-cli

# よく使うRedisコマンド
# KEYS *       - 全キー一覧
# GET key      - キーの値を取得
# FLUSHALL     - 全データ削除
# exit         - 終了
```

### コンテナの状態確認
```bash
# 起動中のコンテナ一覧
docker-compose ps

# 詳細情報
docker-compose ps -a

# リソース使用状況
docker stats
```

### データ完全削除
```bash
# コンテナ + ボリューム（データ）を削除
docker-compose down -v

# コンテナ + ボリューム + イメージを削除
docker-compose down -v --rmi all
```

---

## ⚠️ トラブルシューティング

### Dockerが起動しない
```bash
# Dockerデーモンの状態確認
docker info

# Docker Desktopを再起動してください
```

### ポートが既に使用されている
```bash
# 使用中のポートを確認
lsof -i :3000
lsof -i :5432
lsof -i :6379
lsof -i :4566

# プロセスを停止してから再起動
```

### コンテナがhealthyにならない
```bash
# ログで詳細を確認
docker-compose logs db
docker-compose logs redis
docker-compose logs localstack

# 個別に再起動
docker-compose restart db
```

### データベースマイグレーションエラー
```bash
# アプリコンテナに入る
docker-compose exec app sh

# マイグレーションを手動実行
npx prisma migrate deploy
npx prisma db seed
```

---

## 📝 注意事項

- スクリプトは**プロジェクトルート**から実行することを推奨します
- `start.sh`は既存のコンテナを自動的に停止してから起動します
- データは**Dockerボリューム**に保存されるため、コンテナを停止してもデータは残ります
- データを完全に削除したい場合は`docker-compose down -v`を実行してください

---

## 🔧 カスタマイズ

スクリプトをカスタマイズしたい場合は、以下のファイルを編集してください：

- `scripts/start.sh` - 起動処理のカスタマイズ
- `scripts/stop.sh` - 停止処理のカスタマイズ
- `docker-compose.yml` - サービス構成の変更

