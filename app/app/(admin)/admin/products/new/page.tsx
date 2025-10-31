import { createProduct } from '@/lib/actions/product'
import { ProductForm } from '../ProductForm'

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">新規商品登録</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <ProductForm action={createProduct} />
      </div>
    </div>
  )
}
