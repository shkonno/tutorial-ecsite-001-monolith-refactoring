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

  if (status === 'loading') {
    return (
      <span className="pointer-events-none absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[11px] font-semibold text-white">
        0
      </span>
    )
  }

  const displayCount = status === 'authenticated' ? itemCount : 0

  return (
    <span className="pointer-events-none absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-[11px] font-semibold text-white">
      {displayCount > 99 ? '99+' : displayCount}
    </span>
  )
}
