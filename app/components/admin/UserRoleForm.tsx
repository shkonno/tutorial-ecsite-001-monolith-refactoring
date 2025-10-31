'use client'

import { updateUserRole } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function UserRoleForm({
  userId,
  currentRole,
}: {
  userId: string
  currentRole: string
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleRoleChange = async (newRole: string) => {
    if (isLoading || newRole === currentRole) return

    if (!confirm(`本当にこのユーザーの権限を${newRole === 'ADMIN' ? '管理者' : 'ユーザー'}に変更しますか?`)) {
      return
    }

    setIsLoading(true)
    const result = await updateUserRole(userId, newRole)
    setIsLoading(false)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || '権限の変更に失敗しました')
    }
  }

  return (
    <select
      value={currentRole}
      onChange={(e) => handleRoleChange(e.target.value)}
      disabled={isLoading}
      className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
    >
      <option value="USER">ユーザー</option>
      <option value="ADMIN">管理者</option>
    </select>
  )
}
