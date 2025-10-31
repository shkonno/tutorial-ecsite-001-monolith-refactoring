import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-24 bg-[#1d1d1f] text-[#f5f5f7]">
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-[12px] text-[#6e6e73]">
          <span>詳しいサポートが必要ですか？</span>
          <a
            href="#top"
            className="rounded-full bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f5f5f7] transition hover:bg-white/20"
          >
            Back to top
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 text-[12px] md:grid-cols-4">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-[#f5f5f7]">EC Studio</p>
            <p className="text-[#6e6e73]">
              モダンなモノリシックECサイトのショーケース。
              <br />
              コンテナアーキテクチャと連携し、拡張性と運用のしやすさを両立します。
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6e6e73]">
              ショッピング
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products"
                  className="transition hover:text-[#f5f5f7]"
                >
                  すべての商品
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=mac"
                  className="transition hover:text-[#f5f5f7]"
                >
                  Mac向けアクセサリ
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=smartphone"
                  className="transition hover:text-[#f5f5f7]"
                >
                  スマートフォン
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=audio"
                  className="transition hover:text-[#f5f5f7]"
                >
                  オーディオ
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6e6e73]">
              サービス
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="transition hover:text-[#f5f5f7]"
                >
                  プロジェクトについて
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="transition hover:text-[#f5f5f7]"
                >
                  アカウント作成
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="transition hover:text-[#f5f5f7]"
                >
                  注文状況
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="transition hover:text-[#f5f5f7]"
                >
                  よくある質問
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6e6e73]">
              サポート
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contact"
                  className="transition hover:text-[#f5f5f7]"
                >
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="transition hover:text-[#f5f5f7]"
                >
                  利用規約
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="transition hover:text-[#f5f5f7]"
                >
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="transition hover:text-[#f5f5f7]"
                >
                  サポートセンター
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 space-y-2 border-t border-white/10 pt-6 text-[11px] text-[#6e6e73]">
          <p>© {currentYear} EC Studio. All rights reserved.</p>
          <p>
            Built with Next.js 16, PostgreSQL, Redis, and Prisma. Designed in
            Tokyo.
          </p>
        </div>
      </div>
    </footer>
  )
}
