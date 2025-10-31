import Link from 'next/link'

const FOOTER_LINKS = [
  {
    title: 'ショッピング',
    links: [
      { label: 'すべての商品', href: '/products' },
      { label: '新着アイテム', href: '/products?sort=new' },
      { label: '人気ランキング', href: '/products?sort=popular' },
      { label: 'ギフトガイド', href: '/products?tag=gift' },
    ],
  },
  {
    title: 'サポート',
    links: [
      { label: '注文状況', href: '/orders' },
      { label: 'お問い合わせ', href: '/contact' },
      { label: 'よくある質問', href: '/faq' },
      { label: 'サポートポリシー', href: '/support' },
    ],
  },
  {
    title: 'ポリシー',
    links: [
      { label: '利用規約', href: '/terms' },
      { label: 'プライバシー', href: '/privacy' },
      { label: '特定商取引法', href: '/legal' },
      { label: 'クッキー設定', href: '/cookies' },
    ],
  },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-20 bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface)]">
      <div className="border-b border-[var(--md-sys-color-outline)]/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 text-sm text-[var(--md-sys-color-on-surface-variant)] sm:flex-row sm:items-center sm:justify-between">
          <span>困ったときは、ヘルプセンターをご覧ください。</span>
          <a
            href="#top"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-2 text-sm font-semibold text-[var(--md-sys-color-primary)] transition hover:border-[var(--md-sys-color-primary)] hover:text-[var(--md-sys-color-primary)] focus-visible:border-[var(--md-sys-color-primary)]"
          >
            ページの先頭へ戻る
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 text-sm sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-3">
            <p className="text-base font-semibold text-[var(--md-sys-color-on-surface)]">
              EC Studio
            </p>
            <p className="text-[var(--md-sys-color-on-surface-variant)]">
              コンテナアーキテクチャで構築したモダンなモノリシックECサイトのリファレンス実装です。プロダクトを素早く検証し、チームで学習するためのプレイグラウンドとして活用できます。
            </p>
          </div>

          {FOOTER_LINKS.map((section) => (
            <nav key={section.title} aria-label={section.title} className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--md-sys-color-secondary)]">
                {section.title}
              </p>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[var(--md-sys-color-on-surface-variant)] transition hover:text-[var(--md-sys-color-primary)] focus-visible:text-[var(--md-sys-color-primary)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-[var(--md-sys-color-outline)] pt-6 text-xs text-[var(--md-sys-color-secondary)] md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} EC Studio. All rights reserved.</p>
          <p>
            Built with Next.js · PostgreSQL · Redis · Prisma &mdash; Designed for accessibility and scalability.
          </p>
        </div>
      </div>
    </footer>
  )
}
