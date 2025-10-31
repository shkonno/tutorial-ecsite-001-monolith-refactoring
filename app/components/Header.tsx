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
import { useEffect, useRef, useState, useId } from 'react'
import { useSession, signOut } from 'next-auth/react'
import CartBadge from './CartBadge'

const NAV_ITEMS = [
  { label: 'Store', href: '/products' },
  { label: 'Support', href: '/about' },
]

export default function Header() {
  const navId = useId()
  const searchPanelId = useId()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const searchRef = useRef<HTMLDivElement | null>(null)
  const { status } = useSession()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8)
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

  const headerStyle = scrolled
    ? 'shadow-[0_4px_12px_rgba(15,23,42,0.12)] bg-[var(--md-sys-color-surface)]'
    : 'border-b border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)]/95 backdrop-blur'

  return (
    <header
      id="top"
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-200 ${headerStyle}`}
    >
      <nav
        className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 text-sm text-[var(--md-sys-color-on-surface)] sm:px-6"
        aria-label="メインナビゲーション"
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-semibold tracking-tight text-[var(--md-sys-color-on-surface)]"
          aria-label="ホームへ移動"
        >
          EC Studio
        </Link>

        <div className="hidden items-center gap-1 md:flex" id={navId}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-full px-4 py-2 text-base font-semibold text-[var(--md-sys-color-on-surface-variant)] transition-colors hover:bg-[var(--md-sys-color-primary-container)] hover:text-[var(--md-sys-color-primary)] focus-visible:bg-[var(--md-sys-color-primary-container)] focus-visible:text-[var(--md-sys-color-primary)]"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              aria-label="サイト内検索"
              onClick={() => setIsSearchOpen((prev) => !prev)}
              aria-expanded={isSearchOpen}
              aria-controls={searchPanelId}
              className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--md-sys-color-on-surface-variant)] transition-colors hover:bg-[var(--md-sys-color-primary-container)] hover:text-[var(--md-sys-color-primary)] focus-visible:bg-[var(--md-sys-color-primary-container)] focus-visible:text-[var(--md-sys-color-primary)]"
            >
              <FiSearch className="h-5 w-5" aria-hidden="true" />
            </button>

            {isSearchOpen && (
              <div className="absolute right-0 top-[calc(100%+12px)] w-72 max-w-[18rem] md:w-64">
                <div
                  ref={searchRef}
                  id={searchPanelId}
                  className="rounded-2xl border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-5 py-4 text-[var(--md-sys-color-on-surface)] shadow-[0_10px_24px_rgba(15,23,42,0.16)]"
                >
                  <label className="sr-only" htmlFor="global-search">
                    サイト内検索
                  </label>
                  <input
                    id="global-search"
                    type="search"
                    autoFocus
                    placeholder="キーワードを入力"
                    className="w-full border border-[var(--md-sys-color-outline)] bg-transparent pb-2 text-sm placeholder:text-[var(--md-sys-color-secondary)] focus:border-[var(--md-sys-color-primary)] focus:outline-none"
                  />
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[var(--md-sys-color-secondary)]">
                    Press ESC to close
                  </p>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/cart"
            aria-label="カート"
            className="relative flex h-11 w-11 items-center justify-center rounded-full text-[var(--md-sys-color-on-surface-variant)] transition-colors hover:bg-[var(--md-sys-color-primary-container)] hover:text-[var(--md-sys-color-primary)] focus-visible:bg-[var(--md-sys-color-primary-container)] focus-visible:text-[var(--md-sys-color-primary)]"
          >
            <FiShoppingBag className="h-6 w-6" aria-hidden="true" />
            <CartBadge />
          </Link>

          {status === 'authenticated' ? (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="hidden h-11 items-center rounded-full bg-[var(--md-sys-color-primary)] px-4 text-sm font-semibold text-[var(--md-sys-color-on-primary)] transition hover:bg-[#1669c1] focus-visible:bg-[#1669c1] md:flex"
            >
              サインアウト
            </button>
          ) : (
            <Link
              href="/login"
              aria-label="ログイン"
              className="hidden h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-[var(--md-sys-color-primary)] transition hover:bg-[var(--md-sys-color-primary-container)] focus-visible:bg-[var(--md-sys-color-primary-container)] md:flex"
            >
              <FiUser className="h-5 w-5" aria-hidden="true" />
              <span>ログイン</span>
            </Link>
          )}

          <button
            className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--md-sys-color-on-surface-variant)] transition hover:bg-[var(--md-sys-color-primary-container)] hover:text-[var(--md-sys-color-primary)] focus-visible:bg-[var(--md-sys-color-primary-container)] focus-visible:text-[var(--md-sys-color-primary)] md:hidden"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="メニュー"
            aria-controls={`${navId}-mobile`}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <FiX className="h-5 w-5" aria-hidden="true" />
            ) : (
              <FiMenu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div
          className="border-t border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] px-4 py-6 text-sm text-[var(--md-sys-color-on-surface)] shadow-[0_8px_20px_rgba(15,23,42,0.12)] md:hidden"
          id={`${navId}-mobile`}
        >
          <div className="flex flex-col space-y-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-lg px-4 py-2 text-base font-semibold transition hover:bg-[var(--md-sys-color-primary-container)] hover:text-[var(--md-sys-color-primary)] focus-visible:bg-[var(--md-sys-color-primary-container)] focus-visible:text-[var(--md-sys-color-primary)]"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-[var(--md-sys-color-outline)] pt-4">
              {status === 'authenticated' ? (
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    signOut({ callbackUrl: '/' })
                  }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary-container)] focus-visible:bg-[var(--md-sys-color-primary-container)]"
                >
                  <FiLogOut className="h-5 w-5" aria-hidden="true" />
                  <span className="text-sm">サインアウト</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary-container)] focus-visible:bg-[var(--md-sys-color-primary-container)]"
                >
                  <FiUser className="h-5 w-5" aria-hidden="true" />
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
