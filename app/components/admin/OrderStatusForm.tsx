'use client'

import { updateOrderStatus } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'
import { useState, FormEvent } from 'react'

export function OrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState(currentStatus)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const result = await updateOrderStatus(orderId, status)

    setIsLoading(false)

    if (result.success) {
      router.refresh()
    } else {
      setError(result.error || 'ステータスの更新に失敗しました')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
          ステータス
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="PENDING">処理中</option>
          <option value="CONFIRMED">確定</option>
          <option value="SHIPPED">発送済み</option>
          <option value="DELIVERED">配達完了</option>
          <option value="CANCELLED">キャンセル</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading || status === currentStatus}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? '更新中...' : 'ステータスを更新'}
      </button>
    </form>
  )
}

