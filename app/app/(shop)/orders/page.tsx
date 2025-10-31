'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { FiPackage, FiTruck, FiCheckCircle, FiX } from 'react-icons/fi'
import LoadingSpinner from '@/components/LoadingSpinner'

interface Order {
  id: string
  totalAmount: number
  status: string
  createdAt: Date | string
  orderItems: Array<{
    quantity: number
    price: number
    product: {
      id: string
      name: string
      imageUrl: string | null
    }
  }>
}

export default function OrdersPage() {
  const router = useRouter()
  const { status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchOrders()
    }
  }, [status, router])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { getOrders } = await import('@/lib/actions/order')
      const data = await getOrders()
      setOrders(data)
    } catch (error) {
      console.error('注文履歴取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">注文履歴</h1>
          <p className="mt-2 text-gray-600">
            {orders.length > 0 ? `${orders.length}件の注文` : '注文がありません'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FiPackage className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              注文履歴がありません
            </h2>
            <p className="text-gray-600 mb-6">
              商品を購入すると、ここに注文履歴が表示されます
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              商品を見る
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm text-gray-500">注文番号:</span>
                        <span className="text-sm font-mono text-gray-900">{order.id}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">注文日時:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(order.createdAt).toLocaleString('ja-JP')}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                      <OrderStatusBadge status={order.status} />
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          ¥{order.totalAmount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.orderItems.length}商品
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center space-x-3 overflow-x-auto">
                      {order.orderItems.slice(0, 5).map((item, index) => (
                        <div key={index} className="flex-shrink-0">
                          <p className="text-sm text-gray-700 truncate max-w-xs">
                            {item.product.name} × {item.quantity}
                          </p>
                        </div>
                      ))}
                      {order.orderItems.length > 5 && (
                        <span className="text-sm text-gray-500">
                          他{order.orderItems.length - 5}件
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function OrderStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
    PENDING: { label: '処理中', color: 'bg-yellow-100 text-yellow-800', icon: FiPackage },
    CONFIRMED: { label: '確定', color: 'bg-blue-100 text-blue-800', icon: FiCheckCircle },
    SHIPPED: { label: '発送済み', color: 'bg-purple-100 text-purple-800', icon: FiTruck },
    DELIVERED: { label: '配達完了', color: 'bg-green-100 text-green-800', icon: FiCheckCircle },
    CANCELLED: { label: 'キャンセル', color: 'bg-red-100 text-red-800', icon: FiX },
  }

  const config = statusConfig[status] || statusConfig.PENDING
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${config.color}`}>
      <Icon className="w-4 h-4 mr-1" />
      {config.label}
    </span>
  )
}

