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
# プロジェクトルートから実行（推奨）
./scripts/start.sh

# ビルドしてから起動（コード変更後）
./scripts/start.sh --build

# または、scriptsディレクトリから実行
cd scripts
./start.sh
```

**起動されるサービス:**
- 🗄️ PostgreSQL (Port: 5432) - データベース
- 🔴 Redis (Port: 6379) - キャッシュ
- ☁️ LocalStack (Port: 4566) - AWS S3エミュレーター
- ⚛️ Next.js App (Port: 3000) - Webアプリケーション
- 📊 Node Exporter (Port: 9100) - システムメトリクス
- 📊 Redis Exporter (Port: 9121) - Redisメトリクス
- 📊 PostgreSQL Exporter (Port: 9187) - DBメトリクス

---

### `stop.sh` - Docker環境の停止

全てのDockerコンテナを一括で停止します。

**機能:**
- ✅ 起動中のコンテナ確認
- ✅ 全サービスの停止・削除
- ✅ ネットワークのクリーンアップ
- ✅ データ保持（デフォルト）
- ✅ データ削除オプション（--clean）

**使い方:**
```bash
# プロジェクトルートから実行（データは保持）
./scripts/stop.sh

# データも削除して停止
./scripts/stop.sh --clean

# または、scriptsディレクトリから実行
cd scripts
./stop.sh
```

---

### `reset.sh` - データベースのリセット

データベースとRedisを初期状態にリセットします。

**機能:**
- ✅ 全データの削除
- ✅ コンテナの再起動
- ✅ シードデータ投入（オプション）

**使い方:**
```bash
# データをリセット（空の状態）
./scripts/reset.sh

# データをリセットしてシードデータを投入
./scripts/reset.sh --seed
```

---

### `backup.sh` - データバックアップ

現在のデータベースとRedisの状態をバックアップします。

**機能:**
- ✅ PostgreSQLデータベースのダンプ
- ✅ Redisデータのバックアップ
- ✅ バックアップ情報の保存

**使い方:**
```bash
# 自動的に日時付きでバックアップ
./scripts/backup.sh

# バックアップ名を指定
./scripts/backup.sh my-backup-name
```

**バックアップ保存先:**
- `backups/<backup-name>/database.sql` - PostgreSQLダンプ
- `backups/<backup-name>/redis.rdb` - Redisデータ
- `backups/<backup-name>/info.txt` - バックアップ情報

---

### `restore.sh` - データリストア

バックアップからデータを復元します。

**機能:**
- ✅ PostgreSQLデータベースのリストア
- ✅ Redisデータのリストア
- ✅ アプリケーションの再起動

**使い方:**
```bash
# 利用可能なバックアップを確認
./scripts/restore.sh

# 指定したバックアップをリストア
./scripts/restore.sh backup-20250101-120000
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

### 通常の起動（2回目以降）
```bash
# 通常起動（既存イメージを使用、高速）
./scripts/start.sh

# コード変更後はビルドして起動
./scripts/start.sh --build
```

### 停止
```bash
# データを保持したまま停止（推奨）
./scripts/stop.sh

# データも削除して停止
./scripts/stop.sh --clean
```

### 再起動
```bash
# 完全な再起動（停止→起動）
./scripts/stop.sh
./scripts/start.sh

# または個別サービスの再起動
docker-compose restart app
docker-compose restart db
```

### データ管理
```bash
# バックアップ作成
./scripts/backup.sh

# データリセット（初期状態＋シードデータ）
./scripts/reset.sh --seed

# バックアップからリストア
./scripts/restore.sh backup-20250101-120000
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

