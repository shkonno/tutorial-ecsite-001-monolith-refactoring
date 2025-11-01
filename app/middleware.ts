import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { httpRequestCounter, httpRequestDuration, httpRequestsInProgress } from '@/lib/metrics-edge'

export async function middleware(request: NextRequest) {
  const startTime = Date.now()
  const method = request.method
  const { pathname, search } = request.nextUrl

  // メトリクスAPIはスキップ
  if (pathname === '/api/metrics') {
    return NextResponse.next()
  }

  // 進行中リクエスト数を増加
  httpRequestsInProgress.inc({ method, route: pathname })

  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    // 管理者ページへのアクセス制御（最優先）
    if (pathname.startsWith('/admin')) {
      // 未認証の場合はログインページにリダイレクト
      if (!token) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('callbackUrl', `${pathname}${search}`)

        const redirectResponse = NextResponse.redirect(loginUrl, { status: 302 })

        // メトリクスを記録
        recordMetrics(method, pathname, redirectResponse.status, startTime)

        return redirectResponse
      }

      // 一般ユーザーの場合はホームにリダイレクト
      if (token.role !== 'ADMIN') {
        const homeUrl = new URL('/', request.url)
        const redirectResponse = NextResponse.redirect(homeUrl, { status: 302 })

        // メトリクスを記録
        recordMetrics(method, pathname, redirectResponse.status, startTime)

        return redirectResponse
      }
    }
    
    // その他の認証が必要なパス
    const protectedPaths = ['/cart', '/checkout', '/orders']
    
    // 認証が必要なパスかチェック
    const isProtectedPath = protectedPaths.some(p => pathname.startsWith(p))
    
    if (isProtectedPath && !token) {
      // 未認証の場合はログインページにリダイレクト
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', `${pathname}${search}`)

      const redirectResponse = NextResponse.redirect(loginUrl, { status: 302 })

      // メトリクスを記録
      recordMetrics(method, pathname, redirectResponse.status, startTime)

      return redirectResponse
    }

    const response = NextResponse.next()

    // メトリクスを記録
    recordMetrics(method, pathname, response.status, startTime)

    return response
  } finally {
    // 進行中リクエスト数を減少
    httpRequestsInProgress.dec({ method, route: pathname })
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
