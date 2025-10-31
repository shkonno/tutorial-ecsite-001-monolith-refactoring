import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // 管理者権限チェック
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 管理者ヘッダー */}
      <header className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/admin" className="text-xl font-bold">
                管理者ダッシュボード
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300">
                {session.user?.email}
              </span>
              <Link
                href="/"
                className="text-sm hover:text-gray-300 transition-colors"
              >
                ショップに戻る
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* サイドバーナビゲーション */}
        <aside className="w-64 bg-white shadow-md min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            <Link
              href="/admin"
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              📊 ダッシュボード
            </Link>
            <Link
              href="/admin/products"
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              📦 商品管理
            </Link>
            <Link
              href="/admin/orders"
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              📋 注文管理
            </Link>
            <Link
              href="/admin/users"
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              👥 ユーザー管理
            </Link>
          </nav>
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

