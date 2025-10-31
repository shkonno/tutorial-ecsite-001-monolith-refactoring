import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCachedData } from '@/lib/redis'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log(`📦 商品詳細取得リクエスト: ID=${id}`)

    // キャッシュキーを生成
    const cacheKey = `product:${id}`

    // キャッシュから取得、またはデータベースから取得
    const product = await getCachedData(
      cacheKey,
      async () => {
        console.log(`🔍 データベースから商品を検索: ID=${id}`)
        const product = await prisma.product.findUnique({
          where: { id },
        })

        if (!product) {
          console.log(`⚠️ 商品が見つかりません: ID=${id}`)
          return null
        }

        console.log(`✅ 商品が見つかりました: ${product.name}`)
        return product
      },
      600 // 10分間キャッシュ
    )

    if (!product) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('❌ 商品詳細取得エラー:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('エラー詳細:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { error: '商品の取得に失敗しました', details: errorMessage },
      { status: 500 }
    )
  }
}

