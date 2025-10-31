'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FiShoppingCart, FiInfo } from 'react-icons/fi'
import { addToCart } from '@/lib/actions/cart'
import { useRouter } from 'next/navigation'

interface ProductCardProps {
  product: {
    id: string
    name: string
    description: string | null
    price: number
    stock: number
    imageUrl: string | null
    category: string | null
  }
}

type Feedback = {
  tone: 'success' | 'error'
  message: string
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const isOutOfStock = product.stock === 0

  useEffect(() => {
    if (!feedback) return
    const timer = setTimeout(() => setFeedback(null), 4000)
    return () => clearTimeout(timer)
  }, [feedback])

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isOutOfStock || isAdding) return

    setIsAdding(true)

    try {
      const result = await addToCart(product.id, 1)

      if (result.success) {
        setFeedback({ tone: 'success', message: 'カートに追加しました' })
        router.refresh()
      } else {
        setFeedback({ tone: 'error', message: result.error || 'カート追加に失敗しました' })
      }
    } catch (error) {
      console.error('カート追加エラー:', error)
      setFeedback({ tone: 'error', message: 'カート追加中にエラーが発生しました' })
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-[12px] border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] shadow-[0_4px_12px_rgba(15,23,42,0.08)] transition hover:shadow-[0_12px_24px_rgba(15,23,42,0.12)] focus-within:shadow-[0_12px_24px_rgba(15,23,42,0.14)]">
      <Link
        href={`/products/${product.id}`}
        className="relative block"
        aria-labelledby={`product-${product.id}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--md-sys-color-surface-variant)]">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-[var(--md-sys-color-secondary)]">
              <FiInfo className="h-6 w-6" aria-hidden="true" />
              <span>画像準備中</span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent" />

          {product.category && (
            <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-[var(--md-sys-color-primary-container)] px-3 py-1 text-xs font-semibold text-[var(--md-sys-color-primary)] shadow-sm">
              {getCategoryName(product.category)}
            </span>
          )}

          {isOutOfStock && (
            <span className="absolute right-4 top-4 inline-flex items-center rounded-full bg-[var(--md-sys-color-error)] px-3 py-1 text-xs font-semibold text-[var(--md-sys-color-on-error)]">
              在庫切れ
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-4 px-5 pb-6 pt-5">
        <div className="flex flex-col gap-2">
          <Link href={`/products/${product.id}`}>
            <h3
              id={`product-${product.id}`}
              className="line-clamp-2 text-lg font-semibold text-[var(--md-sys-color-on-surface)] transition-colors hover:text-[var(--md-sys-color-primary)]"
            >
              {product.name}
            </h3>
          </Link>

          <p className="min-h-[2.75rem] text-sm leading-relaxed text-[var(--md-sys-color-on-surface-variant)] line-clamp-3">
            {product.description || '商品説明は準備中です。'}
          </p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-semibold text-[var(--md-sys-color-on-surface)]">
              ¥{product.price.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-[var(--md-sys-color-secondary)]">
              在庫: {product.stock > 0 ? `${product.stock}個` : '在庫なし'}
            </p>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${
              isOutOfStock || isAdding
                ? 'cursor-not-allowed bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-secondary)]'
                : 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-[0_6px_18px_rgba(25,118,210,0.24)] hover:bg-[#1669c1] focus-visible:bg-[#1669c1]'
            }`}
            title={isOutOfStock ? '在庫切れ' : 'カートに追加'}
            aria-disabled={isOutOfStock || isAdding}
          >
            {isAdding ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--md-sys-color-on-primary)] border-t-transparent" aria-hidden="true" />
                <span>追加中...</span>
              </>
            ) : (
              <>
                <FiShoppingCart className="h-4 w-4" aria-hidden="true" />
                <span>カートに入れる</span>
              </>
            )}
          </button>
        </div>

        <div
          aria-live="polite"
          aria-atomic="true"
          className="text-sm"
        >
          {feedback && (
            <p
              className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                feedback.tone === 'success'
                  ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)]'
                  : 'bg-[var(--md-sys-color-error)]/10 text-[var(--md-sys-color-error)]'
              }`}
              role="status"
            >
              <span aria-hidden="true">
                {feedback.tone === 'success' ? '✓' : '!'}
              </span>
              {feedback.message}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

function getCategoryName(category: string): string {
  const categoryMap: Record<string, string> = {
    electronics: '家電',
    fashion: 'ファッション',
    books: '書籍',
    mac: 'Mac',
    tablet: 'タブレット',
    smartphone: 'スマートフォン',
    wearable: 'ウェアラブル',
    audio: 'オーディオ',
    accessories: 'アクセサリ',
  }
  return categoryMap[category] || category
}
