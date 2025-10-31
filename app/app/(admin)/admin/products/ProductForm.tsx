'use client'

import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  category: string | null
  imageUrl: string | null
  isActive: boolean
}

type ProductFormProps = {
  action: (formData: FormData) => Promise<{ error?: string } | void>
  product?: Product
}

export function ProductForm({ action, product }: ProductFormProps) {
  const [state, formAction] = useFormState(
    async (_prevState: any, formData: FormData) => {
      return await action(formData)
    },
    { error: '' }
  )

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {state.error}
        </div>
      )}

      {/* 商品名 */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          商品名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={product?.name || ''}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 説明 */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          説明
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={product?.description || ''}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 価格と在庫 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            価格（円） <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="price"
            name="price"
            required
            min="0"
            step="1"
            defaultValue={product?.price || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
            在庫数
          </label>
          <input
            type="number"
            id="stock"
            name="stock"
            min="0"
            step="1"
            defaultValue={product?.stock || 0}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* カテゴリ */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          カテゴリ
        </label>
        <input
          type="text"
          id="category"
          name="category"
          defaultValue={product?.category || ''}
          placeholder="例: 電子機器、衣類、食品"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 画像URL */}
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
          画像URL
        </label>
        <input
          type="url"
          id="imageUrl"
          name="imageUrl"
          defaultValue={product?.imageUrl || ''}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-sm text-gray-500 mt-1">
          画像のURLを入力してください（S3などの外部ストレージ）
        </p>
      </div>

      {/* 公開ステータス */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            value="true"
            defaultChecked={product?.isActive ?? true}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">
            公開する
          </span>
        </label>
        <p className="text-sm text-gray-500 mt-1">
          チェックを外すと非公開になります
        </p>
      </div>

      {/* ボタン */}
      <div className="flex gap-4">
        <SubmitButton />
        <Link
          href="/admin/products"
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </Link>
      </div>
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? '保存中...' : '保存する'}
    </button>
  )
}

