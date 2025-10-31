'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

/**
 * 注文ステータスを更新（管理者のみ）
 */
export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: '管理者権限が必要です',
      }
    }

    // 注文が存在するか確認
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return {
        success: false,
        error: '注文が見つかりません',
      }
    }

    // ステータスのバリデーション
    const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return {
        success: false,
        error: '無効なステータスです',
      }
    }

    // ステータスを更新
    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    })

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath('/orders')

    return {
      success: true,
      message: '注文ステータスを更新しました',
    }
  } catch (error: any) {
    console.error('注文ステータス更新エラー:', error)
    return {
      success: false,
      error: '注文ステータスの更新に失敗しました',
    }
  }
}

/**
 * 全注文を取得（管理者用）
 */
export async function getAllOrdersForAdmin(
  page: number = 1,
  limit: number = 20,
  statusFilter?: string
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

    const where = statusFilter ? { status: statusFilter } : {}

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true },
          },
          orderItems: {
            include: {
              product: {
                select: { name: true },
              },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ])

    return {
      success: true,
      orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    }
  } catch (error: any) {
    console.error('注文一覧取得エラー:', error)
    return {
      success: false,
      error: '注文一覧の取得に失敗しました',
    }
  }
}

/**
 * 注文詳細を取得（管理者用）
 */
export async function getOrderByIdForAdmin(orderId: string) {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: '管理者権限が必要です',
      }
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      return {
        success: false,
        error: '注文が見つかりません',
      }
    }

    return {
      success: true,
      order,
    }
  } catch (error: any) {
    console.error('注文詳細取得エラー:', error)
    return {
      success: false,
      error: '注文詳細の取得に失敗しました',
    }
  }
}

/**
 * 全ユーザーを取得（管理者用）
 */
export async function getAllUsersForAdmin(page: number = 1, limit: number = 20) {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: '管理者権限が必要です',
      }
    }

    const skip = (page - 1) * limit

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
            },
          },
        },
      }),
      prisma.user.count(),
    ])

    return {
      success: true,
      users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    }
  } catch (error: any) {
    console.error('ユーザー一覧取得エラー:', error)
    return {
      success: false,
      error: 'ユーザー一覧の取得に失敗しました',
    }
  }
}

/**
 * ユーザーの権限を変更（管理者のみ）
 */
export async function updateUserRole(userId: string, role: string) {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: '管理者権限が必要です',
      }
    }

    // 自分自身の権限は変更できない
    if (userId === session.user.id) {
      return {
        success: false,
        error: '自分自身の権限は変更できません',
      }
    }

    // ユーザーが存在するか確認
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return {
        success: false,
        error: 'ユーザーが見つかりません',
      }
    }

    // ロールのバリデーション
    const validRoles = ['USER', 'ADMIN']
    if (!validRoles.includes(role)) {
      return {
        success: false,
        error: '無効なロールです',
      }
    }

    // ロールを更新
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    })

    revalidatePath('/admin/users')

    return {
      success: true,
      message: 'ユーザーの権限を更新しました',
    }
  } catch (error: any) {
    console.error('ユーザー権限更新エラー:', error)
    return {
      success: false,
      error: 'ユーザー権限の更新に失敗しました',
    }
  }
}
