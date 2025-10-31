import { getOrderByIdForAdmin } from '@/lib/actions/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import OrderStatusForm from '@/components/admin/OrderStatusForm'

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const result = await getOrderByIdForAdmin(params.id)

  if (!result.success || !result.order) {
    notFound()
  }

  const { order } = result

  // 金額をフォーマット
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price)
  }

  // 日時をフォーマット
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  // ステータスバッジ
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      PENDING: { label: '処理中', className: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: '確定', className: 'bg-blue-100 text-blue-800' },
      SHIPPED: { label: '発送済み', className: 'bg-purple-100 text-purple-800' },
      DELIVERED: { label: '配達完了', className: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'キャンセル', className: 'bg-red-100 text-red-800' },
    }

    const badge = badges[status] || { label: status, className: 'bg-gray-100 text-gray-800' }

    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${badge.className}`}>
        {badge.label}
      </span>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          ← 注文一覧に戻る
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">注文詳細</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 注文情報 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本情報 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              基本情報
            </h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">注文ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">
                  {order.id}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">ステータス</dt>
                <dd className="mt-1">{getStatusBadge(order.status)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">注文日時</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDate(order.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">合計金額</dt>
                <dd className="mt-1 text-lg font-bold text-gray-900">
                  {formatPrice(order.totalAmount)}
                </dd>
              </div>
            </dl>
          </div>

          {/* 顧客情報 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              顧客情報
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">顧客名</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {order.user.name || '名前なし'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  メールアドレス
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{order.user.email}</dd>
              </div>
            </dl>
          </div>

          {/* 配送先情報 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              配送先情報
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">氏名</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {order.shippingName}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  メールアドレス
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {order.shippingEmail}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">住所</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {order.shippingAddress}
                </dd>
              </div>
            </dl>
          </div>

          {/* 注文商品 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              注文商品
            </h2>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center flex-1">
                    {item.product.imageUrl && (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-lg object-cover mr-4"
                      />
                    )}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">
                  合計
                </span>
                <span className="text-xl font-bold text-gray-900">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* サイドバー */}
        <div className="lg:col-span-1">
          <OrderStatusForm orderId={order.id} currentStatus={order.status} />
        </div>
      </div>
    </div>
  )
}
