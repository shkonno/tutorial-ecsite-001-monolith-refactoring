'use client'

import Link from 'next/link'
import {
  FiShoppingBag,
  FiUser,
  FiMenu,
  FiX,
  FiLogOut,
  FiSearch,
} from 'react-icons/fi'
import { useEffect, useRef, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import CartBadge from './CartBadge'

const NAV_ITEMS = [
  { label: 'Store', href: '/products' },
  { label: 'Mac', href: '/products?category=mac' },
  { label: 'iPad', href: '/products?category=tablet' },
  { label: 'iPhone', href: '/products?category=smartphone' },
  { label: 'Watch', href: '/products?category=wearable' },
  { label: 'AirPods', href: '/products?category=audio' },
  { label: 'Accessories', href: '/products?category=accessories' },
  { label: 'Support', href: '/about' },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const searchRef = useRef<HTMLDivElement | null>(null)
  const { status } = useSession()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!isSearchOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSearchOpen])

  const headerBackground = scrolled
    ? 'bg-[#101014]/95 shadow-[0_1px_0_rgba(255,255,255,0.08)]'
    : 'bg-[#1b1b1f]/80 backdrop-blur'

  return (
    <header
      id="top"
      className={`fixed inset-x-0 top-0 z-50 border-b border-white/5 transition-colors duration-200 ${headerBackground}`}
    >
      <nav className="relative mx-auto flex h-12 max-w-6xl items-center justify-between px-4 text-[13px] text-[#d2d2d7] md:px-6">
        <Link
          href="/"
          className="flex items-center text-[15px] font-semibold tracking-tight text-[#f5f5f7]"
        >
          EC Studio
        </Link>

        <div className="hidden items-center gap-5 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition-colors hover:text-[#f5f5f7]"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              aria-label="サイト内検索"
              onClick={() => setIsSearchOpen((prev) => !prev)}
              className="rounded-full p-1 text-[#d2d2d7] transition-colors hover:text-[#f5f5f7]"
            >
              <FiSearch className="h-5 w-5" />
            </button>

            {isSearchOpen && (
              <div className="absolute right-0 top-[calc(100%+12px)] w-64 md:w-60">
                <div
                  ref={searchRef}
                  className="rounded-2xl bg-[#1f1f1f]/95 px-5 py-4 text-[#f5f5f7] shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-md"
                >
                  <label className="sr-only" htmlFor="global-search">
                    サイト内検索
                  </label>
                  <input
                    id="global-search"
                    type="search"
                    autoFocus
                    placeholder="キーワードを入力"
                    className="w-full border-b border-white/10 bg-transparent pb-2 text-sm text-[#f5f5f7] placeholder:text-[#98989d] focus:border-[var(--accent)] focus:outline-none"
                  />
                  <p className="mt-3 text-[11px] uppercase tracking-[0.24em] text-[#6e6e73]">
                    Press ESC to close
                  </p>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/cart"
            aria-label="バッグ"
            className="relative rounded-full p-1 text-[#d2d2d7] transition-colors hover:text-[#f5f5f7]"
          >
            <FiShoppingBag className="h-6 w-6" />
            <CartBadge />
          </Link>

          {status === 'authenticated' ? (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="hidden h-7 items-center rounded-full bg-white/10 px-3 text-[11px] font-semibold tracking-wide text-[#f5f5f7] transition hover:bg-white/20 md:flex"
            >
              サインアウト
            </button>
          ) : (
            <Link
              href="/login"
              aria-label="ログイン"
              className="hidden rounded-full p-1 text-[#d2d2d7] transition-colors hover:text-[#f5f5f7] md:flex"
            >
              <FiUser className="h-5 w-5" />
            </Link>
          )}

          <button
            className="rounded-full p-1 text-[#d2d2d7] md:hidden"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="メニュー"
          >
            {isMenuOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#161617]/95 px-4 py-6 text-sm text-[#d2d2d7] backdrop-blur-md">
          <div className="flex flex-col space-y-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="hover:text-[#f5f5f7]"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-white/10 pt-4">
              {status === 'authenticated' ? (
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    signOut({ callbackUrl: '/' })
                  }}
                  className="flex items-center gap-2 text-left text-[#f5f5f7]"
                >
                  <FiLogOut className="h-5 w-5" />
                  <span className="text-sm">サインアウト</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 text-[#f5f5f7]"
                >
                  <FiUser className="h-5 w-5" />
                  <span className="text-sm">ログイン</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
