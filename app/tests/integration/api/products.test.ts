/**
 * Products API Integration Tests
 * Issue #43 - API Routeの統合テスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

vi.mock('@/lib/redis', () => ({
  getCachedData: vi.fn((key, fn) => fn()), // キャッシュをバイパスして直接関数を実行
}))

import { GET } from '@/app/api/products/route'
import { prisma } from '@/lib/db'

describe('Products API - GET /api/products', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('商品一覧を取得できる', async () => {
    const mockProducts = [
      {
        id: 'product-1',
        name: 'Test Product 1',
        description: 'Description 1',
        price: 1000,
        stock: 10,
        imageUrl: '/images/product1.jpg',
        category: 'mac',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'product-2',
        name: 'Test Product 2',
        description: 'Description 2',
        price: 2000,
        stock: 5,
        imageUrl: '/images/product2.jpg',
        category: 'tablet',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts)
    vi.mocked(prisma.product.count).mockResolvedValue(2)

    const request = new NextRequest('http://localhost:3000/api/products')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.products).toHaveLength(2)
    expect(data.pagination).toEqual({
      page: 1,
      limit: 12,
      total: 2,
      totalPages: 1,
    })
  })

  it('カテゴリで商品を絞り込める', async () => {
    const mockProducts = [
      {
        id: 'product-1',
        name: 'MacBook Pro',
        description: 'Apple laptop',
        price: 200000,
        stock: 3,
        imageUrl: '/images/macbook.jpg',
        category: 'mac',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts)
    vi.mocked(prisma.product.count).mockResolvedValue(1)

    const request = new NextRequest('http://localhost:3000/api/products?category=mac')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.products).toHaveLength(1)
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: 'mac',
          isActive: true,
        }),
      })
    )
  })

  it('検索クエリで商品を検索できる', async () => {
    const mockProducts = [
      {
        id: 'product-1',
        name: 'MacBook Pro',
        description: 'Apple laptop',
        price: 200000,
        stock: 3,
        imageUrl: '/images/macbook.jpg',
        category: 'mac',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts)
    vi.mocked(prisma.product.count).mockResolvedValue(1)

    const request = new NextRequest('http://localhost:3000/api/products?search=MacBook')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.products).toHaveLength(1)
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isActive: true,
          OR: expect.any(Array),
        }),
      })
    )
  })

  it('ページネーションが正常に動作する', async () => {
    const mockProducts = Array.from({ length: 12 }, (_, i) => ({
      id: `product-${i + 1}`,
      name: `Test Product ${i + 1}`,
      description: `Description ${i + 1}`,
      price: 1000 * (i + 1),
      stock: 10,
      imageUrl: null,
      category: 'mac',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))

    vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts)
    vi.mocked(prisma.product.count).mockResolvedValue(24)

    const request = new NextRequest('http://localhost:3000/api/products?page=2&limit=12')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.pagination).toEqual({
      page: 2,
      limit: 12,
      total: 24,
      totalPages: 2,
    })
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 12, // (page 2 - 1) * limit 12
        take: 12,
      })
    )
  })

  it('商品が見つからない場合は空の配列を返す', async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([])
    vi.mocked(prisma.product.count).mockResolvedValue(0)

    const request = new NextRequest('http://localhost:3000/api/products?category=nonexistent')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.products).toEqual([])
    expect(data.pagination.total).toBe(0)
  })

  it('エラー発生時は500ステータスとエラーメッセージを返す', async () => {
    vi.mocked(prisma.product.findMany).mockRejectedValue(new Error('Database connection failed'))

    const request = new NextRequest('http://localhost:3000/api/products')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('商品の取得に失敗しました')
    expect(data.details).toBe('Database connection failed')
  })

  it('非アクティブな商品は取得されない', async () => {
    const mockProducts = [
      {
        id: 'product-1',
        name: 'Active Product',
        description: 'This is active',
        price: 1000,
        stock: 10,
        imageUrl: null,
        category: 'mac',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts)
    vi.mocked(prisma.product.count).mockResolvedValue(1)

    const request = new NextRequest('http://localhost:3000/api/products')
    await GET(request)

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isActive: true,
        }),
      })
    )
  })
})

