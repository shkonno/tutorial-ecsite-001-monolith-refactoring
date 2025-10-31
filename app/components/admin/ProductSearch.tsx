'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface ProductSearchProps {
  categories: { name: string | null; count: number }[]
}

export default function ProductSearch({ categories }: ProductSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [isActive, setIsActive] = useState(searchParams.get('active') || 'all')

  const handleSearch = () => {
    const params = new URLSearchParams()

    if (query.trim()) {
      params.set('q', query.trim())
    }

    if (category !== 'all') {
      params.set('category', category)
    }

    if (isActive !== 'all') {
      params.set('active', isActive)
    }

    router.push(`/admin/products?${params.toString()}`)
  }

  const handleReset = () => {
    setQuery('')
    setCategory('all')
    setIsActive('all')
    router.push('/admin/products')
  }

  return (
    <div className="mb-6 rounded-2xl border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] p-6 shadow-[0_8px_18px_rgba(15,23,42,0.1)]">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <label htmlFor="search-query">検索</label>
          <input
            type="text"
            id="search-query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSearch()
              }
            }}
            placeholder="商品名、説明"
          />
        </div>

        <div>
          <label htmlFor="category-select">カテゴリ</label>
          <select
            id="category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full"
          >
            <option value="all">すべて</option>
            {categories.map((cat) => (
              <option key={cat.name || 'null'} value={cat.name || ''}>
                {cat.name || 'カテゴリなし'} ({cat.count})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="active-select">公開状態</label>
          <select
            id="active-select"
            value={isActive}
            onChange={(e) => setIsActive(e.target.value)}
            className="w-full"
          >
            <option value="all">すべて</option>
            <option value="true">公開中</option>
            <option value="false">非公開</option>
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={handleSearch}
            className="flex-1 rounded-full bg-[var(--md-sys-color-primary)] px-4 py-2 text-sm font-semibold text-[var(--md-sys-color-on-primary)] transition hover:bg-[#1669c1] focus-visible:bg-[#1669c1]"
          >
            検索
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full border border-[var(--md-sys-color-outline)] px-4 py-2 text-sm font-semibold text-[var(--md-sys-color-on-surface)] transition hover:border-[var(--md-sys-color-primary)] hover:text-[var(--md-sys-color-primary)] focus-visible:border-[var(--md-sys-color-primary)]"
          >
            リセット
          </button>
        </div>
      </div>
    </div>
  )
}
