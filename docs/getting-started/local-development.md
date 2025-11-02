# ローカル開発ガイド

ローカル環境でアプリケーションを動作させるための補足手順です。`QUICKSTART.md` でセットアップが完了していることを前提に、日常開発でよく使うコマンドやトラブル時の確認ポイントをまとめています。

## よく使うコマンド

```bash
# Next.js 開発サーバー
npm run dev

# Prisma マイグレーションの適用
npx prisma migrate dev

# シードデータ投入
npm run db:seed
```

## サービス状態の確認

- コンテナ: `docker-compose ps`
- DB接続: `npx prisma studio`
- LocalStack: `docker logs -f ecommerce-localstack`

## 典型的なトラブル

- 環境変数が読み込まれない → `.env` が `app/` 配下に存在するか確認
- DB接続エラー → `docker-compose logs db` を確認し、再起動 (`docker-compose restart db`)
- LocalStack 初期化失敗 → `docker-compose restart localstack` 後に `scripts/localstack/bootstrap.sh` を再実行

詳細なトラブルシューティングは `../operations/troubleshooting.md` を参照してください。
