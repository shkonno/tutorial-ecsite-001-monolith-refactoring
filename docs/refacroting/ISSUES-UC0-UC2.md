# 実行用イシューリスト（UC0-UC2）

この文書は `docs/refacroting/MASTER-PLAN.md` に沿った **実行用チェックリスト** です。  
粒度は以下を目安にします。

- **ユースケース（UC）**: 〜2日で完了可能なまとまり（評価可能な流れ）
- **イシュー（Issue）**: 〜2時間で完了可能なまとまり
- **タスク（Task）**: 〜30分で完了可能な具体作業

共通チェック:

- [ ] ADR起票クイックチェックが必要か判定した（Yes→ADRテンプレ使用、No→不要）

---

## 参照（入口）

- 計画書: `docs/refacroting/MASTER-PLAN.md`
- テスト方針: `docs/refacroting/refs/testing-strategy.md`
- 背骨I/O境界: `docs/refacroting/refs/backbone-io-boundary.md`
- 現状分析: `docs/refacroting/refs/current-status.md`
- ドキュメント管理: `docs/refacroting/refs/document-management.md`

---

## UC0: ガードレール策定（迷子防止）

### I0-1: 作業時間計測ルール策定（2h）

- [x] T0-1-1: 計測カテゴリ定義（アクティブ/待ち/調査/割り込み）
- [x] T0-1-2: 記録テンプレ（1ユースケース=1レコード）を決める
- [x] T0-1-3: 記録場所と運用（更新頻度、集計の単位）を決める
- [x] T0-1-4: サンプル1件を作る（UC0自体をサンプルにする）

成果物（Living）:

- `docs/operations/work-time-tracking.md`

### I0-2: ADR運用ルール策定（2h）

- [x] T0-2-1: ADRテンプレの項目を確定（Context/Options/Decision/Consequences）
- [x] T0-2-2: 3案比較の軸（品質/速度/安全/運用）を固定
- [x] T0-2-3: ADRが必要になるトリガーを定義（例: I/O境界変更、テスト戦略変更）
- [x] T0-2-4: 例（サンプルADR）を1件書く（小さくてOK）

成果物（Living）:

- `docs/architecture/decisions/ADR-TEMPLATE.md`

### I0-3: ドキュメント昇格ルールと索引（2h）

- [x] T0-3-1: 昇格基準（仕様/運用/ADR/現行アーキ）を確定
- [x] T0-3-2: `docs/README.md` に「背骨計画/テスト戦略/参照ログ」への導線を追加する方針を決める
- [x] T0-3-3: 参照ログ（Document Ledger）の更新ルールを確定
- [x] T0-3-4: 削除候補リストの運用（即削除しない）を確認

成果物（Living/運用）:

- `docs/refacroting/refs/document-management.md`
- （必要なら）`docs/README.md`

---

## UC1: 背骨E2E仕様化・安定化

### I1-1: 既存E2Eの棚卸し（2h）

対象:

- `app/tests/user-flow.spec.ts`

観測済みの主なフレーク要因（現状）:

- `waitForTimeout(...)`: **6箇所**
- `isVisible().catch(() => false)`: **6箇所**
- 弱い/曖昧なセレクタ（例: `[class*="product"], article, .card`）: **10箇所**

分類テンプレ（棚卸しの出力フォーマット）:

| カテゴリ | 典型パターン | 問題 | 置き換え方針（例） |
|---|---|---|---|
| 固定待ち | `waitForTimeout(1000)` | 環境差で不安定、遅い | 「待つべき状態」へ（例: `expect(toast).toBeVisible()`、`toHaveURL`） |
| 弱いセレクタ | `[class*=\"product\"], article, .card` | DOM変更に弱い/誤爆 | `getByRole`/`getByLabel`/`data-testid` へ |
| 失敗握りつぶし | `isVisible().catch(() => false)` | 本来失敗すべきケースが通る | `await expect(locator).toBeVisible()` にする |
| 条件付きアクション | `if (await button.isVisible()) { click }` | 何もしなくても成功し得る | 「存在するはず」を表現してから操作（可視性をexpect） |
| 状態待ちの粗さ | `waitForLoadState('networkidle')` | 不安定/過剰待ち | 表示される要素/レスポンスを待つ（`toBeVisible` 等） |

