# ADR テンプレート（レイヤードアーキ前提）

使い方: 「起票前クイックチェック」で起票要否を判断 → 起票する場合に本テンプレを記入 → 起票後タグで紐づきをマーク

- Title:  
- Status: Proposed / Accepted / Rejected / Superseded  
- Date: YYYY-MM-DD  
- Owner:  
- Scope / Layer: UI / Application / Domain / Infrastructure / Integration（該当を列挙）  
- Related UC / Issue: 例) UC0 I0-2, UC2 I2-2  

## Context（背景・問題・前提）

- 5歳児にも説明できる一文で問題を述べる  
- なぜ今決めるのか（トリガー: 例/ I/O境界変更、テスト戦略変更、外部API変更）  
- 現行設計の関連箇所（例: `docs/architecture/OVERVIEW.md`, `docs/architecture/pattern-1-monolith.md`, `docs/refacroting/refs/backbone-io-boundary.md`）  
- 制約（時間 / 安全 / 運用 / 互換性 / コスト / 人員）  
- レイヤードアーキの前提（触るレイヤと周辺レイヤへの影響を明記）  

## Decision Drivers（比較軸・重み付け任意）

| 軸 | 説明 | メモ | 評点(1-5) |
| --- | --- | --- | --- |
| 品質 | 変更容易性・テスタビリティ |  |  |
| 速度 | 実装リードタイム |  |  |
| 安全 | 失敗時影響・リスク |  |  |
| 運用 | 運用/監視/移行の容易さ |  |  |

## Options（最低3案、各レイヤへの影響を記載）

### Option A
- 概要:  
- Pros:  
- Cons:  
- リスク/軽減策:  
- 影響レイヤ: UI / App / Domain / Infra / Integration  
- テスト影響: 単体 / 結合 / E2E の方針  

### Option B
- 概要:  
- Pros:  
- Cons:  
- リスク/軽減策:  
- 影響レイヤ:  
- テスト影響:  

### Option C
- 概要:  
- Pros:  
- Cons:  
- リスク/軽減策:  
- 影響レイヤ:  
- テスト影響:  

## Decision（採用）

- 採用: Option __  
- 理由: 選定理由と非採用案を退けた理由を併記  
- スコープ: どこからどこまで適用するか、段階適用ならフェーズを明記  

## Consequences（結果/トレードオフ）

- 良くなること:  
- 失う/延期すること:  
- フォローアップ: タスク/マイグレーション/監視設定  
- 検証: どのテスト/計測で確認するか（Red/Green/Refactorの安全網）  
- ロールバック方針: いつ・どう戻すか、切り戻し条件  

## Links（関連・参照）

- 計画: `docs/refacroting/MASTER-PLAN.md`  
- 実行: `docs/refacroting/ISSUES-UC0-UC2.md`  
- 現行設計: `docs/architecture/OVERVIEW.md`, `docs/architecture/pattern-1-monolith.md`  
- 境界: `docs/refacroting/refs/backbone-io-boundary.md`  
- テスト方針: `docs/refacroting/refs/testing-strategy.md`  
- 他ADR: `docs/architecture/decisions/`  

## 起票判定クイックチェック（起票前の判断用）

以下の問いに答え、セキュリティ/プライバシー/コストのいずれかがYes、または3項目以上Yesなら起票する:

- 品質属性に影響するか（可用性/性能/変更容易性/運用性など）  
- I/O境界を変えるか（DB/Redis/外部APIの契約や依存形態）  
- テストゲートを変えるか（E2E/結合/ユニットの追加・削除・昇格）  
- セキュリティ/プライバシーに影響するか  
- コスト/スケール/運用方式に影響するか  

## 起票後タグ（起票後に該当をマーク）

- [ ] I/O境界の変更（DB/Redis/外部APIへの依存形態変更）  
- [ ] テスト戦略・ゲートの変更（E2E/結合/ユニットの追加・削除・昇格）  
- [ ] レイヤー間の責務移動・分割（App/Domain/Infra間の呼び方変更）  
- [ ] コスト/性能/スケールに影響する方針変更  
- [ ] セキュリティ・プライバシー影響がある変更  
- [ ] 運用/監視/ロールバック手順に変更が出る場合  

