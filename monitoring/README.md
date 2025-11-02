# 監視・ロギング設定

## 概要
このディレクトリには、Prometheus と Grafana の設定ファイルが含まれています。

## アクセス先

### Prometheus
- URL: http://localhost:9090
- メトリクスの収集と保存を担当
- アラートルールの評価

### Grafana
- URL: http://localhost:3001
- ユーザー名: `admin`
- パスワード: `admin`
- メトリクスの可視化を担当

## ディレクトリ構成

```
monitoring/
├── README.md
├── prometheus/
│   ├── prometheus.yml        # Prometheus設定ファイル
│   └── alert.rules.yml       # アラートルール定義
└── grafana/
    ├── datasources/
    │   └── prometheus.yml    # Grafanaデータソース設定
    └── dashboards/
        ├── dashboards.yml    # ダッシュボードプロビジョニング設定
        ├── system-dashboard.json   # システムメトリクスダッシュボード
        └── app-dashboard.json      # アプリメトリクスダッシュボード
```

## 使用方法

### サービスの起動

```bash
docker-compose up -d
```

これにより以下のサービスが起動します：
- Prometheus（ポート 9090）
- Grafana（ポート 3001）
- Node Exporter（ポート 9100）
- PostgreSQL Exporter（ポート 9187）
- Redis Exporter（ポート 9121）

### Prometheusへのアクセス

1. ブラウザで http://localhost:9090 を開く
2. Status > Targets で監視対象を確認
3. Alerts でアラート状態を確認

### Grafanaへのアクセス

1. ブラウザで http://localhost:3001 を開く
2. admin/admin でログイン
3. Dashboards から以下のダッシュボードにアクセス：
   - **システムメトリクス**: CPU、メモリ、ディスク、ネットワーク
   - **アプリケーションメトリクス**: HTTPリクエスト、レスポンスタイム、注文数、キャッシュヒット率

## 監視対象

### システムメトリクス（Node Exporter）
- CPU使用率
- メモリ使用率
- ディスク使用率
- ネットワークトラフィック

### データベースメトリクス（PostgreSQL Exporter）
- 接続数
- クエリ実行時間
- トランザクション数

### キャッシュメトリクス（Redis Exporter）
- メモリ使用量
- キー数
- ヒット/ミス率

### アプリケーションメトリクス（Next.js）
- HTTPリクエスト数
- HTTPレスポンスタイム
- 注文数
- カート追加数
- 商品閲覧数
- ユーザー登録/ログイン数
- キャッシュヒット/ミス

## アラート設定

### システムアラート
- **HighCPUUsage**: CPU使用率が80%を超えた場合
- **HighMemoryUsage**: メモリ使用率が85%を超えた場合
- **HighDiskUsage**: ディスク使用率が80%を超えた場合

### アプリケーションアラート
- **HighHTTPErrorRate**: HTTPエラー率が5%を超えた場合
- **HighResponseTime**: P95レスポンスタイムが2秒を超えた場合
- **LowCacheHitRate**: キャッシュヒット率が50%を下回った場合

### データベースアラート
- **HighDatabaseConnections**: PostgreSQL接続数が80を超えた場合
- **DatabaseDown**: PostgreSQLに接続できない場合

### Redisアラート
- **HighRedisMemoryUsage**: Redisメモリ使用率が80%を超えた場合
- **RedisDown**: Redisに接続できない場合

## ログ設定

### ログローテーション
すべてのコンテナで以下の設定が適用されています：
- ドライバー: json-file
- 最大ファイルサイズ: 10MB
- 最大ファイル数: 3（合計30MB）

### ログの確認

```bash
# アプリケーションログ
docker logs ecommerce-app

# データベースログ
docker logs ecommerce-db

# Redisログ
docker logs ecommerce-redis
```

## カスタムメトリクスの追加

### Next.jsアプリケーション
`lib/metrics.ts` でメトリクスを定義し、各機能で記録します。

例:
```typescript
import { ordersCreated } from '@/lib/metrics'

// 注文作成時
ordersCreated.inc({ status: 'PENDING' })
```

### メトリクスの確認
http://localhost:3000/api/metrics でPrometheus形式のメトリクスが取得できます。

## トラブルシューティング

### Prometheusがターゲットに接続できない
```bash
# コンテナのネットワーク接続を確認
docker network inspect ecommerce-network

# exporterのログを確認
docker logs ecommerce-node-exporter
docker logs ecommerce-postgres-exporter
docker logs ecommerce-redis-exporter
```

### Grafanaダッシュボードが表示されない
```bash
# Grafanaログを確認
docker logs ecommerce-grafana

# ダッシュボード設定を再読み込み
docker restart ecommerce-grafana
```

## 参考資料
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Node Exporter](https://github.com/prometheus/node_exporter)
- [PostgreSQL Exporter](https://github.com/prometheus-community/postgres_exporter)
- [Redis Exporter](https://github.com/oliver006/redis_exporter)

