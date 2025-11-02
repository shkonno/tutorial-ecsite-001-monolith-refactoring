import { searchProductsForAdmin } from '@/lib/actions/product'
import Link from 'next/link'
import ProductSearch from '@/components/admin/ProductSearch'
import React from 'react'

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; active?: string; page?: string }
}) {
  const query = searchParams.q || ''
  const category = searchParams.category || 'all'
  const isActiveParam = searchParams.active
  const isActive = isActiveParam === 'true' ? true : isActiveParam === 'false' ? false : undefined
  const page = parseInt(searchParams.page || '1')

  const result = await searchProductsForAdmin(
    query,
    category === 'all' ? undefined : category,
    isActive,
    page,
    20
  )

  if (!result.success || !result.products) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">商品管理</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {result.error || 'データの取得に失敗しました'}
        </div>
      </div>
    )
  }

  const { products, categories, pagination } = result

  // 金額をフォーマット
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">商品管理</h1>
        <Link
          href="/admin/products/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + 新規商品
        </Link>
      </div>

      {/* 検索フォーム */}
      <ProductSearch categories={categories || []} />

      {/* 商品一覧 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  商品
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  カテゴリ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  価格
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  在庫
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状態
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    商品が見つかりませんでした
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover mr-4"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          {product.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description.substring(0, 50)}
                              {product.description.length > 50 && '...'}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {product.category || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm font-medium ${
                          product.stock === 0
                            ? 'text-red-600'
                            : product.stock <= 10
                            ? 'text-orange-600'
                            : 'text-green-600'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          product.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.isActive ? '公開中' : '非公開'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          編集
                        </Link>
                        <ProductDeleteButton
                          productId={product.id}
                          productName={product.name}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ページネーション */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {pagination.totalCount}件中 {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.totalCount)}件を表示
            </div>
            <div className="flex gap-2">
              {pagination.page > 1 && (
                <Link
                  href={`/admin/products?${new URLSearchParams({
                    ...searchParams,
                    page: (pagination.page - 1).toString(),
                  }).toString()}`}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  前へ
                </Link>
              )}
              {pagination.page < pagination.totalPages && (
                <Link
                  href={`/admin/products?${new URLSearchParams({
                    ...searchParams,
                    page: (pagination.page + 1).toString(),
                  }).toString()}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  次へ
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 削除ボタンコンポーネント（クライアントコンポーネント）
'use client'
function ProductDeleteButton({ productId, productName }: { productId: string, productName: string }) {
  const React = require('react') as typeof import('react')
  const { useRouter } = require('next/navigation') as typeof import('next/navigation')
  
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    
    try {
      const { deleteProduct } = await import('@/lib/actions/product')
      const result = await deleteProduct(productId)
      
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || '削除に失敗しました')
      }
    } catch (error) {
      console.error('削除エラー:', error)
      alert('削除に失敗しました')
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="text-red-600 hover:text-red-900"
        disabled={loading}
      >
        削除
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              商品を削除しますか?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              <span className="font-medium">{productName}</span> を削除すると、関連する注文履歴では非公開として扱われます。
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? '削除中...' : '削除する'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
