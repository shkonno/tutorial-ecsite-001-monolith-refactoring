'use client'

import { createProduct, updateProduct } from '@/lib/actions/product'
import { useRouter } from 'next/navigation'
import { useState, FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  imageUrl: string | null
  isActive: boolean
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(product?.imageUrl || null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    const result = product
      ? await updateProduct(product.id, formData)
      : await createProduct(formData)

    setIsLoading(false)

    if (result.success) {
      router.push('/admin/products')
      router.refresh()
    } else {
      setError(result.error || '操作に失敗しました')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-2xl">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* 商品名 */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            商品名 <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={product?.name}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 説明 */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            説明 <span className="text-red-600">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={product?.description}
            required
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 価格 */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
            価格（円） <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            id="price"
            name="price"
            defaultValue={product?.price}
            required
            min="0"
            step="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 在庫 */}
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
            在庫数 <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            id="stock"
            name="stock"
            defaultValue={product?.stock}
            required
            min="0"
            step="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* カテゴリ */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            カテゴリ <span className="text-red-600">*</span>
          </label>
          <select
            id="category"
            name="category"
            defaultValue={product?.category}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">選択してください</option>
            <option value="electronics">電化製品</option>
            <option value="clothing">衣類</option>
            <option value="books">書籍</option>
            <option value="food">食品</option>
            <option value="sports">スポーツ用品</option>
            <option value="other">その他</option>
          </select>
        </div>

        {/* 画像 */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
            商品画像
          </label>
          {imagePreview && (
            <div className="mb-4">
              <Image
                src={imagePreview}
                alt="プレビュー"
                width={200}
                height={200}
                className="rounded object-cover"
              />
            </div>
          )}
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">
            JPG、PNG、GIF形式の画像をアップロードできます
          </p>
        </div>

        {/* 有効/無効 */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            value="true"
            defaultChecked={product?.isActive ?? true}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
            この商品を有効にする
          </label>
        </div>
      </div>

      {/* ボタン */}
      <div className="mt-8 flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '処理中...' : product ? '更新する' : '登録する'}
        </button>
        <Link
          href="/admin/products"
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
        >
          キャンセル
        </Link>
      </div>
    </form>
  )
}

