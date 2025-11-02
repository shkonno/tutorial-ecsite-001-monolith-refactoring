import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('シードデータの投入を開始します...')

  // 既存のデータをクリア（開発環境のみ）
  if (process.env.NODE_ENV === 'development') {
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.cartItem.deleteMany()
    await prisma.product.deleteMany()
    await prisma.user.deleteMany()
    console.log('既存データをクリアしました')
  }

  // 管理者ユーザーを作成
  const adminPassword = await bcrypt.hash('password123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: '管理者',
      password: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log('管理者ユーザーを作成しました:', admin.email)

  // 一般ユーザーを作成
  const userPassword = await bcrypt.hash('password123', 10)
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: '田中太郎',
      password: userPassword,
      role: 'USER',
    },
  })
  console.log('一般ユーザーを作成しました:', user.email)

  // 商品を作成
  const products = await prisma.product.createMany({
    data: [
      {
        name: 'MacBook Pro 14インチ',
        description: 'Apple M3 Pro チップ搭載、16GB RAM、512GB SSD',
        price: 298000,
        stock: 10,
        category: 'electronics',
        imageUrl: 'https://placehold.co/400x400/4F46E5/FFFFFF/png?text=MacBook',
        isActive: true,
      },
      {
        name: 'iPhone 15 Pro',
        description: 'A17 Proチップ搭載、128GB',
        price: 159800,
        stock: 25,
        category: 'electronics',
        imageUrl: 'https://placehold.co/400x400/8B5CF6/FFFFFF/png?text=iPhone',
        isActive: true,
      },
      {
        name: 'AirPods Pro (第2世代)',
        description: 'アクティブノイズキャンセリング搭載',
        price: 39800,
        stock: 50,
        category: 'electronics',
        imageUrl: 'https://placehold.co/400x400/EC4899/FFFFFF/png?text=AirPods',
        isActive: true,
      },
      {
        name: 'Magic Mouse',
        description: 'ワイヤレス充電式マウス',
        price: 12800,
        stock: 30,
        category: 'electronics',
        imageUrl: 'https://placehold.co/400x400/10B981/FFFFFF/png?text=Mouse',
        isActive: true,
      },
      {
        name: 'デニムジャケット',
        description: 'カジュアルな春秋用アウター',
        price: 8900,
        stock: 15,
        category: 'fashion',
        imageUrl: 'https://placehold.co/400x400/F59E0B/FFFFFF/png?text=Denim',
        isActive: true,
      },
      {
        name: 'スニーカー',
        description: '快適な履き心地のカジュアルシューズ',
        price: 12000,
        stock: 20,
        category: 'fashion',
        imageUrl: 'https://placehold.co/400x400/EF4444/FFFFFF/png?text=Shoes',
        isActive: true,
      },
      {
        name: 'プログラミング入門書',
        description: 'TypeScript/Next.js完全ガイド',
        price: 3200,
        stock: 100,
        category: 'books',
        imageUrl: 'https://placehold.co/400x400/3B82F6/FFFFFF/png?text=Book',
        isActive: true,
      },
      {
        name: 'ワイヤレスキーボード',
        description: 'Bluetooth接続、薄型デザイン',
        price: 7800,
        stock: 40,
        category: 'electronics',
        imageUrl: 'https://placehold.co/400x400/6366F1/FFFFFF/png?text=Keyboard',
        isActive: true,
      },
      {
        name: 'バックパック',
        description: '大容量、PC収納可能',
        price: 6500,
        stock: 25,
        category: 'fashion',
        imageUrl: 'https://placehold.co/400x400/14B8A6/FFFFFF/png?text=Backpack',
        isActive: true,
      },
      {
        name: 'ビジネス書ベストセラー',
        description: '世界的ベストセラーのビジネス指南書',
        price: 1980,
        stock: 80,
        category: 'books',
        imageUrl: 'https://placehold.co/400x400/F97316/FFFFFF/png?text=Business',
        isActive: true,
      },
    ],
  })
  console.log(`${products.count}件の商品を作成しました`)

  console.log('シードデータの投入が完了しました！')
}

main()
  .catch((e) => {
    console.error('シードデータ投入中にエラーが発生しました:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