- [ ] T1-1-1: 「背骨（商品一覧→詳細→追加→表示）」に該当する部分を抽出
- [ ] T1-1-2: 固定待ち（waitForTimeout）を列挙し「待つべき状態」へ置換候補を考える
- [ ] T1-1-3: セレクタを列挙し、安定セレクタ候補（role/name, data-testid）に置換案を作る
- [ ] T1-1-4: 例外握りつぶし（isVisible().catch）を列挙し、仕様としての期待に置き換える方針を決める

### I1-2: 背骨E2Eを1本に再構成（2h + 2h）

方針:

- Given-When-Thenで「仕様書」として読める
- セレクタは **role/name → data-testid → 最後にCSS**
- 待機は「状態待ち」中心（固定待ち削減）
- 失敗は握りつぶさない

- [ ] T1-2-1: 背骨E2Eの章立て（Given/When/Then）を決める
- [ ] T1-2-2: 安定セレクタ方針を決める（data-testid導入が必要かも判断）
- [ ] T1-2-3: wait方針を決める（toHaveURL/toBeVisible/locator.waitFor等）
- [ ] T1-2-4: 検証握りつぶしを禁止する方針を明文化
- [ ] T1-2-5: 背骨専用specへ分離（新規/移設）
- [ ] T1-2-6: 3回連続実行で安定するまで調整（フレーク要因の除去）
- [ ] T1-2-7: “仕様としての説明”をドキュメント化（E2Eへのリンク）

### I1-3: 背骨UCのDoD確定（2h）

- [ ] T1-3-1: 背骨UCの完了条件を文章化（E2E/ログ/計測）
- [ ] T1-3-2: PRゲート昇格の条件（安定性・実行時間）を定義
- [ ] T1-3-3: 失敗時の切り分け手順（スクショ/trace/ログ）を確定
- [ ] T1-3-4: UC2への入口（I/O境界切り出し）へリンクする

---

## UC2: 背骨経路の境界切り出し（最初はカート推奨）

推奨対象:

- `app/lib/actions/cart.ts`（詳細は `docs/refacroting/refs/backbone-io-boundary.md` 参照）

### I2-1: I/O境界マップをLiving化（2h）

- [ ] T2-1-1: 背骨4ステップ（一覧/詳細/追加/表示）を確認
- [ ] T2-1-2: 依存（DB/Redis/Auth）と該当ファイルを対応づけ
- [ ] T2-1-3: 優先度の根拠（変更頻度/複雑度/テスト状況）を明文化
- [ ] T2-1-4: docs内の参照導線を追加する方針を決める

成果物:

- `docs/refacroting/refs/backbone-io-boundary.md`（必要なら追記）

### I2-2: 切り出し候補の選定と作戦（2h）

- [ ] T2-2-1: 対象を1箇所に確定（デフォルト: cart）
- [ ] T2-2-2: 変更の目的を一文で固定（例: I/O境界を薄くする、責務分割）
- [ ] T2-2-3: 最初の安全網（残すユニット/足す結合/必要ならE2E追加）を決める
- [ ] T2-2-4: ADRが必要か判断（必要なら起票）

### I2-3: 実DBを使う結合テスト追加（2h + 2h）

- [ ] T2-3-1: テストデータ準備方針（seed/transaction/cleanup）を決める
- [ ] T2-3-2: 最小の結合テスト1本（正常系）
- [ ] T2-3-3: 境界1つ（異常系）を1本追加
- [ ] T2-3-4: 実行時間と安定性を測る
- [ ] T2-3-5: Redis/Session依存が絡む場合の扱いを整理（本当に必要か）
- [ ] T2-3-6: テスト実行をCIに載せる段階（手動→ゲート）を決める
- [ ] T2-3-7: Troubleshooting手順を最小限追加

### I2-4: リファクタ実施（2h + 2h）

- [ ] T2-4-1: 目的に対して最小の構造変更（小さく）
- [ ] T2-4-2: テストで安全を確認しながら進める（Red/Green/Refactor）
- [ ] T2-4-3: 変更の説明（なぜこの形が良いか）を残す
- [ ] T2-4-4: 次の切り出し候補（products API等）を“候補”として記録


