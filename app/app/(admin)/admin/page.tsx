import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  // 統計情報の取得
  const [totalProducts, totalOrders, totalUsers, pendingOrders] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
  ])

  // 最近の注文を取得
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">ダッシュボード</h1>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="商品数"
          value={totalProducts}
          icon="📦"
          href="/admin/products"
        />
        <StatCard
          title="注文数"
          value={totalOrders}
          icon="📋"
          href="/admin/orders"
        />
        <StatCard
          title="ユーザー数"
          value={totalUsers}
          icon="👥"
          href="/admin/users"
        />
        <StatCard
          title="処理中の注文"
          value={pendingOrders}
          icon="⏳"
          href="/admin/orders?status=PENDING"
          highlight={pendingOrders > 0}
        />
      </div>

      {/* 最近の注文 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">最近の注文</h2>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500">注文がありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">注文ID</th>
                  <th className="text-left py-3 px-4">ユーザー</th>
                  <th className="text-left py-3 px-4">金額</th>
                  <th className="text-left py-3 px-4">ステータス</th>
                  <th className="text-left py-3 px-4">日時</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {order.id.slice(0, 8)}...
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      {order.user.name || order.user.email}
                    </td>
                    <td className="py-3 px-4">
                      ¥{order.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('ja-JP')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  href,
  highlight = false,
}: {
  title: string
  value: number
  icon: string
  href: string
  highlight?: boolean
}) {
  return (
    <Link href={href}>
      <div
        className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow ${
          highlight ? 'ring-2 ring-orange-500' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
          <span className="text-2xl">{icon}</span>
        </div>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </Link>
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

