# アーキテクチャ図（Draw.io形式）

このディレクトリには、各パターンのアーキテクチャ図がdraw.io形式で格納されています。

## 📊 図の一覧

### アーキテクチャパターン図

| ファイル | 説明 | 編集 |
|---------|------|------|
| [pattern-1-monolith.drawio](./pattern-1-monolith.drawio) | Pattern 1: モノリス + コンテナ | [draw.ioで開く](https://app.diagrams.net/?open=https://raw.githubusercontent.com/yourorg/ecommerce-planning/main/planning/diagrams/pattern-1-monolith.drawio) |
| [pattern-2-three-tier.drawio](./pattern-2-three-tier.drawio) | Pattern 2: 3-Tier アーキテクチャ | [draw.ioで開く](https://app.diagrams.net/?open=https://raw.githubusercontent.com/yourorg/ecommerce-planning/main/planning/diagrams/pattern-2-three-tier.drawio) |
| [pattern-3-microservices.drawio](./pattern-3-microservices.drawio) | Pattern 3: マイクロサービス (EKS) | [draw.ioで開く](https://app.diagrams.net/?open=https://raw.githubusercontent.com/yourorg/ecommerce-planning/main/planning/diagrams/pattern-3-microservices.drawio) |
| [pattern-4-event-driven.drawio](./pattern-4-event-driven.drawio) | Pattern 4: イベント駆動 + ハイブリッド | [draw.ioで開く](https://app.diagrams.net/?open=https://raw.githubusercontent.com/yourorg/ecommerce-planning/main/planning/diagrams/pattern-4-event-driven.drawio) |

### リポジトリ構成図

| ファイル | 説明 | 編集 |
|---------|------|------|
| [repository-overview.drawio](./repository-overview.drawio) | マルチリポジトリ構成全体図 | [draw.ioで開く](https://app.diagrams.net/?open=https://raw.githubusercontent.com/yourorg/ecommerce-planning/main/planning/diagrams/repository-overview.drawio) |

## 🎨 Draw.ioの使い方

### オンライン編集

1. 上記の「draw.ioで開く」リンクをクリック
2. ブラウザで [app.diagrams.net](https://app.diagrams.net/) が開きます
3. 編集後、ファイルをダウンロードして上書き保存

### ローカル編集

#### VSCode拡張機能（推奨）

1. VSCodeに拡張機能をインストール:
   ```
   Draw.io Integration (hediet.vscode-drawio)
   ```

2. `.drawio`ファイルをVSCodeで開く
3. そのまま編集・保存可能

#### デスクトップアプリ

1. [draw.io Desktop](https://github.com/jgraph/drawio-desktop/releases) をインストール
2. `.drawio`ファイルを開いて編集

## 🔄 図の更新フロー

1. **ローカルで編集**
   ```bash
   # VSCodeまたはdraw.io Desktopで編集
   code pattern-1-monolith.drawio
   ```

2. **コミット・プッシュ**
   ```bash
   git add diagrams/
   git commit -m "Update architecture diagram for Pattern 1"
   git push
   ```

3. **Pull Requestでレビュー**
   - 図の変更を確認
   - 必要に応じてフィードバック

## 📐 図の規約

### レイヤー構造

各図は以下のレイヤーで構成されています：

1. **Infrastructure Layer**: VPC, Subnet, Security Groups
2. **Compute Layer**: ECS, EKS, Lambda
3. **Data Layer**: RDS, DynamoDB, ElastiCache, S3
4. **Network Layer**: ALB, API Gateway, CloudFront
5. **Monitoring Layer**: CloudWatch, X-Ray

### 色の使い分け

| 色 | 用途 |
|----|------|
| 🔵 青系 (#dae8fc) | ネットワーク・通信 |
| 🟢 緑系 (#d5e8d4) | アプリケーション・コンピューティング |
| 🟡 黄系 (#fff2cc) | ストレージ・データ |
| 🔴 赤系 (#f8cecc) | 重要・注意が必要な要素 |
| 🟣 紫系 (#e1d5e7) | メッセージング・イベント |

### AWS アイコン

図にはAWS公式アイコンを使用しています：

- [AWS Architecture Icons](https://aws.amazon.com/architecture/icons/)
- draw.io内蔵のAWSシェイプライブラリを使用
- `mxgraph.aws4.*` シェイプ

## 📝 図の命名規則

```
pattern-{番号}-{パターン名}.drawio
```

例：
- `pattern-1-monolith.drawio`
- `pattern-2-three-tier.drawio`
- `pattern-3-microservices.drawio`
- `pattern-4-event-driven.drawio`

## 🔍 図のバージョン管理

- Gitで図の変更履歴を管理
- 大きな変更は別ブランチで作業
- Pull Requestでレビュー後マージ

## 💡 Tips

### PNG/SVGエクスポート

draw.ioから画像としてエクスポート可能：

1. `File` → `Export as` → `PNG` / `SVG`
2. README等に埋め込む場合に使用

### 埋め込み用PNG生成

```bash
# draw.io CLIを使用（要インストール）
drawio -x -f png -o pattern-1-monolith.png pattern-1-monolith.drawio
```

### テンプレート活用

新しい図を作成する際は、既存の図をコピーして編集すると統一感が保てます。

## 🔗 関連ドキュメント

- [README](../README.md) - プロジェクト全体概要
- [Pattern 1 詳細](../pattern-1-monolith.md)
- [Pattern 2 詳細](../pattern-2-three-tier.md)
- [Pattern 3 詳細](../pattern-3-microservices.md)
- [Pattern 4 詳細](../pattern-4-event-driven.md)
- [リポジトリ構成](../repository-structure.md)

## 📮 フィードバック

図の改善提案やバグ報告は、GitHubのIssueでお願いします。

