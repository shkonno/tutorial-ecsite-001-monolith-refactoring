import { PrismaClient } from '@prisma/client'

// PrismaClientのグローバル型定義
declare global {
  var prisma: PrismaClient | undefined
}

// 開発環境ではホットリロード時にPrismaClientインスタンスが複数作成されるのを防ぐ
export const prisma = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

// データベース接続のヘルパー関数
export async function connectDB() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    throw error
  }
}

// データベース切断のヘルパー関数
export async function disconnectDB() {
  await prisma.$disconnect()
}

// トランザクション実行のヘルパー関数
export async function transaction<T>(
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(callback as any) as any
}

