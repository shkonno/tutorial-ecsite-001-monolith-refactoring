import { vi } from 'vitest'

// Prismaクライアントのモック
export const prisma = {
  product: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
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
  order: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
  },
}

// Next Authのモック
export const auth = vi.fn()

// Next Cacheのモック
export const revalidatePath = vi.fn()

// Redisのモック
export const invalidateCache = vi.fn()

