'use client'

import { useEffect, useState } from 'react'
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
  const [feedback, setFeedback] = useState<{
    tone: 'success' | 'error'
    message: string
  } | null>(null)

  useEffect(() => {
    if (!feedback) return
    const timer = setTimeout(() => setFeedback(null), 4000)
    return () => clearTimeout(timer)
  }, [feedback])

  const handleDelete = async () => {
    setLoading(true)

    try {
      const result = await deleteProduct(productId)

      if (!result.success) {
        setFeedback({
          tone: 'error',
          message: result.error || '削除に失敗しました',
        })
        setLoading(false)
        return
      }

      setFeedback({
        tone: 'success',
        message: result.message || '商品を削除しました',
      })
      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      console.error('商品削除エラー:', error)
      setFeedback({
        tone: 'error',
        message: '予期しないエラーが発生しました',
      })
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => router.push(`/admin/products/${productId}/edit`)}
        className="rounded-full bg-[var(--md-sys-color-primary)] px-4 py-2 text-sm font-semibold text-[var(--md-sys-color-on-primary)] transition hover:bg-[#1669c1] focus-visible:bg-[#1669c1]"
      >
        編集
      </button>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className="rounded-full bg-[var(--md-sys-color-error)] px-4 py-2 text-sm font-semibold text-[var(--md-sys-color-on-error)] transition hover:bg-[#c5221f] focus-visible:bg-[#c5221f] disabled:cursor-not-allowed disabled:bg-[var(--md-sys-color-surface-variant)] disabled:text-[var(--md-sys-color-secondary)]"
      >
        削除
      </button>

      {/* 削除確認ダイアログ */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-product-heading"
            className="w-full max-w-md rounded-2xl border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] p-6 shadow-[0_20px_44px_rgba(15,23,42,0.2)]"
          >
            <h3
              id="delete-product-heading"
              className="text-lg font-semibold text-[var(--md-sys-color-on-surface)]"
            >
              商品を削除しますか?
            </h3>
            <p className="mt-3 text-sm text-[var(--md-sys-color-on-surface-variant)]">
              <span className="font-medium text-[var(--md-sys-color-on-surface)]">
                {productName}
              </span>{' '}
              を削除すると、関連する注文履歴では非公開として扱われます。
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 rounded-full bg-[var(--md-sys-color-error)] px-4 py-2 font-semibold text-[var(--md-sys-color-on-error)] transition hover:bg-[#c5221f] focus-visible:bg-[#c5221f] disabled:cursor-not-allowed disabled:bg-[var(--md-sys-color-surface-variant)] disabled:text-[var(--md-sys-color-secondary)]"
              >
                {loading ? '削除中…' : '削除する'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="flex-1 rounded-full border border-[var(--md-sys-color-outline)] px-4 py-2 font-semibold text-[var(--md-sys-color-on-surface)] transition hover:border-[var(--md-sys-color-primary)] hover:text-[var(--md-sys-color-primary)] focus-visible:border-[var(--md-sys-color-primary)] disabled:cursor-not-allowed disabled:text-[var(--md-sys-color-secondary)]"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      <div aria-live="polite" aria-atomic="true" className="text-sm">
        {feedback && (
          <p
            className={`rounded-xl px-3 py-2 ${
              feedback.tone === 'success'
                ? 'bg-[var(--md-sys-color-success)]/10 text-[var(--md-sys-color-success)]'
                : 'bg-[var(--md-sys-color-error)]/10 text-[var(--md-sys-color-error)]'
            }`}
            role="status"
          >
            {feedback.message}
          </p>
        )}
      </div>
    </div>
  )
}
