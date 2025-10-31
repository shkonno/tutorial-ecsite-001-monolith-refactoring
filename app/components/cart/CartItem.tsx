'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi'
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

export default function CartItem({ item, onUpdate }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.product.stock) return
    
    setIsUpdating(true)
    setQuantity(newQuantity)

    const result = await updateCartItem(item.id, newQuantity)
    
    if (result.success) {
      onUpdate()
    } else {
      alert(result.error)
      setQuantity(item.quantity) // 失敗したら元に戻す
    }
    
    setIsUpdating(false)
  }

  const handleRemove = async () => {
    if (!confirm('この商品をカートから削除しますか？')) return

    setIsRemoving(true)
    const result = await removeFromCart(item.id)
    
    if (result.success) {
      onUpdate()
    } else {
      alert(result.error)
      setIsRemoving(false)
    }
  }

  const subtotal = item.product.price * quantity

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${isRemoving ? 'opacity-50' : ''}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 商品画像 */}
        <Link href={`/products/${item.product.id}`} className="flex-shrink-0">
          <div className="relative w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
            {item.product.imageUrl ? (
              <Image
                src={item.product.imageUrl}
                alt={item.product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                画像なし
              </div>
            )}
          </div>
        </Link>

        {/* 商品情報 */}
        <div className="flex-grow">
          <Link
            href={`/products/${item.product.id}`}
            className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
          >
            {item.product.name}
          </Link>
          <p className="text-gray-600 mt-1">
            単価: ¥{item.product.price.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            在庫: {item.product.stock}個
          </p>
        </div>

        {/* 数量調整 */}
        <div className="flex flex-col items-end justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || isUpdating}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiMinus className="w-4 h-4" />
            </button>

            <div className="w-16 text-center">
              {isUpdating ? (
                <LoadingSpinner size="sm" className="mx-auto" />
              ) : (
                <span className="text-lg font-semibold">{quantity}</span>
              )}
            </div>

            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= item.product.stock || isUpdating}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiPlus className="w-4 h-4" />
            </button>
          </div>

          {/* 小計 */}
          <div className="text-right mt-2">
            <p className="text-xl font-bold text-gray-900">
              ¥{subtotal.toLocaleString()}
            </p>
          </div>

          {/* 削除ボタン */}
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="mt-2 text-red-600 hover:text-red-700 flex items-center space-x-1 text-sm disabled:opacity-50"
          >
            <FiTrash2 className="w-4 h-4" />
            <span>削除</span>
          </button>
        </div>
      </div>
    </div>
  )
}

