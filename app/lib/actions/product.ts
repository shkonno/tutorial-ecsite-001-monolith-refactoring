'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export async function createProduct(formData: FormData) {
  // 管理者権限チェック
  const session = await auth()
  if (!session || session.user?.role !== 'ADMIN') {
    return { error: '管理者権限が必要です' }
  }

  // フォームデータの取得
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = formData.get('price') as string
  const stock = formData.get('stock') as string
  const category = formData.get('category') as string
  const imageUrl = formData.get('imageUrl') as string
  const isActive = formData.get('isActive') === 'true'

  // バリデーション
  if (!name || !price) {
    return { error: '商品名と価格は必須です' }
  }

  const priceNum = parseInt(price)
  const stockNum = parseInt(stock) || 0

  if (isNaN(priceNum) || priceNum < 0) {
    return { error: '価格は0以上の数値で入力してください' }
  }

  if (isNaN(stockNum) || stockNum < 0) {
    return { error: '在庫は0以上の数値で入力してください' }
  }

  try {
    // 商品を作成
    await prisma.product.create({
      data: {
        name,
        description: description || null,
        price: priceNum,
        stock: stockNum,
        category: category || null,
        imageUrl: imageUrl || null,
        isActive,
      },
    })

    // キャッシュを再検証
    revalidatePath('/admin/products')
  } catch (error) {
    console.error('商品作成エラー:', error)
    return { error: '商品の作成に失敗しました' }
  }

  // 商品一覧ページにリダイレクト
  redirect('/admin/products')
}

export async function updateProduct(productId: string, formData: FormData) {
  // 管理者権限チェック
  const session = await auth()
  if (!session || session.user?.role !== 'ADMIN') {
    return { error: '管理者権限が必要です' }
  }

  // フォームデータの取得
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = formData.get('price') as string
  const stock = formData.get('stock') as string
  const category = formData.get('category') as string
  const imageUrl = formData.get('imageUrl') as string
  const isActive = formData.get('isActive') === 'true'

  // バリデーション
  if (!name || !price) {
    return { error: '商品名と価格は必須です' }
  }

  const priceNum = parseInt(price)
  const stockNum = parseInt(stock) || 0

  if (isNaN(priceNum) || priceNum < 0) {
    return { error: '価格は0以上の数値で入力してください' }
  }

  if (isNaN(stockNum) || stockNum < 0) {
    return { error: '在庫は0以上の数値で入力してください' }
  }

  try {
    // 商品を更新
    await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description: description || null,
        price: priceNum,
        stock: stockNum,
        category: category || null,
        imageUrl: imageUrl || null,
        isActive,
      },
    })

    // キャッシュを再検証
    revalidatePath('/admin/products')
    revalidatePath(`/admin/products/${productId}/edit`)
  } catch (error) {
    console.error('商品更新エラー:', error)
    return { error: '商品の更新に失敗しました' }
  }

  // 商品一覧ページにリダイレクト
  redirect('/admin/products')
}

export async function deleteProduct(productId: string) {
  // 管理者権限チェック
  const session = await auth()
  if (!session || session.user?.role !== 'ADMIN') {
    return { error: '管理者権限が必要です' }
  }

  try {
    // 商品を削除
    await prisma.product.delete({
      where: { id: productId },
    })

    // キャッシュを再検証
    revalidatePath('/admin/products')

    return { success: true }
  } catch (error) {
    console.error('商品削除エラー:', error)
    return { error: '商品の削除に失敗しました' }
  }
}
