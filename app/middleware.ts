import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { httpRequestCounter, httpRequestDuration, httpRequestsInProgress } from '@/lib/metrics-edge'

export default async function middleware(req: NextRequest) {
  const startTime = Date.now()
  const method = req.method
  const path = req.nextUrl.pathname

  // メトリクスAPIはスキップ
  if (path === '/api/metrics') {
    return NextResponse.next()
  }

  // 進行中リクエスト数を増加
  httpRequestsInProgress.inc({ method, route: path })

  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    
    // 認証が必要なパス
    const protectedPaths = ['/cart', '/checkout', '/orders', '/admin']
    
    // 認証が必要なパスかチェック
    const isProtectedPath = protectedPaths.some(p => path.startsWith(p))
    
    if (isProtectedPath && !token) {
      // 未認証の場合はログインページにリダイレクト
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', path)
      
      // メトリクスを記録
      recordMetrics(method, path, 302, startTime)
      
      return NextResponse.redirect(loginUrl)
    }

    // 管理者ページへのアクセス制御
    if (path.startsWith('/admin') && token?.role !== 'ADMIN') {
      // メトリクスを記録
      recordMetrics(method, path, 302, startTime)
      
      return NextResponse.redirect(new URL('/', req.url))
    }

    // メトリクスを記録
    recordMetrics(method, path, 200, startTime)

    return NextResponse.next()
  } finally {
    // 進行中リクエスト数を減少
    httpRequestsInProgress.dec({ method, route: path })
  }
}

// メトリクス記録用ヘルパー関数
function recordMetrics(method: string, route: string, statusCode: number, startTime: number) {
  const duration = (Date.now() - startTime) / 1000

  httpRequestCounter.inc({
    method,
    route,
    status_code: statusCode.toString(),
  })

  httpRequestDuration.observe(
    {
      method,
      route,
      status_code: statusCode.toString(),
    },
    duration
  )
}

// ミドルウェアを適用するパスを指定
// :path* は0個以上のパスセグメントにマッチするため、/admin も /admin/products もマッチする
export const config = {
  matcher: [
    '/cart/:path*',
    '/cart',
    '/checkout/:path*',
    '/checkout',
    '/orders/:path*',
    '/orders',
    '/admin/:path*',
    '/admin',
  ],
}
