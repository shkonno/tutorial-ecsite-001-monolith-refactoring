import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCachedData } from '@/lib/redis'

// ひらがな→カタカナ変換
function hiraganaToKatakana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, (match) => {
    const chr = match.charCodeAt(0) + 0x60
    return String.fromCharCode(chr)
  })
}

// カタカナ→ひらがな変換
function katakanaToHiragana(str: string): string {
  return str.replace(/[\u30a1-\u30f6]/g, (match) => {
    const chr = match.charCodeAt(0) - 0x60
    return String.fromCharCode(chr)
  })
}

// 検索クエリを正規化（ひらがな、カタカナ、全角英数、半角英数を考慮）
function normalizeSearchQuery(query: string): string[] {
  const normalized = []
  
  // 元のクエリ
  normalized.push(query)
  
  // ひらがな→カタカナ
  const katakana = hiraganaToKatakana(query)
  if (katakana !== query) {
    normalized.push(katakana)
  }
  
  // カタカナ→ひらがな
  const hiragana = katakanaToHiragana(query)
  if (hiragana !== query) {
    normalized.push(hiragana)
  }
  
  // 全角→半角
  const halfWidth = query.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
  })
  if (halfWidth !== query) {
    normalized.push(halfWidth)
  }
  
  return [...new Set(normalized)] // 重複削除
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    console.log(`📦 商品一覧取得リクエスト: category=${category}, search=${search}, page=${page}`)

    // キャッシュキーを生成
    const cacheKey = `products:${category || 'all'}:${search || 'none'}:${page}:${limit}`

    // キャッシュから取得、またはデータベースから取得
    const data = await getCachedData(
      cacheKey,
      async () => {
        // WHERE条件を構築
        const where: any = {
          isActive: true,
        }

        if (category) {
          where.category = category
        }

        if (search) {
          // 検索クエリを正規化（ひらがな・カタカナ・全角半角対応）
          const searchVariants = normalizeSearchQuery(search)
          
          // 複数のバリエーションで検索
          where.OR = searchVariants.flatMap(variant => [
            { name: { contains: variant, mode: 'insensitive' } },
            { description: { contains: variant, mode: 'insensitive' } },
          ])
        }

        // 商品とカウントを並行取得
        const [products, total] = await Promise.all([
          prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
          }),
          prisma.product.count({ where }),
        ])

        return {
          products,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        }
      },
      300 // 5分間キャッシュ
    )

    console.log(`✅ 商品一覧取得成功: ${data.products.length}件`)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('❌ 商品取得エラー:', error)
    console.error('エラー詳細:', {
      message: error.message,
      stack: error.stack,
    })
    return NextResponse.json(
      { error: '商品の取得に失敗しました', details: error.message },
      { status: 500 }
    )
  }
}

