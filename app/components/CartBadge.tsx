'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

export default function CartBadge() {
  const { status } = useSession()
  const pathname = usePathname()
  const [itemCount, setItemCount] = useState(0)

  useEffect(() => {
    if (status === 'authenticated') {
      let cancelled = false

      const load = async () => {
        try {
          const response = await fetch('/api/cart')
          if (!response.ok) {
            return
          }
          const data = await response.json()
          if (!cancelled) {
            setItemCount(data.itemCount || 0)
          }
        } catch (error) {
          console.error('カート数取得エラー:', error)
        }
      }

      void load()

      return () => {
        cancelled = true
      }
    }
  }, [status, pathname]) // pathnameが変わったら再取得

  const displayCount =
    status === 'authenticated' && itemCount > 0 ? itemCount : null

  return (
    <span
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none absolute -top-2 -right-2 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[var(--md-sys-color-primary)] px-1 text-[11px] font-semibold text-[var(--md-sys-color-on-primary)] shadow-[0_2px_6px_rgba(25,118,210,0.32)]"
    >
      {displayCount ? (displayCount > 99 ? '99+' : displayCount) : '0'}
    </span>
  )
}
