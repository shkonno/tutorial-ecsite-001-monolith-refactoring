'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct, updateProduct } from '@/lib/actions/product'
import ImageUpload from './ImageUpload'

interface ProductFormProps {
  product?: {
    id: string
    name: string
    description: string | null
    price: number
    stock: number
    imageUrl: string | null
    category: string | null
    isActive: boolean
  }
}

type ProductFormState = {
  name: string
  description: string
  price: number
  stock: number
  imageUrl: string
  category: string
  isActive: boolean
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<ProductFormState>({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    stock: product?.stock || 0,
    imageUrl: product?.imageUrl || '',
    category: product?.category || '',
    isActive: product?.isActive ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = product
        ? await updateProduct(product.id, formData)
        : await createProduct(formData)

      if (!result.success) {
        setError(result.error || '操作に失敗しました')
        setLoading(false)
        return
      }

      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      console.error('商品フォーム送信エラー:', error)
      setError('予期しないエラーが発生しました')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {error && (
        <div
          className="rounded-2xl border border-[var(--md-sys-color-error)] bg-[var(--md-sys-color-error)]/10 px-4 py-3 text-[var(--md-sys-color-error)]"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="space-y-6 rounded-2xl border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] p-6 shadow-[0_12px_24px_rgba(15,23,42,0.12)]">
        <div>
          <label htmlFor="name">
            商品名 <span className="text-[var(--md-sys-color-error)]">*</span>
          </label>
          <input
            type="text"
            id="name"
            required
            aria-required="true"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="商品名を入力"
          />
        </div>

        <div>
          <label htmlFor="description">説明</label>
          <textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="商品の説明を入力"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="price">
              価格（円）{' '}
              <span className="text-[var(--md-sys-color-error)]">*</span>
            </label>
            <input
              type="number"
              id="price"
              required
              aria-required="true"
              min={1}
              inputMode="numeric"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: Number(e.target.value) })
              }
              placeholder="1000"
            />
          </div>

          <div>
            <label htmlFor="stock">
              在庫数{' '}
              <span className="text-[var(--md-sys-color-error)]">*</span>
            </label>
            <input
              type="number"
              id="stock"
              required
              aria-required="true"
              min={0}
              inputMode="numeric"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: Number(e.target.value) })
              }
              placeholder="100"
            />
          </div>
        </div>

        <div>
          <label htmlFor="category">カテゴリ</label>
          <input
            type="text"
            id="category"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            placeholder="例: 電化製品、書籍、衣類"
          />
        </div>

        <ImageUpload
          currentImageUrl={formData.imageUrl}
          onImageUploaded={(url) => setFormData({ ...formData, imageUrl: url })}
        />

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
            className="h-4 w-4 rounded border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
          />
          <label htmlFor="isActive" className="m-0 text-sm">
            公開する
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--md-sys-color-primary)] px-6 py-3 text-sm font-semibold text-[var(--md-sys-color-on-primary)] transition hover:bg-[#1669c1] focus-visible:bg-[#1669c1] disabled:cursor-not-allowed disabled:bg-[var(--md-sys-color-surface-variant)] disabled:text-[var(--md-sys-color-secondary)]"
        >
          {loading ? '処理中…' : product ? '更新する' : '作成する'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--md-sys-color-outline)] px-6 py-3 text-sm font-semibold text-[var(--md-sys-color-on-surface)] transition hover:border-[var(--md-sys-color-primary)] hover:text-[var(--md-sys-color-primary)] focus-visible:border-[var(--md-sys-color-primary)]"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
