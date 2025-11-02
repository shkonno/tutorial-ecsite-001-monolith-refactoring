import { redirect } from 'next/navigation'
import { ProductForm } from '@/app/(admin)/admin/products/ProductForm'
import { createProduct } from '@/lib/actions/product'

export default function NewProductPage() {
  async function handleCreateProduct(formData: FormData) {
    'use server'
    
    const result = await createProduct({
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">新規商品作成</h1>
      <ProductForm action={handleCreateProduct} />
    </div>
  )
}
