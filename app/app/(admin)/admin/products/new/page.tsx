import ProductForm from '@/components/admin/ProductForm'

export default function NewProductPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">新規商品作成</h1>
      <ProductForm />
    </div>
  )
}
