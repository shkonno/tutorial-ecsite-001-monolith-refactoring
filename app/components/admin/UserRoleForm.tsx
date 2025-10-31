'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateUserRole } from '@/lib/actions/admin'

interface UserRoleFormProps {
  userId: string
  userName: string | null
  currentRole: string
}

export default function UserRoleForm({
  userId,
  userName,
  currentRole,
}: UserRoleFormProps) {
  const router = useRouter()
  const [role, setRole] = useState(currentRole)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (role === currentRole) {
      setError('ロールが変更されていません')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await updateUserRole(userId, role)

      if (!result.success) {
        setError(result.error || 'ロールの変更に失敗しました')
        setLoading(false)
        return
      }

      setSuccess(result.message || 'ロールを変更しました')
      router.refresh()
    } catch (error) {
      console.error('ユーザーロール更新エラー:', error)
      setError('予期しないエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] p-6 shadow-[0_10px_20px_rgba(15,23,42,0.12)]">
      <h3 className="text-lg font-semibold text-[var(--md-sys-color-on-surface)]">
        ユーザーロール変更
      </h3>

      {error && (
        <div
          className="rounded-xl border border-[var(--md-sys-color-error)] bg-[var(--md-sys-color-error)]/10 px-3 py-2 text-sm text-[var(--md-sys-color-error)]"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="rounded-xl border border-[var(--md-sys-color-success)] bg-[var(--md-sys-color-success)]/10 px-3 py-2 text-sm text-[var(--md-sys-color-success)]"
          role="status"
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--md-sys-color-secondary)]">
            ユーザー
          </label>
          <p className="text-sm text-[var(--md-sys-color-on-surface)]">
            {userName || 'ユーザー名なし'}
          </p>
        </div>

        <div>
          <label htmlFor="role">ロール</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
            className="w-full disabled:cursor-not-allowed disabled:bg-[var(--md-sys-color-surface-variant)] disabled:text-[var(--md-sys-color-secondary)]"
          >
            <option value="USER">一般ユーザー</option>
            <option value="ADMIN">管理者</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || role === currentRole}
          className="w-full rounded-full bg-[var(--md-sys-color-primary)] px-6 py-3 text-sm font-semibold text-[var(--md-sys-color-on-primary)] transition hover:bg-[#1669c1] focus-visible:bg-[#1669c1] disabled:cursor-not-allowed disabled:bg-[var(--md-sys-color-surface-variant)] disabled:text-[var(--md-sys-color-secondary)]"
        >
          {loading ? '変更中…' : 'ロールを変更'}
        </button>
      </form>
    </div>
  )
}
