# ステップ1: 最小限のHello World Dockerテスト

## 目的
複雑な依存関係なしで、Dockerが動作することを確認する。

## ローカルでのテスト手順

### 1. 最小限のコンテナをビルド＆起動

```bash
# Dockerfile.minimalを使用してビルド
docker build -f Dockerfile.minimal -t hello-world:test .

# コンテナを起動
docker run -p 3000:3000 hello-world:test
```

または、docker-composeを使用：

```bash
# 最小限のdocker-composeで起動
docker-compose -f docker-compose.minimal.yml up --build
```

### 2. 動作確認

ブラウザで `http://localhost:3000` にアクセスして、Hello Worldが表示されることを確認。

### 3. 成功したら次のステップへ

- ✅ Dockerが動作することを確認
- ✅ 次はGitLab CI/CDでビルド＆プッシュをテスト
- ✅ それが成功したら、段階的に機能を追加

## トラブルシューティング

もしローカルで動かない場合：
- Docker Desktopが起動しているか確認
- `docker info`コマンドでDockerが正常に動作しているか確認
- ポート3000が既に使用されていないか確認（`lsof -i :3000`）

