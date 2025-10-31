# アーキテクチャ概要

現在のシステムは Next.js モノリスを基盤とし、コンテナランタイム上で API・フロントエンドを一体運用しています。インフラ構成の全体像は `current-architecture.drawio` を参照してください。

## コア要素

- **アプリケーション**: Next.js 16 (App Router) + Prisma + NextAuth
- **データストア**: PostgreSQL / Redis
- **オブジェクトストレージ**: S3（LocalStackまたは本番AWS）
- **配信**: 単一コンテナを ALB or Ingress 経由で公開

## 環境ごとの特徴

| 環境 | 特徴 | 備考 |
|------|------|------|
| ローカル | Docker Compose で全サービスを起動 | LocalStackでAWSサービスをエミュレート |
| 検証/本番（コンテナ） | 任意のコンテナランタイム | `CONTAINER-DEPLOYMENT.md` を参照 |
| 過去の AWS Fargate | Terraform + GitHub Actions | `legacy-aws/DEPLOYMENT.md` を参照 |

## 参考資料

- アーキテクチャ図: `current-architecture.drawio`
- 詳細仕様: `pattern-1-monolith.md`
- 意思決定ログ: `decisions/ADR-001-container-shift.md`
