import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default async function middleware(req: NextRequest) {
  const session = await auth()
  const path = req.nextUrl.pathname

  // 認証が必要なパス
  const protectedPaths = ['/cart', '/checkout', '/orders', '/admin']
  
  // 認証が必要なパスかチェック
  const isProtectedPath = protectedPaths.some(p => path.startsWith(p))
  
  if (isProtectedPath && !session) {
    // 未認証の場合はログインページにリダイレクト
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(loginUrl)
  }

  // 管理者ページへのアクセス制御
  if (path.startsWith('/admin') && session?.user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: [
    '/cart/:path*',
    '/checkout/:path*',
    '/orders/:path*',
    '/admin/:path*',
  ],
}

