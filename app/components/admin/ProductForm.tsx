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

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
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
    } catch (err) {
      setError('予期しないエラーが発生しました')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* 商品名 */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            商品名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="商品名を入力"
          />
        </div>

        {/* 説明 */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            説明
          </label>
          <textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="商品の説明を入力"
          />
        </div>

        {/* 価格と在庫 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              価格（円） <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="price"
              required
              min="1"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1000"
            />
          </div>

          <div>
            <label
              htmlFor="stock"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              在庫数 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="stock"
              required
              min="0"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="100"
            />
          </div>
        </div>

        {/* カテゴリ */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            カテゴリ
          </label>
          <input
            type="text"
            id="category"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="例: 電化製品、書籍、衣類"
          />
        </div>

        {/* 画像アップロード */}
        <ImageUpload
          currentImageUrl={formData.imageUrl}
          onImageUploaded={(url) => setFormData({ ...formData, imageUrl: url })}
        />

        {/* 公開/非公開 */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
            公開する
          </label>
        </div>

        {/* ボタン */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading
              ? '処理中...'
              : product
              ? '更新する'
              : '作成する'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    </form>
  )
}
