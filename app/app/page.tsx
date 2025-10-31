import Image from "next/image";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";

const DETAIL_HIGHLIGHTS = [
  {
    title: "パーソナライズ",
    description:
      "「Hi, ユーザー名」の挨拶やおすすめエリアをカードに統合。履歴に応じてラインナップが自然に変わります。",
  },
  {
    title: "バッジ & レビュー",
    description:
      "Appleのタイポスケールを参考に、ベストセラーやレビューを控えめに配置しつつ視認性を確保しました。",
  },
  {
    title: "サブナビの留まり方",
    description:
      "スクロールに合わせてスティッキー化。200msフェード＋スライドで表示し、ユーザーの視線移動を邪魔しません。",
  },
];

const TIMELINE_STEPS = [
  {
    title: "Phase 1 — グローバルナビ",
    body: "44pxハイト、フェードインする検索、バッグバッジ。トークン化して全ページへ横展開。",
  },
  {
    title: "Phase 2 — PDP / Buy Box",
    body: "3カラムと構成モーダルを採用。ストーリー性のある長尺レイアウトで訴求力を強化。",
  },
  {
    title: "Phase 3 — パーソナライズ",
    body: "レコメンドや最近閲覧を追加。エッジキャッシュと組み合わせ、初期表示スピードを担保。",
  },
];

