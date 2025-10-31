import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { CartItem, Product } from '@prisma/client'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      )
    }

    // カートアイテムを取得
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // 合計金額を計算
    const total = cartItems.reduce(
      (sum: number, item: CartItem & { product: Product }) => sum + item.product.price * item.quantity,
      0
    )

    // 合計商品数を計算
    const itemCount = cartItems.reduce((sum: number, item: CartItem) => sum + item.quantity, 0)

    return NextResponse.json({
      items: cartItems,
      total,
      itemCount,
    })
  } catch (error) {
    console.error('カート取得エラー:', error)
    return NextResponse.json(
      { error: 'カートの取得に失敗しました' },
      { status: 500 }
    )
  }
}

