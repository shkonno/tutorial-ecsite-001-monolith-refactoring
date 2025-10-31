'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type { PrismaClient } from '@prisma/client'

interface CheckoutData {
  shippingName: string
  shippingEmail: string
  shippingAddress: string
}

/**
 * 注文を作成（トランザクション処理）
 */
export async function createOrder(checkoutData: CheckoutData) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'ログインが必要です',
      }
    }

    // バリデーション
    if (!checkoutData.shippingName || !checkoutData.shippingEmail || !checkoutData.shippingAddress) {
      return {
        success: false,
        error: 'すべての配送情報を入力してください',
      }
    }

    // カートアイテムを取得
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: true },
    })

    if (cartItems.length === 0) {
      return {
        success: false,
        error: 'カートが空です',
      }
    }

    // トランザクションで注文を作成
    const order = await prisma.$transaction(async (tx: PrismaClient) => {
      // 在庫チェックと在庫減算
      for (const item of cartItems) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true, isActive: true },
        })

        if (!product || !product.isActive) {
          throw new Error(`商品 "${item.product.name}" は現在購入できません`)
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `商品 "${item.product.name}" の在庫が不足しています（在庫: ${product.stock}個）`
          )
        }

        // 在庫を減らす
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      // 合計金額を計算
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      )

      // 注文を作成
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          totalAmount,
          shippingName: checkoutData.shippingName,
          shippingEmail: checkoutData.shippingEmail,
          shippingAddress: checkoutData.shippingAddress,
          status: 'PENDING',
          orderItems: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      })

      // カートをクリア
      await tx.cartItem.deleteMany({
        where: { userId: session.user.id },
      })

      return newOrder
    })

    revalidatePath('/cart')
    revalidatePath('/orders')

    return {
      success: true,
      message: '注文が完了しました',
      orderId: order.id,
    }
  } catch (error) {
    console.error('注文作成エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '注文の作成に失敗しました',
    }
  }
}

/**
 * 注文一覧を取得
 */
export async function getOrders() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return []
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return orders
  } catch (error) {
    console.error('注文一覧取得エラー:', error)
    return []
  }
}

/**
 * 注文詳細を取得
 */
export async function getOrderById(orderId: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return null
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: session.user.id, // 自分の注文のみ取得
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    })

    return order
  } catch (error) {
    console.error('注文詳細取得エラー:', error)
    return null
  }
}

/**
 * 注文をキャンセル
 */
export async function cancelOrder(orderId: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'ログインが必要です',
      }
    }

    // 注文を取得
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    })

    if (!order) {
      return {
        success: false,
        error: '注文が見つかりません',
      }
    }

    // 所有者確認
    if (order.userId !== session.user.id) {
      return {
        success: false,
        error: '権限がありません',
      }
    }

    // キャンセル可能かチェック（発送前のみ）
    if (order.status === 'SHIPPED' || order.status === 'DELIVERED') {
      return {
        success: false,
        error: '発送済みの注文はキャンセルできません',
      }
    }

    if (order.status === 'CANCELLED') {
      return {
        success: false,
        error: 'この注文は既にキャンセルされています',
      }
    }

    // トランザクションで在庫を戻してキャンセル
    await prisma.$transaction(async (tx: PrismaClient) => {
      // 在庫を戻す
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      }

      // 注文ステータスを更新
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      })
    })

    revalidatePath('/orders')
    revalidatePath(`/orders/${orderId}`)

    return {
      success: true,
      message: '注文をキャンセルしました',
    }
  } catch (error) {
    console.error('注文キャンセルエラー:', error)
    return {
      success: false,
      error: '注文のキャンセルに失敗しました',
    }
  }
}

