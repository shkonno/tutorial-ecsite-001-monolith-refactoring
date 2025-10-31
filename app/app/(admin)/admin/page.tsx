import { getDashboardStats } from '@/lib/actions/admin'
import Link from 'next/link'

export default async function AdminDashboard() {
  const result = await getDashboardStats()

  if (!result.success || !result.stats) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          ダッシュボード
        </h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {result.error || 'データの取得に失敗しました'}
        </div>
      </div>
    )
  }

  const { stats } = result

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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  // ステータスバッジ
  const getStatusBadge = (status: string) => {
    const badges: Record<
      string,
      { label: string; className: string }
    > = {
      PENDING: { label: '処理中', className: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: '確定', className: 'bg-blue-100 text-blue-800' },
      SHIPPED: { label: '発送済み', className: 'bg-purple-100 text-purple-800' },
      DELIVERED: { label: '配達完了', className: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'キャンセル', className: 'bg-red-100 text-red-800' },
    }

    const badge = badges[status] || { label: status, className: 'bg-gray-100 text-gray-800' }

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badge.className}`}>
        {badge.label}
      </span>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        ダッシュボード
      </h1>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* 総売上 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">総売上</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatPrice(stats.totalRevenue)}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        {/* 注文数 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">注文数</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.totalOrders}
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </div>

        {/* 商品数 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">商品数</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.totalProducts}
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <span className="text-2xl">📦</span>
            </div>
          </div>
        </div>

        {/* ユーザー数 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ユーザー数</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.totalUsers}
              </p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 最新注文 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                最新注文
              </h2>
              <Link
                href="/admin/orders"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                すべて見る →
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.recentOrders.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">
                注文がありません
              </p>
            ) : (
              stats.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900">
                      {order.user.name || order.user.email}
                    </p>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {order.orderItems.length}商品
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(order.createdAt)}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* 在庫少ない商品 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                在庫少ない商品
              </h2>
              <Link
                href="/admin/products"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                商品管理 →
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.lowStockProducts.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">
                在庫が少ない商品はありません
              </p>
            ) : (
              stats.lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {product.category || 'カテゴリなし'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${
                        product.stock === 0
                          ? 'text-red-600'
                          : product.stock <= 5
                          ? 'text-orange-600'
                          : 'text-yellow-600'
                      }`}>
                        在庫: {product.stock}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
