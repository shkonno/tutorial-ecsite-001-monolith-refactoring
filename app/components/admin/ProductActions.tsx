'use client'

import { toggleProductStatus, deleteProduct } from '@/lib/actions/product'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export function ProductActions({
  productId,
  isActive,
}: {
  productId: string
  isActive: boolean
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleStatus = async () => {
    if (isLoading) return

    setIsLoading(true)
    const result = await toggleProductStatus(productId)
    setIsLoading(false)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'ステータスの切り替えに失敗しました')
    }
  }

  const handleDelete = async () => {
    if (isLoading) return

    if (!confirm('本当にこの商品を削除しますか？この操作は取り消せません。')) {
      return
    }

    setIsLoading(true)
    const result = await deleteProduct(productId)
    setIsLoading(false)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || '商品の削除に失敗しました')
    }
  }

  return (
    <div className="flex gap-2">
      <Link
        href={`/admin/products/${productId}/edit`}
        className="text-blue-600 hover:underline text-sm"
      >
        編集
      </Link>
      <button
        onClick={handleToggleStatus}
        disabled={isLoading}
        className="text-orange-600 hover:underline text-sm disabled:opacity-50"
      >
        {isActive ? '無効化' : '有効化'}
      </button>
      <button
        onClick={handleDelete}
        disabled={isLoading}
        className="text-red-600 hover:underline text-sm disabled:opacity-50"
      >
        削除
      </button>
    </div>
  )
}
