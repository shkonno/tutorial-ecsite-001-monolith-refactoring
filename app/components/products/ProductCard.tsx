'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FiShoppingCart } from 'react-icons/fi'
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

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const isOutOfStock = product.stock === 0

  const handleAddToCart = async (e: React.MouseEvent) => {
    // イベントの伝播を停止（Linkのクリックを防ぐ）
    e.preventDefault()
    e.stopPropagation()

    if (isOutOfStock) return

    setIsAdding(true)
    
    try {
      const result = await addToCart(product.id, 1)
      
      if (result.success) {
        alert('カートに追加しました！')
        // ページをリフレッシュしてカートバッジを更新
        router.refresh()
      } else {
        alert(result.error || 'カートへの追加に失敗しました')
      }
    } catch (error) {
      console.error('カート追加エラー:', error)
      alert('カートへの追加中にエラーが発生しました')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="group overflow-hidden rounded-[28px] border border-black/5 bg-white/90 shadow-[0_24px_50px_rgba(12,12,17,0.12)] transition hover:-translate-y-1 hover:shadow-[0_32px_70px_rgba(12,12,17,0.16)]">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative h-64 overflow-hidden bg-[#f1f1f3]">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[var(--foreground-muted)]">
              画像なし
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/55 to-transparent" />

          {isOutOfStock && (
            <div className="absolute left-4 top-4 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white">
              在庫切れ
            </div>
          )}

          {product.category && (
            <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[var(--foreground)] shadow">
              {getCategoryName(product.category)}
            </div>
          )}
        </div>
      </Link>

      <div className="space-y-4 px-5 pb-6 pt-5">
        <Link href={`/products/${product.id}`}>
          <h3 className="min-h-[3.5rem] text-lg font-semibold text-[var(--foreground)] transition hover:text-[var(--accent)]">
            {product.name}
          </h3>
        </Link>

        <p className="min-h-[2.5rem] text-sm leading-relaxed text-[var(--foreground-muted)] line-clamp-2">
          {product.description || '商品説明はありません'}
        </p>

        <div className="flex items-end justify-between">
          <div>
            <span className="text-2xl font-semibold text-[var(--foreground)]">
              ¥{product.price.toLocaleString()}
            </span>
            <p className="mt-1 text-xs text-[var(--foreground-muted)]">
              在庫: {product.stock > 0 ? `${product.stock}個` : '在庫切れ'}
            </p>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${
              isOutOfStock || isAdding
                ? 'cursor-not-allowed bg-black/5 text-[var(--foreground-muted)]'
                : 'bg-[var(--accent)] text-white shadow-[0_16px_30px_rgba(0,113,227,0.25)] hover:bg-[var(--accent-hover)]'
            }`}
            title={isOutOfStock ? '在庫切れ' : 'カートに追加'}
          >
            {isAdding ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span className="hidden sm:inline">追加中...</span>
              </>
            ) : (
              <>
                <FiShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">カート</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// カテゴリ名を日本語に変換
function getCategoryName(category: string): string {
  const categoryMap: Record<string, string> = {
    electronics: '家電',
    fashion: 'ファッション',
    books: '書籍',
  }
  return categoryMap[category] || category
}

