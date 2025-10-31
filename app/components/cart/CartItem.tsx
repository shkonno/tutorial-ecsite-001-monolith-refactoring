'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FiTrash2, FiMinus, FiPlus, FiInfo } from 'react-icons/fi'
import { updateCartItem, removeFromCart } from '@/lib/actions/cart'
import LoadingSpinner from '@/components/LoadingSpinner'

interface CartItemProps {
  item: {
    id: string
    quantity: number
    product: {
      id: string
      name: string
      price: number
      stock: number
      imageUrl: string | null
    }
  }
  onUpdate: () => void
}

type Feedback = {
  tone: 'success' | 'error'
  message: string
}

export default function CartItem({ item, onUpdate }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  useEffect(() => {
    if (!feedback) return
    const timer = setTimeout(() => setFeedback(null), 4000)
    return () => clearTimeout(timer)
  }, [feedback])

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.product.stock) {
      return
    }

    setIsUpdating(true)
    setQuantity(newQuantity)

    const result = await updateCartItem(item.id, newQuantity)

    if (result.success) {
      setFeedback({ tone: 'success', message: '数量を更新しました' })
      onUpdate()
    } else {
      setFeedback({ tone: 'error', message: result.error || '数量の更新に失敗しました' })
      setQuantity(item.quantity)
    }

    setIsUpdating(false)
  }

  const handleRemove = async () => {
    setIsRemoving(true)
    const result = await removeFromCart(item.id)

    if (result.success) {
      setFeedback({ tone: 'success', message: 'カートから削除しました' })
      onUpdate()
    } else {
      setFeedback({ tone: 'error', message: result.error || '削除に失敗しました' })
      setIsRemoving(false)
    }

    setShowConfirm(false)
  }

  const subtotal = item.product.price * quantity

  return (
    <article className={`rounded-2xl border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] p-5 shadow-[0_6px_18px_rgba(15,23,42,0.1)] transition ${isRemoving ? 'opacity-60' : ''}`}>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link href={`/products/${item.product.id}`} className="flex-shrink-0">
          <div className="relative h-28 w-28 overflow-hidden rounded-2xl bg-[var(--md-sys-color-surface-variant)]">
            {item.product.imageUrl ? (
              <Image
                src={item.product.imageUrl}
                alt={item.product.name}
                fill
                className="object-cover"
                sizes="112px"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-[var(--md-sys-color-secondary)]">
                <FiInfo className="h-5 w-5" aria-hidden="true" />
                <span className="text-xs">画像なし</span>
              </div>
            )}
          </div>
        </Link>

        <div className="flex flex-1 flex-col gap-3">
          <div>
            <Link
              href={`/products/${item.product.id}`}
              className="text-lg font-semibold text-[var(--md-sys-color-on-surface)] transition hover:text-[var(--md-sys-color-primary)]"
            >
              {item.product.name}
            </Link>
            <p className="mt-1 text-sm text-[var(--md-sys-color-on-surface-variant)]">
              単価: ¥{item.product.price.toLocaleString()}
            </p>
            <p className="text-xs text-[var(--md-sys-color-secondary)]">
              在庫: {item.product.stock}個
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || isUpdating}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)] transition hover:border-[var(--md-sys-color-primary)] hover:text-[var(--md-sys-color-primary)] disabled:cursor-not-allowed disabled:text-[var(--md-sys-color-secondary)]"
                aria-label="数量を1減らす"
              >
                <FiMinus className="h-4 w-4" aria-hidden="true" />
              </button>

              <div className="w-16 text-center">
                {isUpdating ? (
                  <LoadingSpinner size="sm" className="mx-auto" />
                ) : (
                  <span className="text-lg font-semibold">{quantity}</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= item.product.stock || isUpdating}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)] transition hover:border-[var(--md-sys-color-primary)] hover:text-[var(--md-sys-color-primary)] disabled:cursor-not-allowed disabled:text-[var(--md-sys-color-secondary)]"
                aria-label="数量を1増やす"
              >
                <FiPlus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="text-right">
              <p className="text-sm text-[var(--md-sys-color-secondary)]">小計</p>
              <p className="text-xl font-semibold text-[var(--md-sys-color-on-surface)]">
                ¥{subtotal.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div aria-live="polite" aria-atomic="true" className="text-sm">
              {feedback && (
                <p
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${
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

            <div className="flex items-center gap-2">
              {showConfirm ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={isRemoving}
                    className="rounded-full bg-[var(--md-sys-color-error)] px-4 py-2 text-sm font-semibold text-[var(--md-sys-color-on-error)] transition hover:bg-[#c5221f] focus-visible:bg-[#c5221f] disabled:cursor-not-allowed disabled:bg-[var(--md-sys-color-surface-variant)]"
                  >
                    {isRemoving ? '削除中…' : '削除する'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirm(false)}
                    disabled={isRemoving}
                    className="rounded-full border border-[var(--md-sys-color-outline)] px-4 py-2 text-sm font-semibold text-[var(--md-sys-color-on-surface)] transition hover:border-[var(--md-sys-color-primary)] hover:text-[var(--md-sys-color-primary)] focus-visible:border-[var(--md-sys-color-primary)] disabled:cursor-not-allowed"
                  >
                    やめる
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[var(--md-sys-color-error)] transition hover:bg-[var(--md-sys-color-error)]/10"
                >
                  <FiTrash2 className="h-4 w-4" aria-hidden="true" />
                  削除
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
