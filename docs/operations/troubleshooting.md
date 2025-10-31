# トラブルシューティングガイド

よくある障害と対応策をカテゴリ別にまとめています。新しい事象が発生したらここに追記してください。

## アプリケーションが起動しない
- `npm run dev` でエラー → 依存関係を再インストール (`npm install`)し、`node` のバージョンを確認
- `next` のビルドで失敗 → エラーログを読み、`app/` 配下で `npm run lint` を実行して静的エラーを洗い出す

## コンテナ関連
- Compose 起動に失敗 → `docker compose ps -a` と `docker compose logs <service>` で原因を特定
- LocalStack の初期化失敗 → `scripts/localstack/bootstrap.sh` を手動で再実行

## データベース
- 接続エラー → `docker compose logs db` を確認し、`DATABASE_URL` のドライバー/ホスト/ポート/ユーザー名を見直す
- マイグレーション失敗 → `npx prisma migrate reset` でリセットし、再度 `migrate dev` を実行

## 認証・セッション
- NextAuth の Configuration Error → `.env` の `NEXTAUTH_SECRET` と `NEXTAUTH_URL` を確認
- Redis が落ちている → `docker compose restart redis` を実行し、`REDIS_URL` が正しいか検証

## AWS/外部サービス
- LocalStack 経由のS3アップロードが失敗 → `awslocal s3 ls` でバケットの存在を確認し、署名付きURLの有効期限を見直す
- 本番S3で403 → IAMロールに必要なポリシーが含まれているか `legacy-aws/DEPLOYMENT.md` を参照

### 参考
- ローカル開発全般: `../getting-started/local-development.md`
- 既知の不具合と修正状況: `../product/bug-fixes.md`
