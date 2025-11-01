import { getProductByIdForAdmin, updateProduct } from '@/lib/actions/product'
import { notFound, redirect } from 'next/navigation'
import { ProductForm } from '@/app/(admin)/admin/products/ProductForm'

export default async function EditProductPage({
  params,
}: {
  params: { id: string }
}) {
  const result = await getProductByIdForAdmin(params.id)

  if (!result.success || !result.product) {
    notFound()
  }

  async function handleUpdateProduct(formData: FormData) {
    'use server'
    
    const result = await updateProduct(params.id, {
      name: formData.get('name') as string,
      description: formData.get('description') as string | undefined,
      price: parseInt(formData.get('price') as string),
      stock: parseInt(formData.get('stock') as string) || 0,
      imageUrl: formData.get('imageUrl') as string | undefined,
      category: formData.get('category') as string | undefined,
      isActive: formData.get('isActive') === 'true',
    })

    if (result.success) {
      redirect('/admin/products')
    }

    return { error: result.error }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">商品編集</h1>
      <ProductForm product={result.product} action={handleUpdateProduct} />
    </div>
  )
}
