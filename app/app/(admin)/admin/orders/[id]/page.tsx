import { getOrderByIdForAdmin } from '@/lib/actions/admin'
import { notFound } from 'next/navigation'
import { OrderStatusForm } from '@/components/admin/OrderStatusForm'
import Link from 'next/link'

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const result = await getOrderByIdForAdmin(params.id)

  if (!result.success || !result.order) {
    notFound()
  }

  const order = result.order

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/orders"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← 注文一覧に戻る
        </Link>
        <h1 className="text-3xl font-bold">注文詳細</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 注文情報 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 注文商品 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">注文商品</h2>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center border-b pb-4">
                  <div className="flex-1">
                    <Link
                      href={`/products/${item.product.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-gray-500">
                      ¥{item.price.toLocaleString()} × {item.quantity}個
                    </p>
                  </div>
                  <div className="font-semibold">
                    ¥{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>合計金額</span>
                <span>¥{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 配送情報 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">配送情報</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">配送先氏名</dt>
                <dd className="mt-1 text-gray-900">{order.shippingName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">配送先メールアドレス</dt>
                <dd className="mt-1 text-gray-900">{order.shippingEmail}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">配送先住所</dt>
                <dd className="mt-1 text-gray-900">{order.shippingAddress}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* サイドバー */}
        <div className="space-y-6">
          {/* 注文ステータス */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">ステータス管理</h2>
            <OrderStatusForm orderId={order.id} currentStatus={order.status} />
          </div>

          {/* 顧客情報 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">顧客情報</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">氏名</dt>
                <dd className="mt-1 text-gray-900">{order.user.name || '名前なし'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">メールアドレス</dt>
                <dd className="mt-1 text-gray-900">{order.user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">ユーザーID</dt>
                <dd className="mt-1 text-gray-900 text-sm">{order.user.id}</dd>
              </div>
            </dl>
          </div>

          {/* 注文情報 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">注文情報</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">注文ID</dt>
                <dd className="mt-1 text-gray-900 text-sm break-all">{order.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">注文日時</dt>
                <dd className="mt-1 text-gray-900">
                  {new Date(order.createdAt).toLocaleString('ja-JP')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">更新日時</dt>
                <dd className="mt-1 text-gray-900">
                  {new Date(order.updatedAt).toLocaleString('ja-JP')}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
