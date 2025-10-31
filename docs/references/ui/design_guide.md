

# デザインガイド（Material Designベース）

Google Material Design 3 を参考に、当ECサイトのUIを一貫した体験に保つための指針をまとめます。アクセシビリティに配慮した配色・タイポグラフィ・コンポーネント運用ルールとして、本ガイドに従って実装してください。

---

## 1. デザイン原則

1. **Clarity** — 情報は階層的に整理し、余白とグリッドで読みやすさを担保する。
2. **Affordance** — ボタン・リンク・入力欄は状態変化（hover/focus/disabled）を視覚化し、操作可能性を示す。
3. **Comfort** — 動きは控えめに、角丸や陰影はMaterial Design 3の推奨値を採用。
4. **Inclusive** — 最低 AA 水準のコントラストを維持し、キーボード操作と支援技術で利用できる。

---

## 2. 配色トークン

| 役割 | CSS変数 | Light | Dark | コントラスト基準 |
|------|---------|-------|------|-------------------|
| Primary | `--md-sys-color-primary` | `#1A73E8` | `#8AB4F8` | テキスト白（#FFFFFF）と 4.5+ |
| On Primary | `--md-sys-color-on-primary` | `#FFFFFF` | `#062E6F` | 背景との比 7+ |
| Primary Container | `--md-sys-color-primary-container` | `#E8F0FE` | `#1C3B70` | テキスト primary で 4.5+ |
| Secondary | `--md-sys-color-secondary` | `#5F6368` | `#BDC1C6` | 白/黒で 4.5+ |
| Surface | `--md-sys-color-surface` | `#FFFFFF` | `#1F1F1F` | 本文テキストと 7+ |
| Surface Variant | `--md-sys-color-surface-variant` | `#F1F3F4` | `#2A2A2A` | 区切り背景に利用 |
| Outline | `--md-sys-color-outline` | `#DADCE0` | `#444746` | 枠線用 3+ |
| Success | `--md-sys-color-success` | `#1E8E3E` | `#81C995` | テキスト白と 4.5+ |
| Error | `--md-sys-color-error` | `#D93025` | `#F28B82` | テキスト白と 4.5+ |

> **メモ**: Light/Darkテーマは `prefers-color-scheme` を検知してCSSカスタムプロパティを切り替え。Primary色は Google Blue 600 を採用。

---

## 3. タイポグラフィ

フォントスタックは Roboto / Noto Sans JP を基準に、システムフォントをフォールバックに設定します。

| 用途 | Token | CSS例 | 備考 |
|------|-------|-------|------|
| Headline | `font-headline` | `font-size: clamp(2rem, 2.5vw, 2.25rem); font-weight: 500; letter-spacing: -0.01em;` | 見出し（h1/h2）
| Title | `font-title` | `font-size: 1.5rem; font-weight: 500;` | セクションタイトル
| Body Large | `font-body-lg` | `font-size: 1rem; line-height: 1.6;` | 本文・説明文
| Body Small | `font-body-sm` | `font-size: 0.875rem; line-height: 1.5;` | キャプション、補足
| Label | `font-label` | `font-size: 0.8125rem; letter-spacing: 0.08em; text-transform: uppercase;` | ボタン/タブ

> **アクセシビリティ**: 行間は 1.4 以上を維持。日本語では字間を詰めすぎない。

---

## 4. レイアウト & スペーシング

- ベースグリッド: 4px ユニット。
- セクション余白: 48px (desktop), 32px (tablet), 24px (mobile)。
- カード角丸: 12px。ダイアログや FAB は 16px。
- シャドウ（Elevation）:
  - Level 1: `0 1px 3px rgba(15, 23, 42, 0.08)`
  - Level 2: `0 4px 12px rgba(15, 23, 42, 0.12)`
  - Level 3: `0 10px 24px rgba(15, 23, 42, 0.16)`
- コンテンツ最大幅: 1200px。左右の余白はモバイル 16px、タブレット以上 24px。

---

## 5. コンポーネントガイド

### 5.1 ボタン
- 基本スタイル: `.btn-primary`, `.btn-tonal`, `.btn-outlined` をTailwindユーティリティで構成。
- ホバー: 彩度を 8% 上げる (`brightness-110`)。
- フォーカス: `outline-offset-2` で `outline` を `--md-sys-color-primary` に。
- Disabled: `opacity-60` + `cursor-not-allowed`。背景 `--md-sys-color-surface-variant`。

### 5.2 ナビゲーションバー
- 高さ56px、背景は `var(--md-sys-color-surface)`、ボーダー `var(--md-sys-color-outline)`。
- スクロール時に elevation level 2 を適用。
- ロゴ/メニュー/検索/アクションアイコンは 24px。タッチターゲットは 44px 四方。

### 5.3 カード
- 背景: `var(--md-sys-color-surface)`、角丸12px、shadow level 1。
- 見出しは Title、本文は Body Small。アクションは右下に配置。
- 画像比率は16:9を推奨。プレースホルダーはアイコンとテキストで情報提供。

### 5.4 フォーム
- ラベルは上部配置。必須項目は `*` を付け、アクセシビリティ上 `aria-required="true"` を設定。
- 入力欄はアウトライン型フィールドを採用：`border var(--md-sys-color-outline)`、フォーカスで `border-[--md-sys-color-primary]`。
- エラー時には `aria-invalid="true"` と `role="alert"` を活用。

### 5.5 バッジ & チップ
- 背景: `var(--md-sys-color-primary-container)`、テキスト: `var(--md-sys-color-primary)`。
- 角丸 9999px。字間は +4%。

---

## 6. 状態 & フィードバック

| 状態 | ルール |
|------|--------|
| Hover | 背景またはボーダーを +8% 明るくし、指示カーソルを表示 |
| Focus | `outline: 3px solid var(--md-sys-color-primary)` を基本とし、`outline-offset: 2px` |
| Active | シャドウを Level 1 に縮小 / 移動量は最大2px |
| Disabled | `opacity: 0.38` + ストレートカラー（グレイ系）。テキストは `--md-sys-color-secondary` |
| Error | テキスト/ボーダーを `--md-sys-color-error`、補助文言を `role="alert"` |
| Success | ステータスメッセージを `--md-sys-color-success` で表示 |

---

## 7. アクセシビリティ基準

- **コントラスト**: テキストは最小 4.5:1、見出し/大型テキストは 3:1 以上。
- **キーボードナビゲーション**: `Tab` → `Shift+Tab` → `Enter/Space` が自然に機能すること。`aria-expanded`, `aria-controls` を利用。
- **スクリーンリーダー**: 重要なアイコンには `aria-label`。状況変化（例: カート追加）は `aria-live="polite"` 容器で通知。
- **アニメーション**: `prefers-reduced-motion` を検知してトランジションを短縮または無効化。

---

## 8. 実装チェックリスト

- [ ] CSS変数が `:root` および `prefers-color-scheme` で定義されている。
- [ ] Tailwindユーティリティが設計ルールを反映している（例: `rounded-3xl` を避ける）。
- [ ] UIコンポーネントの構造に `role`/`aria-*` 属性が付与されている。
- [ ] 色覚シミュレーターで主要画面を確認済み。
- [ ] Storybook またはPlaywright Snapshotで視覚回帰テストが可能。

---

Material Designリファレンス:
- https://m3.material.io/
- https://material.io/components

※ 追加ルールはこのガイドに追記し、変更時はデザインレビューを経てから実装してください。


参考：
https://dev.classmethod.jp/articles/google-material-design/
https://design.google/
https://www.digital.go.jp/policies/servicedesign/designsystem