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
    } catch (error) {
      console.error('注文ステータス更新エラー:', error)
      setError('予期しないエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const activeStatus = statusOptions.find((option) => option.value === status)

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] p-6 shadow-[0_10px_22px_rgba(15,23,42,0.12)]">
      <h3 className="text-lg font-semibold text-[var(--md-sys-color-on-surface)]">
        注文ステータス変更
      </h3>

      {error && (
        <div
          className="rounded-xl border border-[var(--md-sys-color-error)] bg-[var(--md-sys-color-error)]/10 px-3 py-2 text-sm text-[var(--md-sys-color-error)]"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="rounded-xl border border-[var(--md-sys-color-success)] bg-[var(--md-sys-color-success)]/10 px-3 py-2 text-sm text-[var(--md-sys-color-success)]"
          role="status"
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="status">ステータス</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={loading}
            className="w-full disabled:cursor-not-allowed disabled:bg-[var(--md-sys-color-surface-variant)] disabled:text-[var(--md-sys-color-secondary)]"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {activeStatus && (
            <p className="mt-2 inline-flex items-center rounded-full bg-[var(--md-sys-color-primary-container)] px-3 py-1 text-xs font-semibold text-[var(--md-sys-color-primary)]">
              現在: {activeStatus.label}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || status === currentStatus}
          className="w-full rounded-full bg-[var(--md-sys-color-primary)] px-6 py-3 text-sm font-semibold text-[var(--md-sys-color-on-primary)] transition hover:bg-[#1669c1] focus-visible:bg-[#1669c1] disabled:cursor-not-allowed disabled:bg-[var(--md-sys-color-surface-variant)] disabled:text-[var(--md-sys-color-secondary)]"
        >
          {loading ? '更新中…' : 'ステータスを更新'}
        </button>
      </form>
    </div>
  )
}
