import { getProductByIdForAdmin } from '@/lib/actions/product'
import { notFound } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'

export default async function EditProductPage({
  params,
}: {
  params: { id: string }
}) {
  const result = await getProductByIdForAdmin(params.id)

  if (!result.success || !result.product) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">商品編集</h1>
      <ProductForm product={result.product} />
    </div>
  )
}
