'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteProduct } from '@/lib/actions/product'

interface ProductActionsProps {
  productId: string
  productName: string
}

export default function ProductActions({
  productId,
  productName,
}: ProductActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setLoading(true)

    try {
      const result = await deleteProduct(productId)

      if (!result.success) {
        alert(result.error || '削除に失敗しました')
        setLoading(false)
        return
      }

      alert(result.message)
      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      alert('予期しないエラーが発生しました')
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => router.push(`/admin/products/${productId}/edit`)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
      >
        編集
      </button>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
      >
        削除
      </button>

      {/* 削除確認ダイアログ */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              商品を削除しますか?
            </h3>
            <p className="text-gray-600 mb-6">
              <span className="font-medium">{productName}</span>{' '}
              を削除してもよろしいですか？
              <br />
              <span className="text-sm text-gray-500">
                ※注文履歴に含まれる商品は非公開になります
              </span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '削除中...' : '削除する'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
