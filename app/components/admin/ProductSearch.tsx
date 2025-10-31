'use client'

import { useState, useEffect } from 'react'
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
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 検索キーワード */}
        <div>
          <label
            htmlFor="search-query"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            検索
          </label>
          <input
            type="text"
            id="search-query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
            placeholder="商品名、説明"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* カテゴリ */}
        <div>
          <label
            htmlFor="category-select"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            カテゴリ
          </label>
          <select
            id="category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">すべて</option>
            {categories.map((cat) => (
              <option key={cat.name || 'null'} value={cat.name || ''}>
                {cat.name || 'カテゴリなし'} ({cat.count})
              </option>
            ))}
          </select>
        </div>

        {/* 公開状態 */}
        <div>
          <label
            htmlFor="active-select"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            公開状態
          </label>
          <select
            id="active-select"
            value={isActive}
            onChange={(e) => setIsActive(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">すべて</option>
            <option value="true">公開中</option>
            <option value="false">非公開</option>
          </select>
        </div>

        {/* ボタン */}
        <div className="flex items-end gap-2">
          <button
            onClick={handleSearch}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            検索
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            リセット
          </button>
        </div>
      </div>
    </div>
  )
}

