'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateOrderStatus } from '@/lib/actions/admin'

interface OrderStatusFormProps {
  orderId: string
  currentStatus: string
}

const statusOptions = [
  { value: 'PENDING', label: '処理中', color: 'yellow' },
  { value: 'CONFIRMED', label: '確定', color: 'blue' },
  { value: 'SHIPPED', label: '発送済み', color: 'purple' },
  { value: 'DELIVERED', label: '配達完了', color: 'green' },
  { value: 'CANCELLED', label: 'キャンセル', color: 'red' },
]

export default function OrderStatusForm({
  orderId,
  currentStatus,
}: OrderStatusFormProps) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (status === currentStatus) {
      setError('ステータスが変更されていません')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await updateOrderStatus(orderId, status)

      if (!result.success) {
        setError(result.error || 'ステータスの更新に失敗しました')
        setLoading(false)
        return
      }

      setSuccess(result.message || 'ステータスを更新しました')
      router.refresh()
    } catch (err) {
      setError('予期しないエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        注文ステータス変更
      </h3>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 text-green-800 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            ステータス
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || status === currentStatus}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? '更新中...' : 'ステータスを更新'}
        </button>
      </form>
    </div>
  )
}
