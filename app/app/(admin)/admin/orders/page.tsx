import { getAllOrdersForAdmin } from '@/lib/actions/admin'
import Link from 'next/link'

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string }
}) {
  const page = parseInt(searchParams.page || '1', 10)
  const statusFilter = searchParams.status

  const result = await getAllOrdersForAdmin(page, 20, statusFilter)

  if (!result.success || !result.orders) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">注文管理</h1>
        <p className="text-red-600">{result.error || '注文の取得に失敗しました'}</p>
      </div>
    )
  }

  const { orders, pagination } = result

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">注文管理</h1>

      {/* ステータスフィルター */}
      <div className="mb-6 flex gap-2">
        <Link
          href="/admin/orders"
          className={`px-4 py-2 rounded-lg ${
            !statusFilter
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          すべて
        </Link>
        <Link
          href="/admin/orders?status=PENDING"
          className={`px-4 py-2 rounded-lg ${
            statusFilter === 'PENDING'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          処理中
        </Link>
        <Link
          href="/admin/orders?status=CONFIRMED"
          className={`px-4 py-2 rounded-lg ${
            statusFilter === 'CONFIRMED'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          確定
        </Link>
        <Link
          href="/admin/orders?status=SHIPPED"
          className={`px-4 py-2 rounded-lg ${
            statusFilter === 'SHIPPED'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          発送済み
        </Link>
        <Link
          href="/admin/orders?status=DELIVERED"
          className={`px-4 py-2 rounded-lg ${
            statusFilter === 'DELIVERED'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          配達完了
        </Link>
      </div>

      {/* 注文一覧テーブル */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4">注文ID</th>
              <th className="text-left py-3 px-4">顧客</th>
              <th className="text-left py-3 px-4">商品数</th>
              <th className="text-left py-3 px-4">合計金額</th>
              <th className="text-left py-3 px-4">ステータス</th>
              <th className="text-left py-3 px-4">注文日時</th>
              <th className="text-left py-3 px-4">操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  注文がありません
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {order.id.slice(0, 8)}...
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium">{order.user.name || '名前なし'}</div>
                      <div className="text-sm text-gray-500">{order.user.email}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">{order.orderItems.length}点</td>
                  <td className="py-3 px-4 font-semibold">
                    ¥{order.totalAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString('ja-JP')}
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-blue-600 hover:underline text-sm"
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
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Link
              key={pageNum}
              href={`/admin/orders?page=${pageNum}${statusFilter ? `&status=${statusFilter}` : ''}`}
              className={`px-4 py-2 rounded ${
                pageNum === pagination.page
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {pageNum}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    PENDING: { label: '処理中', className: 'bg-yellow-100 text-yellow-800' },
    CONFIRMED: { label: '確定', className: 'bg-blue-100 text-blue-800' },
    SHIPPED: { label: '発送済み', className: 'bg-purple-100 text-purple-800' },
    DELIVERED: { label: '配達完了', className: 'bg-green-100 text-green-800' },
    CANCELLED: { label: 'キャンセル', className: 'bg-red-100 text-red-800' },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    className: 'bg-gray-100 text-gray-800',
  }

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}

