import { getAllUsersForAdmin } from '@/lib/actions/admin'
import Link from 'next/link'

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const page = parseInt(searchParams.page || '1')

  const result = await getAllUsersForAdmin(page, 20)

  if (!result.success || !result.users) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">ユーザー管理</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {result.error || 'データの取得に失敗しました'}
        </div>
      </div>
    )
  }

  const { users, pagination } = result

  // 日時をフォーマット
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date))
  }

  // ロールバッジ
  const getRoleBadge = (role: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      USER: { label: '一般ユーザー', className: 'bg-gray-100 text-gray-800' },
      ADMIN: { label: '管理者', className: 'bg-blue-100 text-blue-800' },
    }

    const badge = badges[role] || { label: role, className: 'bg-gray-100 text-gray-800' }

    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${badge.className}`}>
        {badge.label}
      </span>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">ユーザー管理</h1>

      {/* ユーザー一覧 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ユーザー
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ロール
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  注文数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  登録日
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    ユーザーが見つかりませんでした
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || '名前なし'}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {user._count.orders}件
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          // モーダルを開く（次のステップで実装）
                          window.location.href = `/admin/users?userId=${user.id}`
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        ロール変更
                      </button>
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
                  href={`/admin/users?page=${pagination.page - 1}`}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  前へ
                </Link>
              )}
              {pagination.page < pagination.totalPages && (
                <Link
                  href={`/admin/users?page=${pagination.page + 1}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  次へ
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">総ユーザー数</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {pagination?.totalCount || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">一般ユーザー</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {users.filter((u) => u.role === 'USER').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">管理者</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {users.filter((u) => u.role === 'ADMIN').length}
          </p>
        </div>
      </div>
    </div>
  )
}
