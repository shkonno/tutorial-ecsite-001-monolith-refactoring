import Link from 'next/link'
import { FiHome, FiSearch } from 'react-icons/fi'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-indigo-600">404</h1>
          <p className="text-2xl font-semibold text-gray-900 mt-4">
            ページが見つかりません
          </p>
          <p className="text-gray-600 mt-2">
            お探しのページは存在しないか、移動された可能性があります。
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors space-x-2"
          >
            <FiHome className="w-5 h-5" />
            <span>ホームに戻る</span>
          </Link>
          
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors space-x-2"
          >
            <FiSearch className="w-5 h-5" />
            <span>商品を探す</span>
          </Link>
        </div>

        <div className="mt-12">
          <p className="text-sm text-gray-500 mb-4">よく見られるページ</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/products" className="text-indigo-600 hover:underline text-sm">
              商品一覧
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/cart" className="text-indigo-600 hover:underline text-sm">
              カート
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/orders" className="text-indigo-600 hover:underline text-sm">
              注文履歴
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/contact" className="text-indigo-600 hover:underline text-sm">
              お問い合わせ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

