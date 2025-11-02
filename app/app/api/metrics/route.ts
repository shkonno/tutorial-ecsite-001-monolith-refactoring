import { NextResponse } from 'next/server'
import { register } from '@/lib/metrics'

export const runtime = 'nodejs' as const

export async function GET() {
  try {
    // Prometheusフォーマットでメトリクスを返す
    const metrics = await register.metrics()

    return new NextResponse(metrics, {
      headers: {
        'Content-Type': register.contentType,
      },
    })
  } catch (error) {
    console.error('メトリクス取得エラー:', error)
    return NextResponse.json(
      { error: 'メトリクスの取得に失敗しました' },
      { status: 500 }
    )
  }
}
