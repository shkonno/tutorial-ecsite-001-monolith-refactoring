import { getAllUsersForAdmin } from '@/lib/actions/admin'
import { UserRoleForm } from '@/components/admin/UserRoleForm'
import Link from 'next/link'

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const page = parseInt(searchParams.page || '1', 10)
  const result = await getAllUsersForAdmin(page, 20)

  if (!result.success || !result.users) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">ユーザー管理</h1>
        <p className="text-red-600">{result.error || 'ユーザーの取得に失敗しました'}</p>
      </div>
    )
  }

  const { users, pagination } = result

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">ユーザー管理</h1>

      {/* ユーザー一覧テーブル */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4">氏名</th>
              <th className="text-left py-3 px-4">メールアドレス</th>
              <th className="text-left py-3 px-4">権限</th>
              <th className="text-left py-3 px-4">注文数</th>
              <th className="text-left py-3 px-4">登録日</th>
              <th className="text-left py-3 px-4">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  ユーザーがいません
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">{user.name || '名前なし'}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.role === 'ADMIN' ? '管理者' : 'ユーザー'}
                    </span>
                  </td>
                  <td className="py-3 px-4">{user._count.orders}件</td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="py-3 px-4">
                    <UserRoleForm userId={user.id} currentRole={user.role} />
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
              href={`/admin/users?page=${pageNum}`}
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

