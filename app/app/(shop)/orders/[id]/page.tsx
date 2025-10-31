'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { FiCheckCircle, FiPackage, FiTruck, FiX, FiChevronLeft, FiAlertCircle } from 'react-icons/fi'
import LoadingSpinner, { LoadingButton } from '@/components/LoadingSpinner'
import { cancelOrder } from '@/lib/actions/order'

interface Order {
  id: string
  totalAmount: number
  status: string
  shippingName: string
  shippingEmail: string
  shippingAddress: string
  createdAt: Date | string
  orderItems: Array<{
    id: string
    quantity: number
    price: number
    product: {
      id: string
      name: string
      imageUrl: string | null
    }
  }>
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const orderId = params.id as string
  const isSuccess = searchParams.get('success') === 'true'

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchOrder()
    }
  }, [status, router, orderId])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const { getOrderById } = await import('@/lib/actions/order')
      const data = await getOrderById(orderId)
      
      if (!data) {
        router.push('/orders')
        return
      }

      setOrder(data)
    } catch (error) {
      console.error('注文詳細取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('この注文をキャンセルしますか？\n在庫は自動的に復元されます。')) return

    setCancelling(true)
    const result = await cancelOrder(orderId)

    if (result.success) {
      fetchOrder() // 注文情報を再取得
    } else {
      alert(result.error)
    }

    setCancelling(false)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  if (!order) {
    return null
  }

  const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 成功メッセージ */}
      {isSuccess && (
        <div className="bg-green-50 border-b border-green-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-2">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
              <p className="text-green-800 font-semibold">
                ご注文ありがとうございます！注文が正常に完了しました。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ヘッダー */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/orders"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <FiChevronLeft className="w-5 h-5" />
            <span>注文履歴に戻る</span>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">注文詳細</h1>
              <p className="mt-2 text-sm text-gray-600">
                注文番号: <span className="font-mono">{order.id}</span>
              </p>
              <p className="text-sm text-gray-600">
                注文日時: {new Date(order.createdAt).toLocaleString('ja-JP')}
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 注文商品 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">注文商品</h2>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex space-x-4 pb-4 border-b last:border-b-0">
                    <Link href={`/products/${item.product.id}`} className="flex-shrink-0">
                      <div className="relative w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
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

                    <div className="flex-grow">
                      <Link
                        href={`/products/${item.product.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-indigo-600"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-gray-600 mt-1">
                        ¥{item.price.toLocaleString()} × {item.quantity}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ¥{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 配送先情報 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FiTruck className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-900">配送先情報</h2>
              </div>
              <div className="space-y-2 text-gray-700">
                <p><strong>お名前:</strong> {order.shippingName}</p>
                <p><strong>メールアドレス:</strong> {order.shippingEmail}</p>
                <p><strong>配送先住所:</strong> {order.shippingAddress}</p>
              </div>
            </div>
          </div>

          {/* サイドバー */}
          <div className="lg:col-span-1 space-y-4">
            {/* 注文サマリー */}
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">注文サマリー</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>小計</span>
                  <span>¥{order.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>配送料</span>
                  <span className="text-green-600">無料</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>合計</span>
                    <span>¥{order.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* キャンセルボタン */}
              {canCancel && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="w-full mt-6 flex items-center justify-center px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {cancelling ? (
                    <LoadingButton />
                  ) : (
                    <>
                      <FiX className="mr-2 w-5 h-5" />
                      注文をキャンセル
                    </>
                  )}
                </button>
              )}

              {order.status === 'CANCELLED' && (
                <div className="mt-6 flex items-start space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>この注文はキャンセルされました</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function OrderStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    PENDING: { label: '処理中', color: 'bg-yellow-100 text-yellow-800', icon: FiPackage },
    CONFIRMED: { label: '確定', color: 'bg-blue-100 text-blue-800', icon: FiCheckCircle },
    SHIPPED: { label: '発送済み', color: 'bg-purple-100 text-purple-800', icon: FiTruck },
    DELIVERED: { label: '配達完了', color: 'bg-green-100 text-green-800', icon: FiCheckCircle },
    CANCELLED: { label: 'キャンセル', color: 'bg-red-100 text-red-800', icon: FiX },
  }

  const config = statusConfig[status] || statusConfig.PENDING
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${config.color}`}>
      <Icon className="w-5 h-5 mr-2" />
      {config.label}
    </span>
  )
}