export default function Home() {
  return (
    <div className="bg-[var(--background)] text-[var(--foreground)]">
      <section className="relative overflow-hidden bg-[#0c0c11] pb-24 pt-28 text-white md:pb-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.36),rgba(12,12,17,0.92)_58%)]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-full max-w-[55%] bg-[linear-gradient(120deg,rgba(15,23,42,0),rgba(15,23,42,0.55))]" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 md:flex-row md:items-center">
          <div className="max-w-xl">
            <span className="text-[12px] uppercase tracking-[0.28em] text-white/70">
              Experience
            </span>
            <h1 className="mt-6 text-[clamp(40px,5.4vw,60px)] font-semibold leading-tight">
              空気のようになじむ
              <br />
              エフォートレスなショッピング体験
            </h1>
            <p className="mt-6 text-[20px] leading-relaxed text-white/78">
              スティッキーな44pxヘッダー、ピル型CTA、ハイコントラストなビジュアルを組み合わせたAppleライクなUI。トップから商品詳細、購入導線までトーンを揃え、体験を滑らかにします。
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-8 py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-[var(--accent-hover)]"
              >
                商品を見る
                <FiChevronRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-8 py-3 text-sm font-semibold tracking-wide text-white transition hover:border-white/70"
              >
                アカウントを作成
              </Link>
            </div>
          </div>

          <div className="relative isolate flex w-full justify-end md:w-auto">
            <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.6),rgba(59,130,246,0))] blur-3xl" />
            <div className="relative rounded-[40px] border border-white/10 bg-white/5 p-4 backdrop-blur">
              <Image
                src="/images/hero-visual.svg"
                alt="モダンなEC体験のビジュアル"
                width={520}
                height={460}
                priority
                className="h-auto w-[min(420px,82vw)] rounded-[32px]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fbfbfd] py-24">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6">
          <div className="md:flex md:items-center md:justify-between md:gap-16">
            <div className="max-w-xl space-y-6">
              <span className="text-xs uppercase tracking-[0.24em] text-[var(--foreground-muted)]">
                Flow
              </span>
              <h2 className="text-[clamp(30px,3.6vw,38px)] font-semibold leading-snug">
                トップから購入完了まで、
                <br />
                ワンストロークで繋がる導線
              </h2>
              <p className="text-[17px] leading-relaxed text-[var(--foreground-muted)]">
                グローバルナビは常に44pxで固定。主要CTAはピルシェイプ、背景はライトとダークを交互に切り替えてリズムを作りつつ、コンポーネントのボーダーは余白で区切ります。
              </p>
              <Link
                href="/about"
                className="inline-flex items-center text-sm font-semibold text-[var(--accent)] transition hover:text-[var(--accent-hover)]"
              >
                デザイン原則を見る
                <FiChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="mt-12 flex-1 md:mt-0">
              <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-[0_35px_80px_rgba(15,15,16,0.12)]">
                <div className="mb-5 flex items-center justify-between text-[11px] uppercase tracking-[0.26em] text-[var(--foreground-muted)]">
                  <span>Navigation</span>
                  <span>44px</span>
                </div>
                <div className="rounded-2xl bg-[#f4f4f6] px-6 py-5">
                  <p className="text-[12px] uppercase tracking-[0.32em] text-[var(--foreground-muted)]">
                    Hero Layout
                  </p>
                  <h3 className="mt-3 text-[24px] font-semibold leading-tight text-[var(--foreground)]">
                    フルブリード + グラデーション
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-[var(--foreground-muted)]">
                    右側にビジュアル、左側にキャッチコピーを配置。モバイルでは縦積みし、CTAは常に最後尾に揃えて視線の流れを統一します。
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:flex md:flex-row-reverse md:items-center md:gap-16">
            <div className="max-w-xl space-y-6">
              <span className="text-xs uppercase tracking-[0.24em] text-[var(--foreground-muted)]">
                Configure
              </span>
              <h2 className="text-[clamp(30px,3.6vw,38px)] font-semibold leading-snug">
                PDPは「ストーリー」と「比較」の
                <br />
                二軸を縦スクロールで成立
              </h2>
              <p className="text-[17px] leading-relaxed text-[var(--foreground-muted)]">
                ビジュアル・詳細・購入モジュールを3カラムで分割。購入ボタンを押すと横タブの構成モーダルが開き、色・容量などの選択肢を段階的に提示します。
              </p>
              <Link
                href="/products"
                className="inline-flex items-center text-sm font-semibold text-[var(--accent)] transition hover:text-[var(--accent-hover)]"
              >
                商品詳細を見る
                <FiChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="mt-12 flex-1 md:mt-0">
              <div className="rounded-[32px] border border-black/5 bg-white p-8 shadow-[0_25px_80px_rgba(15,15,16,0.08)]">
                <div className="text-[12px] uppercase tracking-[0.28em] text-[var(--foreground-muted)]">
                  Buy Flow
                </div>
                <div className="mt-6 space-y-4">
                  {["モデルを選択", "カラーを選択", "ストレージ", "決済方法"].map(
                    (step, index) => (
                      <div
                        key={step}
                        className="flex items-center justify-between rounded-2xl bg-[#fbfbfd] px-5 py-4"
                      >
                        <span className="text-sm font-semibold text-[var(--foreground)]">
                          {step}
                        </span>
                        <span className="text-xs text-[var(--foreground-muted)]">
                          Step 0{index + 1}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0e0e12] py-24 text-[#f5f5f7]">
        <div className="mx-auto w-full max-w-6xl px-6">
          <h2 className="text-[clamp(32px,4vw,42px)] font-semibold leading-tight">
            ディテールを揃えて信頼を育てる
          </h2>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[#d2d2d7]">
            レーティング、バッジ、配送予定などのトラストシグナルをカード単位で整理。PDP・商品一覧・カートで同じ位置とスタイルを繰り返すことで、判断の迷いを減らします。
          </p>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {DETAIL_HIGHLIGHTS.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/4 p-8 transition hover:bg-white/10"
              >
                <p className="text-xs uppercase tracking-[0.28em] text-[#6e6e73]">
                  Detail
                </p>
                <h3 className="mt-3 text-xl font-semibold text-[#f5f5f7]">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-[#d2d2d7]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fbfbfd] py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-[40px] bg-[#141414] px-8 py-16 text-[#f5f5f7] md:px-14">
            <p className="text-xs uppercase tracking-[0.28em] text-[#6e6e73]">
              Timeline
            </p>
            <h2 className="mt-4 text-[clamp(30px,3.6vw,38px)] font-semibold leading-tight">
              実装ロードマップ
            </h2>
            <div className="mt-12 grid gap-10 md:grid-cols-3">
              {TIMELINE_STEPS.map((item, index) => (
                <div key={item.title} className="space-y-3">
                  <span className="text-xs uppercase tracking-[0.24em] text-[#6e6e73]">
                    Step 0{index + 1}
                  </span>
                  <h3 className="text-lg font-semibold leading-snug text-[#f5f5f7]">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#d2d2d7]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fbfbfd] pb-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-[clamp(30px,3.6vw,36px)] font-semibold leading-tight">
            デモアカウントですぐに検証
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-[var(--foreground-muted)]">
            トップ / 商品一覧 / PDP / カート / チェックアウトで、統一したAppleライクUIを体験できます。
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-8 py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-[var(--accent-hover)]"
            >
              ログインする
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-full border border-black/10 px-8 py-3 text-sm font-semibold tracking-wide text-[var(--foreground)] transition hover:border-black/30"
            >
              プロダクトを探す
            </Link>
          </div>
          <div className="mt-12 rounded-3xl border border-black/10 bg-white px-6 py-6 text-left text-sm text-[var(--foreground-muted)] md:flex md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-[var(--foreground)]">テストアカウント</p>
              <p>user@example.com / password123</p>
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.26em] text-[var(--foreground-muted)] md:mt-0">
              トークン化されたコンポーネント
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
