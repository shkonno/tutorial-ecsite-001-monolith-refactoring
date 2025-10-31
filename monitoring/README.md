# 監視・ロギング設定

## 概要
このディレクトリには、Prometheus と Grafana の設定ファイルが含まれています。

## アクセス先

### Prometheus
- URL: http://localhost:9090
- メトリクスの収集と保存を担当

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
│   └── prometheus.yml        # Prometheus設定ファイル
└── grafana/
    └── datasources/
        └── prometheus.yml    # Grafanaデータソース設定
```

## 使用方法

### サービスの起動

```bash
docker-compose up -d prometheus grafana
```

### Prometheusへのアクセス

1. ブラウザで http://localhost:9090 を開く
2. Status > Targets で監視対象を確認

### Grafanaへのアクセス

1. ブラウザで http://localhost:3001 を開く
2. admin/admin でログイン
3. Dashboards で可視化を作成

## 監視対象

現在の設定では、以下のサービスを監視対象としています：

- Prometheus自身
- Node Exporter（システムメトリクス）※後で追加
- PostgreSQL Exporter（DB メトリクス）※後で追加
- Redis Exporter（キャッシュメトリクス）※後で追加
- Next.js アプリケーション（アプリメトリクス）※後で追加

## 次のステップ

- [ ] Node Exporter の追加（システムメトリクス）
- [ ] PostgreSQL Exporter の追加（DBメトリクス）
- [ ] Redis Exporter の追加（キャッシュメトリクス）
- [ ] アプリケーションメトリクスエンドポイントの実装
- [ ] Grafanaダッシュボードの作成
- [ ] アラートルールの設定

