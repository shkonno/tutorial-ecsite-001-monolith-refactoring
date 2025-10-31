'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { invalidateCache } from '@/lib/redis'

/**
 * 商品を作成（管理者のみ）
 */
export async function createProduct(formData: {
  name: string
  description?: string
  price: number
  stock: number
  imageUrl?: string
  category?: string
  isActive: boolean
}) {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: '管理者権限が必要です',
      }
    }

    // バリデーション
    if (!formData.name || formData.name.trim().length === 0) {
      return {
        success: false,
        error: '商品名を入力してください',
      }
    }

    if (formData.price <= 0) {
      return {
        success: false,
        error: '価格は1円以上で入力してください',
      }
    }

    if (formData.stock < 0) {
      return {
        success: false,
        error: '在庫数は0以上で入力してください',
      }
    }

    // 商品を作成
    const product = await prisma.product.create({
      data: {
        name: formData.name.trim(),
        description: formData.description?.trim(),
        price: formData.price,
        stock: formData.stock,
        imageUrl: formData.imageUrl,
        category: formData.category?.trim(),
        isActive: formData.isActive,
      },
    })

    // キャッシュを無効化
    await invalidateCache('products:*')

    revalidatePath('/admin/products')
    revalidatePath('/products')

    return {
      success: true,
      product,
      message: '商品を作成しました',
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
export async function updateProduct(
  productId: string,
  formData: {
    name: string
    description?: string
    price: number
    stock: number
    imageUrl?: string
    category?: string
    isActive: boolean
  }
) {
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

    // バリデーション
    if (!formData.name || formData.name.trim().length === 0) {
      return {
        success: false,
        error: '商品名を入力してください',
      }
    }

    if (formData.price <= 0) {
      return {
        success: false,
        error: '価格は1円以上で入力してください',
      }
    }

    if (formData.stock < 0) {
      return {
        success: false,
        error: '在庫数は0以上で入力してください',
      }
    }

    // 商品を更新
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name: formData.name.trim(),
        description: formData.description?.trim(),
        price: formData.price,
        stock: formData.stock,
        imageUrl: formData.imageUrl,
        category: formData.category?.trim(),
        isActive: formData.isActive,
      },
    })

    // キャッシュを無効化
    await invalidateCache('products:*')
    await invalidateCache(`product:${productId}`)

    revalidatePath('/admin/products')
    revalidatePath('/products')
    revalidatePath(`/products/${productId}`)

    return {
      success: true,
      product,
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
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        orderItems: true,
      },
    })

    if (!existingProduct) {
      return {
        success: false,
        error: '商品が見つかりません',
      }
    }

    // 注文済み商品の場合は論理削除（isActiveをfalseに）
    if (existingProduct.orderItems.length > 0) {
      await prisma.product.update({
        where: { id: productId },
        data: { isActive: false },
      })

      // キャッシュを無効化
      await invalidateCache('products:*')
      await invalidateCache(`product:${productId}`)

      revalidatePath('/admin/products')
      revalidatePath('/products')

      return {
        success: true,
        message: '商品を非公開にしました（注文履歴に含まれるため削除できません）',
      }
    }

    // 注文がない場合は物理削除
    await prisma.product.delete({
      where: { id: productId },
    })

    // キャッシュを無効化
    await invalidateCache('products:*')
    await invalidateCache(`product:${productId}`)

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
 * 商品検索（管理者用）
 */
export async function searchProductsForAdmin(
  query: string,
  category?: string,
  isActive?: boolean,
  page: number = 1,
  limit: number = 20
) {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: '管理者権限が必要です',
      }
    }

    const skip = (page - 1) * limit

    const where: any = {}

    if (query && query.trim().length > 0) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ]
    }

    if (category && category !== 'all') {
      where.category = category
    }

    if (isActive !== undefined) {
      where.isActive = isActive
    }

    const [products, totalCount, categories] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              orderItems: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
      // 全カテゴリを取得
      prisma.product.groupBy({
        by: ['category'],
        where: {
          category: { not: null },
        },
        _count: true,
      }),
    ])

    return {
      success: true,
      products,
      categories: categories.map((c) => ({
        name: c.category,
        count: c._count,
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    }
  } catch (error: any) {
    console.error('商品検索エラー:', error)
    return {
      success: false,
      error: '商品の検索に失敗しました',
    }
  }
}

/**
 * 商品詳細を取得（管理者用）
 */
export async function getProductByIdForAdmin(productId: string) {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: '管理者権限が必要です',
      }
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        _count: {
          select: {
            orderItems: true,
            cartItems: true,
          },
        },
      },
    })

    if (!product) {
      return {
        success: false,
        error: '商品が見つかりません',
      }
    }

    return {
      success: true,
      product,
    }
  } catch (error: any) {
    console.error('商品詳細取得エラー:', error)
    return {
      success: false,
      error: '商品詳細の取得に失敗しました',
    }
  }
}
