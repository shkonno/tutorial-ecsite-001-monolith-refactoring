import { getAllProductsForAdmin } from '@/lib/actions/product'
import Link from 'next/link'
import Image from 'next/image'
import { ProductActions } from '@/components/admin/ProductActions'

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const page = parseInt(searchParams.page || '1', 10)
  const result = await getAllProductsForAdmin(page, 20)

  if (!result.success || !result.products) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">商品管理</h1>
        <p className="text-red-600">{result.error || '商品の取得に失敗しました'}</p>
      </div>
    )
  }

  const { products, pagination } = result

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">商品管理</h1>
        <Link
          href="/admin/products/new"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          ➕ 新規商品登録
        </Link>
      </div>

      {/* 商品一覧テーブル */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4">画像</th>
              <th className="text-left py-3 px-4">商品名</th>
              <th className="text-left py-3 px-4">カテゴリ</th>
              <th className="text-left py-3 px-4">価格</th>
              <th className="text-left py-3 px-4">在庫</th>
              <th className="text-left py-3 px-4">ステータス</th>
              <th className="text-left py-3 px-4">操作</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  商品がありません
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={60}
                        height={60}
                        className="rounded object-cover"
                      />
                    ) : (
                      <div className="w-[60px] h-[60px] bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/products/${product.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {product.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4">{product.category}</td>
                  <td className="py-3 px-4">¥{product.price.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`${
                        product.stock === 0
                          ? 'text-red-600 font-semibold'
                          : product.stock < 10
                          ? 'text-orange-600'
                          : 'text-gray-900'
                      }`}
                    >
                      {product.stock}個
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {product.isActive ? '有効' : '無効'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <ProductActions productId={product.id} isActive={product.isActive} />
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
              href={`/admin/products?page=${pageNum}`}
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
