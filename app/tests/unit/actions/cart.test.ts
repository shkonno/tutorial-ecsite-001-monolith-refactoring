/**
 * Cart Actions Unit Tests
 * Issue #42 - Server Actionsのユニットテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock dependencies BEFORE importing the functions
vi.mock('@/lib/db', () => ({
  prisma: {
    product: {
      findUnique: vi.fn(),
    },
    cartItem: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Import after mocking
import { addToCart, updateCartItem, removeFromCart, clearCart, getCartItemCount, getCartItems } from '@/lib/actions/cart'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

describe('Cart Actions - addToCart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('未認証ユーザーは商品をカートに追加できない', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const result = await addToCart('product-1', 1)

    expect(result).toEqual({
      success: false,
      error: 'ログインが必要です',
    })
  })

  it('存在しない商品は追加できない', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com', role: 'USER', name: null, image: null },
      expires: ''
    })
    vi.mocked(prisma.product.findUnique).mockResolvedValue(null)

    const result = await addToCart('non-existent-product', 1)

    expect(result).toEqual({
      success: false,
      error: '商品が見つかりません',
    })
  })

  it('在庫不足の商品は追加できない', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com', role: 'USER', name: null, image: null },
      expires: ''
    })
    vi.mocked(prisma.product.findUnique).mockResolvedValue({
      id: 'product-1',
      name: 'Test Product',
      description: null,
      price: 1000,
      stock: 2,
      imageUrl: null,
      category: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await addToCart('product-1', 5)

    expect(result).toEqual({
      success: false,
      error: '在庫が不足しています',
    })
  })

  it('新規商品をカートに追加できる', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com', role: 'USER', name: null, image: null },
      expires: ''
    })
    vi.mocked(prisma.product.findUnique).mockResolvedValue({
      id: 'product-1',
      name: 'Test Product',
      description: null,
      price: 1000,
      stock: 10,
      imageUrl: null,
      category: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    vi.mocked(prisma.cartItem.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.cartItem.create).mockResolvedValue({
      id: 'cart-1',
      userId: 'user-1',
      productId: 'product-1',
      quantity: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await addToCart('product-1', 1)

    expect(result.success).toBe(true)
    expect(result.message).toBe('カートに追加しました')
    expect(prisma.cartItem.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        productId: 'product-1',
        quantity: 1,
      },
    })
  })

  it('既存のカートアイテムの数量を更新できる', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com', role: 'USER', name: null, image: null },
      expires: ''
    })
    vi.mocked(prisma.product.findUnique).mockResolvedValue({
      id: 'product-1',
      name: 'Test Product',
      description: null,
      price: 1000,
      stock: 10,
      imageUrl: null,
      category: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    vi.mocked(prisma.cartItem.findUnique).mockResolvedValue({
      id: 'cart-1',
      userId: 'user-1',
      productId: 'product-1',
      quantity: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    vi.mocked(prisma.cartItem.update).mockResolvedValue({
      id: 'cart-1',
      userId: 'user-1',
      productId: 'product-1',
      quantity: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await addToCart('product-1', 1)

    expect(result.success).toBe(true)
    expect(prisma.cartItem.update).toHaveBeenCalledWith({
      where: { id: 'cart-1' },
      data: { quantity: 3 },
    })
  })
})

describe('Cart Actions - updateCartItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('未認証ユーザーはカートアイテムを更新できない', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const result = await updateCartItem('cart-1', 2)

    expect(result).toEqual({
      success: false,
      error: 'ログインが必要です',
    })
  })

  it('数量が1未満の場合はエラー', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com', role: 'USER', name: null, image: null },
      expires: ''
    })

    const result = await updateCartItem('cart-1', 0)

    expect(result).toEqual({
      success: false,
      error: '数量は1以上である必要があります',
    })
  })

  it('存在しないカートアイテムは更新できない', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com', role: 'USER', name: null, image: null },
      expires: ''
    })
    vi.mocked(prisma.cartItem.findUnique).mockResolvedValue(null)

    const result = await updateCartItem('non-existent-cart', 2)

    expect(result).toEqual({
      success: false,
      error: 'カートアイテムが見つかりません',
    })
  })

  it('他のユーザーのカートアイテムは更新できない', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com', role: 'USER', name: null, image: null },
      expires: ''
    })
    vi.mocked(prisma.cartItem.findUnique).mockResolvedValue({
      id: 'cart-1',
      userId: 'user-2', // 別のユーザー
      productId: 'product-1',
      quantity: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      product: {
        id: 'product-1',
        name: 'Test Product',
        description: null,
        price: 1000,
        stock: 10,
        imageUrl: null,
        category: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    const result = await updateCartItem('cart-1', 2)

    expect(result).toEqual({
      success: false,
      error: '権限がありません',
    })
  })

  it('在庫が足りない場合はエラー', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com', role: 'USER', name: null, image: null },
      expires: ''
    })
    vi.mocked(prisma.cartItem.findUnique).mockResolvedValue({
      id: 'cart-1',
      userId: 'user-1',
      productId: 'product-1',
      quantity: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      product: {
        id: 'product-1',
        name: 'Test Product',
        description: null,
        price: 1000,
        stock: 2,
        imageUrl: null,
        category: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    const result = await updateCartItem('cart-1', 5)

    expect(result.success).toBe(false)
    expect(result.error).toContain('在庫が不足しています')
  })

  it('カートアイテムの数量を正常に更新できる', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com', role: 'USER', name: null, image: null },
      expires: ''
    })
    vi.mocked(prisma.cartItem.findUnique).mockResolvedValue({
      id: 'cart-1',
      userId: 'user-1',
      productId: 'product-1',
      quantity: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      product: {
        id: 'product-1',
        name: 'Test Product',
        description: null,
        price: 1000,
        stock: 10,
        imageUrl: null,
        category: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    vi.mocked(prisma.cartItem.update).mockResolvedValue({
      id: 'cart-1',
      userId: 'user-1',
      productId: 'product-1',
      quantity: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await updateCartItem('cart-1', 3)

    expect(result).toEqual({
      success: true,
      message: '数量を更新しました',
    })
    expect(prisma.cartItem.update).toHaveBeenCalledWith({
      where: { id: 'cart-1' },
      data: { quantity: 3 },
    })
  })
})

describe('Cart Actions - removeFromCart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('未認証ユーザーはカートから削除できない', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const result = await removeFromCart('cart-1')

    expect(result).toEqual({
      success: false,
      error: 'ログインが必要です',
    })
  })

  it('存在しないカートアイテムは削除できない', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com', role: 'USER', name: null, image: null },
      expires: ''
    })
    vi.mocked(prisma.cartItem.findUnique).mockResolvedValue(null)

    const result = await removeFromCart('non-existent-cart')

    expect(result).toEqual({
      success: false,
      error: 'カートアイテムが見つかりません',
    })
  })

  it('他のユーザーのカートアイテムは削除できない', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com', role: 'USER', name: null, image: null },
      expires: ''
    })
    vi.mocked(prisma.cartItem.findUnique).mockResolvedValue({
      id: 'cart-1',
      userId: 'user-2',
      productId: 'product-1',
      quantity: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await removeFromCart('cart-1')

    expect(result).toEqual({
      success: false,
      error: '権限がありません',
    })
  })

  it('カートアイテムを正常に削除できる', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com', role: 'USER', name: null, image: null },
      expires: ''
    })
    vi.mocked(prisma.cartItem.findUnique).mockResolvedValue({
      id: 'cart-1',
      userId: 'user-1',
      productId: 'product-1',
      quantity: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    vi.mocked(prisma.cartItem.delete).mockResolvedValue({
      id: 'cart-1',
      userId: 'user-1',
      productId: 'product-1',
      quantity: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await removeFromCart('cart-1')

    expect(result).toEqual({
      success: true,
      message: 'カートから削除しました',
    })
    expect(prisma.cartItem.delete).toHaveBeenCalledWith({
      where: { id: 'cart-1' },
    })
  })
})

describe('Cart Actions - clearCart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('未認証ユーザーはカートをクリアできない', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const result = await clearCart()

    expect(result).toEqual({
      success: false,
      error: 'ログインが必要です',
    })
  })

  it('カートを正常にクリアできる', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com', role: 'USER', name: null, image: null },
      expires: ''
    })
    vi.mocked(prisma.cartItem.deleteMany).mockResolvedValue({ count: 3 })

    const result = await clearCart()

    expect(result).toEqual({
      success: true,
      message: 'カートをクリアしました',
    })
    expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
    })
  })
})

describe('Cart Actions - getCartItemCount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('未認証ユーザーのカート数は0を返す', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const count = await getCartItemCount()

    expect(count).toBe(0)
  })

  it('認証ユーザーのカート数を取得できる', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com', role: 'USER', name: null, image: null },
      expires: ''
    })
    vi.mocked(prisma.cartItem.count).mockResolvedValue(5)

    const count = await getCartItemCount()

    expect(count).toBe(5)
  })
})

describe('Cart Actions - getCartItems', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('未認証ユーザーは空配列を返す', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const items = await getCartItems()

    expect(items).toEqual([])
  })

  it('認証ユーザーのカートアイテムを取得できる', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com', role: 'USER', name: null, image: null },
      expires: ''
    })
    
    const mockCartItems = [
      {
        id: 'cart-1',
        userId: 'user-1',
        productId: 'product-1',
        quantity: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        product: {
          id: 'product-1',
          name: 'Product 1',
          description: null,
          price: 1000,
          stock: 10,
          imageUrl: null,
          category: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ]
    
    vi.mocked(prisma.cartItem.findMany).mockResolvedValue(mockCartItems)

    const items = await getCartItems()

    expect(items).toEqual(mockCartItems)
    expect(prisma.cartItem.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    })
  })
})

