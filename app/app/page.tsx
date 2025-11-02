import Image from "next/image";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";

const DETAIL_HIGHLIGHTS = [
  {
    title: "パーソナライズ",
    description:
      "ユーザーの履歴をもとに、おすすめ商品や再入荷情報をカードで提案します。プレースメントとトーンを統一し、学習コストを下げます。",
  },
  {
    title: "トラストシグナル",
    description:
      "レビュー、配送予定、バッジを一箇所に整理。色とアイコンを統一し、どのページでも同じ位置に配置します。",
  },
  {
    title: "レスポンシブガイド",
    description:
      "4pxのグリッドを基準に、モバイルでは1カラム、デスクトップでは最大3カラムのカードレイアウトに切り替えます。",
  },
];

const TIMELINE_STEPS = [
  {
    title: "Phase 1 — グローバルナビ",
    body: "高さ56pxのアプリバーを定義し、ロゴ・検索・カート・アカウントをトークン化してすべての画面で共有します。",
  },
  {
    title: "Phase 2 — PDP / カート",
    body: "商品詳細・カート・チェックアウトをカード/セクションで分解。押しやすいボタンと読みやすい段落を維持します。",
  },
  {
    title: "Phase 3 — パーソナライズ",
    body: "レコメンドと最近閲覧をSurface Variant上に表示し、コンテキストアクションを提供します。",
  },
];

export default function Home() {
  return (
    <div className="bg-[var(--md-sys-color-background)] text-[var(--md-sys-color-on-surface)]">
      <section className="relative overflow-hidden border-b border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(26,115,232,0.12),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(232,240,254,0.8),rgba(232,240,254,0))]" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)] md:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-[var(--md-sys-color-primary-container)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--md-sys-color-primary)]">
              Material Design モノリス
            </span>
            <h1 className="text-balance text-[clamp(2.5rem,4vw,3.25rem)] font-semibold leading-tight">
              迷わず進める
              <br />
              GoogleスタイルのEC体験
            </h1>
            <p className="text-lg leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
              色・タイポグラフィ・コンポーネントをすべてトークンで管理。ローカル開発から本番デプロイまで、一貫したマテリアルデザインで顧客体験を作り込みます。
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--md-sys-color-primary)] px-6 py-3 text-sm font-semibold text-[var(--md-sys-color-on-primary)] transition hover:bg-[#1669c1] focus-visible:bg-[#1669c1]"
              >
                商品を探す
                <FiChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--md-sys-color-outline)] px-6 py-3 text-sm font-semibold text-[var(--md-sys-color-primary)] transition hover:border-[var(--md-sys-color-primary)] focus-visible:border-[var(--md-sys-color-primary)]"
              >
                アカウントを作成
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center md:justify-end">
            <div className="absolute -top-12 right-6 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(26,115,232,0.28),transparent)] blur-2xl" aria-hidden="true" />
            <div className="relative rounded-3xl border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] p-4 shadow-[0_20px_50px_rgba(15,23,42,0.16)]">
              <Image
                src="/images/hero-visual.svg"
                alt="モダンなEC体験のビジュアル"
                width={420}
                height={360}
                priority
                className="h-auto w-[min(360px,80vw)] rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 md:flex-row md:items-center md:gap-16">
          <div className="max-w-xl space-y-6">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--md-sys-color-secondary)]">
              Flow
            </span>
            <h2 className="text-balance text-[clamp(2rem,3.4vw,2.5rem)] font-semibold leading-snug">
              トップページからチェックアウトまで、
              <br />
              シームレスな導線を設計
            </h2>
            <p className="text-base leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
              グローバルナビ、商品一覧、カート、チェックアウトの主要フローをマテリアルのElevationとSpacingで整理。キーボード操作とスクリーンリーダーにも配慮しています。
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--md-sys-color-primary)] transition hover:text-[#1669c1]"
            >
              商品一覧を見る
              <FiChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            {["トップページ", "商品一覧", "カート", "チェックアウト"].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-5 py-4 shadow-[0_8px_18px_rgba(15,23,42,0.1)]"
                >
                  <p className="text-sm font-semibold text-[var(--md-sys-color-primary)]">
                    {item}
                  </p>
                  <p className="mt-2 text-sm text-[var(--md-sys-color-on-surface-variant)]">
                    コンテンツをカード化し、4pxグリッドで配置。タッチ領域は44px以上を維持します。
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="bg-[var(--md-sys-color-surface)] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-balance text-[clamp(2rem,3vw,2.4rem)] font-semibold leading-tight">
            ディテールまで統一することで
            <br />
            ブランドと信頼感を積み上げる
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
            各機能のサマリーをカードに分解し、アイコンと余白を揃えます。アクセシビリティを考慮したコントラストとフォーカスリングを実装しています。
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {DETAIL_HIGHLIGHTS.map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-3 rounded-2xl border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface-variant)] p-6 shadow-[0_6px_16px_rgba(15,23,42,0.08)]"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--md-sys-color-secondary)]">
                  Detail
                </span>
                <h3 className="text-lg font-semibold text-[var(--md-sys-color-on-surface)]">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-3xl border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] p-8 shadow-[0_16px_30px_rgba(15,23,42,0.12)] md:p-12">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--md-sys-color-secondary)]">
              Timeline
            </span>
            <h2 className="mt-4 text-balance text-[clamp(2rem,3vw,2.3rem)] font-semibold leading-tight">
              実装ロードマップ
            </h2>
            <div className="mt-10 space-y-8 md:grid md:grid-cols-3 md:gap-8 md:space-y-0">
              {TIMELINE_STEPS.map((item, index) => (
                <div
                  key={item.title}
                  className="space-y-3 rounded-2xl border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface-variant)] p-5"
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--md-sys-color-secondary)]">
                    Step 0{index + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-[var(--md-sys-color-on-surface)]">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="overflow-hidden rounded-3xl bg-[var(--md-sys-color-primary)] px-8 py-16 text-[var(--md-sys-color-on-primary)] shadow-[0_24px_45px_rgba(15,23,42,0.2)] md:px-14">
            <h2 className="text-balance text-[clamp(2rem,3vw,2.4rem)] font-semibold leading-tight">
              チーム全員で同じルールを共有し、
              最短でMVPを実装しよう
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[color:rgba(255,255,255,0.85)]">
              Getting Startedガイドとデザインチートシートを参照して、開発とデザインの共通言語を作りましょう。CI/CD、データベース、LocalStackなどのセットアップも整っています。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--md-sys-color-on-primary)] px-6 py-3 text-sm font-semibold text-[var(--md-sys-color-primary)] transition hover:bg-[color:rgba(255,255,255,0.9)]"
              >
                商品カタログへ
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[color:rgba(255,255,255,0.6)] px-6 py-3 text-sm font-semibold text-[var(--md-sys-color-on-primary)] transition hover:border-[var(--md-sys-color-on-primary)]"
              >
                プロジェクトについて
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
