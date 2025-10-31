import { prisma } from '@/lib/db'
import { ProductForm } from '@/components/admin/ProductForm'
import { notFound } from 'next/navigation'

export default async function EditProductPage({
  params,
}: {
  params: { id: string }
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  })

  if (!product) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">商品編集</h1>
      <ProductForm product={product} />
    </div>
  )
}
