'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import ProductCard from '@/components/products/ProductCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import { FiSearch, FiFilter } from 'react-icons/fi'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  imageUrl: string | null
  category: string | null
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const categories = useMemo(
    () => [
      { value: '', label: 'すべて' },
      { value: 'electronics', label: '家電' },
      { value: 'fashion', label: 'ファッション' },
      { value: 'books', label: '書籍' },
    ],
    [],
  )

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (category) params.append('category', category)
      if (search) params.append('search', search)
      params.append('page', page.toString())
      params.append('limit', '12')

      const response = await fetch(`/api/products?${params.toString()}`)
      const data = await response.json()

      setProducts(data.products)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error('商品取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }, [category, page, search])

  useEffect(() => {
    void fetchProducts()
  }, [fetchProducts])

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setPage(1)
      void fetchProducts()
    },
    [fetchProducts],
  )

  const handleChangeCategory = useCallback(
    (value: string) => {
      setCategory(value)
      setPage(1)
    },
    [],
  )

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <section className="bg-[#121217] pb-16 pt-24 text-[#f5f5f7]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6">
          <span className="text-[12px] uppercase tracking-[0.28em] text-white/60">
            Products
          </span>
          <h1 className="text-[clamp(36px,4.5vw,48px)] font-semibold leading-tight">
            すべてのラインナップを
            <br />
            ひとつの世界観で体験
          </h1>
          <p className="max-w-2xl text-[17px] leading-relaxed text-white/75">
            トップページで感じた質感をそのままに。カードレイアウト、タイポ、バッジ位置まで統一し、商品詳細でも違和感なく遷移できます。
          </p>
        </div>
      </section>

      <section className="-mt-12 rounded-t-[40px] bg-[#fbfbfd] pb-20 pt-12 shadow-[0_-24px_60px_rgba(12,12,17,0.18)]">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="mb-10 grid gap-6 md:grid-cols-[2fr_1fr] md:items-start">
            <form onSubmit={handleSearch} className="w-full">
              <label className="block text-xs font-semibold uppercase tracking-[0.22em] text-[var(--foreground-muted)]">
                検索
              </label>
              <div className="relative mt-3 flex rounded-2xl border border-black/10 bg-white/90 px-4 py-3 shadow-[0_20px_40px_rgba(15,15,16,0.06)]">
                <FiSearch className="mt-0.5 h-5 w-5 text-[var(--foreground-muted)]" />
                <input
                  type="text"
                  placeholder="キーワードを入力"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="ml-3 w-full bg-transparent text-[15px] outline-none placeholder:text-[var(--foreground-muted)]"
                />
                <button
                  type="submit"
                  className="ml-4 inline-flex items-center rounded-full bg-[var(--accent)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[var(--accent-hover)]"
                >
                  Search
                </button>
              </div>
            </form>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--foreground-muted)]">
                <FiFilter className="h-4 w-4" /> カテゴリ
              </label>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-2">
                {categories.map((cat) => {
                  const active = cat.value === category
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleChangeCategory(cat.value)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        active
                          ? 'border-[var(--accent)] bg-[var(--accent)] text-white shadow-[0_12px_30px_rgba(0,113,227,0.25)]'
                          : 'border-black/10 bg-white/80 text-[var(--foreground)] hover:border-black/20'
                      }`}
                    >
                      {cat.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center text-[var(--foreground-muted)]">
              商品が見つかりませんでした
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-3 text-sm">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    className="rounded-full border border-black/10 px-4 py-2 transition disabled:cursor-not-allowed disabled:opacity-40 hover:border-black/20"
                  >
                    前へ
                  </button>
                  <span className="rounded-full border border-black/5 px-4 py-2 font-semibold">
                    {page} / {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    className="rounded-full border border-black/10 px-4 py-2 transition disabled:cursor-not-allowed disabled:opacity-40 hover:border-black/20"
                  >
                    次へ
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
<<<<<<< HEAD

=======
>>>>>>> origin/main
