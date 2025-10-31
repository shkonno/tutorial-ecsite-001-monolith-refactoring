# ADR-001: AWS Fargate から汎用コンテナ基盤への移行

- **Status**: Accepted
- **Date**: 2025-10-30

## Context

当初は AWS Fargate + Terraform + GitHub Actions を前提としていたが、学習コストと運用コストの観点から、より汎用的なコンテナ基盤（自前サーバーやマネージドKubernetes等）へ展開できるようにしたいニーズが高まった。

## Decision

- インフラの標準手順を「コンテナレジストリ + 任意のランタイム」ベースに再整理する
- AWS固有の手順は `operations/deployment/legacy-aws/` 以下でアーカイブとして維持する
- ドキュメントやサンプルスクリプトは可能な限りベンダーロックインを避けた記述に置き換える

## Consequences

- 新規参加メンバーはクラウドベンダーに依存せず学習できる
- 既存の Terraform コードは即時破棄せず、必要に応じて再利用可能な形で保管する
- CI/CD の再設計が必要となるため、将来的に GitHub Actions / GitLab CI いずれにも対応できる運用手順を用意する
