'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { uploadToS3, deleteFromS3, S3_BUCKET } from '@/lib/s3'
import { invalidateCache } from '@/lib/redis'

/**
 * 商品を作成（管理者のみ）
 */
export async function createProduct(formData: FormData) {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: '管理者権限が必要です',
      }
    }

    // フォームデータを取得
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const stock = parseInt(formData.get('stock') as string, 10)
    const category = formData.get('category') as string
    const imageFile = formData.get('image') as File | null
    const isActive = formData.get('isActive') === 'true'

    // バリデーション
    if (!name || !description || !price || !stock || !category) {
      return {
        success: false,
        error: 'すべての必須項目を入力してください',
      }
    }

    if (price <= 0) {
      return {
        success: false,
        error: '価格は0より大きい値を入力してください',
      }
    }

    if (stock < 0) {
      return {
        success: false,
        error: '在庫数は0以上の値を入力してください',
      }
    }

    // 画像をアップロード
    let imageUrl: string | null = null
    if (imageFile && imageFile.size > 0) {
      try {
        const arrayBuffer = await imageFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const key = `products/${Date.now()}-${imageFile.name}`
        imageUrl = await uploadToS3(buffer, key, imageFile.type)
      } catch (error) {
        return {
          success: false,
          error: '画像のアップロードに失敗しました',
        }
      }
    }

    // 商品を作成
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        category,
        imageUrl,
        isActive,
      },
    })

    // キャッシュを無効化
    await invalidateCache('products:*')

    revalidatePath('/admin/products')
    revalidatePath('/products')

    return {
      success: true,
      message: '商品を作成しました',
      productId: product.id,
    }
  } catch (error: any) {
    console.error('商品作成エラー:', error)
    return {
      success: false,
      error: '商品の作成に失敗しました',
    }
  }
}

/**
 * 商品を更新（管理者のみ）
 */
export async function updateProduct(productId: string, formData: FormData) {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: '管理者権限が必要です',
      }
    }

    // 商品が存在するか確認
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!existingProduct) {
      return {
        success: false,
        error: '商品が見つかりません',
      }
    }

    // フォームデータを取得
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const stock = parseInt(formData.get('stock') as string, 10)
    const category = formData.get('category') as string
    const imageFile = formData.get('image') as File | null
    const isActive = formData.get('isActive') === 'true'

    // バリデーション
    if (!name || !description || !price || !stock || !category) {
      return {
        success: false,
        error: 'すべての必須項目を入力してください',
      }
    }

    if (price <= 0) {
      return {
        success: false,
        error: '価格は0より大きい値を入力してください',
      }
    }

    if (stock < 0) {
      return {
        success: false,
        error: '在庫数は0以上の値を入力してください',
      }
    }

    // 画像をアップロード（新しい画像がある場合）
    let imageUrl = existingProduct.imageUrl
    if (imageFile && imageFile.size > 0) {
      try {
        // 古い画像を削除
        if (existingProduct.imageUrl) {
          const oldKey = existingProduct.imageUrl.split(`/${S3_BUCKET}/`)[1]
          if (oldKey) {
            await deleteFromS3(oldKey)
          }
        }

        // 新しい画像をアップロード
        const arrayBuffer = await imageFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const key = `products/${Date.now()}-${imageFile.name}`
        imageUrl = await uploadToS3(buffer, key, imageFile.type)
      } catch (error) {
        return {
          success: false,
          error: '画像のアップロードに失敗しました',
        }
      }
    }

    // 商品を更新
    await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        price,
        stock,
        category,
        imageUrl,
        isActive,
      },
    })

    // キャッシュを無効化
    await invalidateCache('products:*')

    revalidatePath('/admin/products')
    revalidatePath('/products')
    revalidatePath(`/products/${productId}`)

    return {
      success: true,
      message: '商品を更新しました',
    }
  } catch (error: any) {
    console.error('商品更新エラー:', error)
    return {
      success: false,
      error: '商品の更新に失敗しました',
    }
  }
}

/**
 * 商品を削除（管理者のみ）
 */
export async function deleteProduct(productId: string) {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: '管理者権限が必要です',
      }
    }

    // 商品が存在するか確認
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return {
        success: false,
        error: '商品が見つかりません',
      }
    }

    // 画像を削除
    if (product.imageUrl) {
      try {
        const key = product.imageUrl.split(`/${S3_BUCKET}/`)[1]
        if (key) {
          await deleteFromS3(key)
        }
      } catch (error) {
        console.error('画像削除エラー:', error)
        // 画像削除失敗は致命的ではないので続行
      }
    }

    // 商品を削除
    await prisma.product.delete({
      where: { id: productId },
    })

    // キャッシュを無効化
    await invalidateCache('products:*')

    revalidatePath('/admin/products')
    revalidatePath('/products')

    return {
      success: true,
      message: '商品を削除しました',
    }
  } catch (error: any) {
    console.error('商品削除エラー:', error)
    return {
      success: false,
      error: '商品の削除に失敗しました',
    }
  }
}

/**
 * 商品の有効/無効を切り替え（管理者のみ）
 */
export async function toggleProductStatus(productId: string) {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: '管理者権限が必要です',
      }
    }

    // 商品が存在するか確認
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return {
        success: false,
        error: '商品が見つかりません',
      }
    }

    // ステータスを切り替え
    await prisma.product.update({
      where: { id: productId },
      data: { isActive: !product.isActive },
    })

    // キャッシュを無効化
    await invalidateCache('products:*')

    revalidatePath('/admin/products')
    revalidatePath('/products')

    return {
      success: true,
      message: `商品を${product.isActive ? '無効' : '有効'}にしました`,
    }
  } catch (error: any) {
    console.error('商品ステータス切り替えエラー:', error)
    return {
      success: false,
      error: '商品ステータスの切り替えに失敗しました',
    }
  }
}

/**
 * 全商品を取得（管理者用）
 */
export async function getAllProductsForAdmin(page: number = 1, limit: number = 20) {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: '管理者権限が必要です',
      }
    }

    const skip = (page - 1) * limit

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count(),
    ])

    return {
      success: true,
      products,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    }
  } catch (error: any) {
    console.error('商品一覧取得エラー:', error)
    return {
      success: false,
      error: '商品一覧の取得に失敗しました',
    }
  }
}
