'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

/**
 * カートに商品を追加
 */
export async function addToCart(productId: string, quantity: number = 1) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'ログインが必要です',
      }
    }

    // 商品の存在と在庫を確認
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return {
        success: false,
        error: '商品が見つかりません',
      }
    }

    if (product.stock < quantity) {
      return {
        success: false,
        error: '在庫が不足しています',
      }
    }

    // カートアイテムが既に存在するか確認
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    })

    if (existingCartItem) {
      // 既存のカートアイテムの数量を更新
      const newQuantity = existingCartItem.quantity + quantity

      if (product.stock < newQuantity) {
        return {
          success: false,
          error: '在庫が不足しています',
        }
      }

      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
      })
    } else {
      // 新しいカートアイテムを作成
      await prisma.cartItem.create({
        data: {
          userId: session.user.id,
          productId,
          quantity,
        },
      })
    }

    revalidatePath('/cart')
    revalidatePath('/products')

    return {
      success: true,
      message: 'カートに追加しました',
    }
  } catch (error: any) {
    console.error('カート追加エラー:', error)
    return {
      success: false,
      error: 'カートへの追加に失敗しました',
    }
  }
}

/**
 * カートアイテムの数量を更新
 */
export async function updateCartItem(cartItemId: string, quantity: number) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'ログインが必要です',
      }
    }

    if (quantity < 1) {
      return {
        success: false,
        error: '数量は1以上である必要があります',
      }
    }

    // カートアイテムを取得
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { product: true },
    })

    if (!cartItem) {
      return {
        success: false,
        error: 'カートアイテムが見つかりません',
      }
    }

    // 所有者確認
    if (cartItem.userId !== session.user.id) {
      return {
        success: false,
        error: '権限がありません',
      }
    }

    // 在庫確認
    if (cartItem.product.stock < quantity) {
      return {
        success: false,
        error: `在庫が不足しています（在庫: ${cartItem.product.stock}個）`,
      }
    }

    // 数量を更新
    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    })

    revalidatePath('/cart')

    return {
      success: true,
      message: '数量を更新しました',
    }
  } catch (error: any) {
    console.error('カート更新エラー:', error)
    return {
      success: false,
      error: 'カートの更新に失敗しました',
    }
  }
}

/**
 * カートから商品を削除
 */
export async function removeFromCart(cartItemId: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'ログインが必要です',
      }
    }

    // カートアイテムを取得
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    })

    if (!cartItem) {
      return {
        success: false,
        error: 'カートアイテムが見つかりません',
      }
    }

    // 所有者確認
    if (cartItem.userId !== session.user.id) {
      return {
        success: false,
        error: '権限がありません',
      }
    }

    // カートアイテムを削除
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    })

    revalidatePath('/cart')

    return {
      success: true,
      message: 'カートから削除しました',
    }
  } catch (error: any) {
    console.error('カート削除エラー:', error)
    return {
      success: false,
      error: 'カートからの削除に失敗しました',
    }
  }
}

/**
 * カートをクリア
 */
export async function clearCart() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'ログインが必要です',
      }
    }

    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id },
    })

    revalidatePath('/cart')

    return {
      success: true,
      message: 'カートをクリアしました',
    }
  } catch (error: any) {
    console.error('カートクリアエラー:', error)
    return {
      success: false,
      error: 'カートのクリアに失敗しました',
    }
  }
}

/**
 * カートの商品数を取得
 */
export async function getCartItemCount(): Promise<number> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return 0
    }

    const count = await prisma.cartItem.count({
      where: { userId: session.user.id },
    })

    return count
  } catch (error) {
    console.error('カート数取得エラー:', error)
    return 0
  }
}

/**
 * カート内の商品を取得
 */
export async function getCartItems() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return []
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return cartItems
  } catch (error) {
    console.error('カート取得エラー:', error)
    return []
  }
}

