import { getAllOrdersForAdmin } from '@/lib/actions/admin'
import Link from 'next/link'

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string }
}) {
  const statusFilter = searchParams.status
  const page = parseInt(searchParams.page || '1')

  const result = await getAllOrdersForAdmin(page, 20, statusFilter)

  if (!result.success || !result.orders) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">注文管理</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {result.error || 'データの取得に失敗しました'}
        </div>
      </div>
    )
  }

  const { orders, pagination } = result

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
    const badges: Record<string, { label: string; className: string }> = {
      PENDING: { label: '処理中', className: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: '確定', className: 'bg-blue-100 text-blue-800' },
      SHIPPED: { label: '発送済み', className: 'bg-purple-100 text-purple-800' },
      DELIVERED: { label: '配達完了', className: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'キャンセル', className: 'bg-red-100 text-red-800' },
    }

    const badge = badges[status] || { label: status, className: 'bg-gray-100 text-gray-800' }

    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${badge.className}`}>
        {badge.label}
      </span>
    )
  }

  const statuses = [
    { value: '', label: 'すべて' },
    { value: 'PENDING', label: '処理中' },
    { value: 'CONFIRMED', label: '確定' },
    { value: 'SHIPPED', label: '発送済み' },
    { value: 'DELIVERED', label: '配達完了' },
    { value: 'CANCELLED', label: 'キャンセル' },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">注文管理</h1>

      {/* ステータスフィルター */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap gap-2">
          {statuses.map((statusOption) => (
            <Link
              key={statusOption.value}
              href={`/admin/orders${statusOption.value ? `?status=${statusOption.value}` : ''}`}
              className={`px-4 py-2 rounded-lg transition-colors ${
                (statusFilter || '') === statusOption.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {statusOption.label}
            </Link>
          ))}
        </div>
      </div>

      {/* 注文一覧 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  注文ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  顧客
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  商品数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金額
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  注文日時
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    注文が見つかりませんでした
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900">
                        {order.id.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.user.name || '名前なし'}
                      </div>
                      <div className="text-sm text-gray-500">{order.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {order.orderItems.length}商品
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        詳細
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ページネーション */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {pagination.totalCount}件中 {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.totalCount)}件を表示
            </div>
            <div className="flex gap-2">
              {pagination.page > 1 && (
                <Link
                  href={`/admin/orders?${new URLSearchParams({
                    ...searchParams,
                    page: (pagination.page - 1).toString(),
                  }).toString()}`}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  前へ
                </Link>
              )}
              {pagination.page < pagination.totalPages && (
                <Link
                  href={`/admin/orders?${new URLSearchParams({
                    ...searchParams,
                    page: (pagination.page + 1).toString(),
                  }).toString()}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  次へ
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
