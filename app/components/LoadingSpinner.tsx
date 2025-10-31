import clsx from 'clsx'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export default function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  }

  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-indigo-600 border-t-transparent',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="読み込み中"
    />
  )
}

// フルページローディング
export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="xl" className="mx-auto" />
        <p className="mt-4 text-gray-600">読み込み中...</p>
      </div>
    </div>
  )
}

// ボタン内ローディング
export function LoadingButton() {
  return (
    <div className="flex items-center justify-center space-x-2">
      <LoadingSpinner size="sm" />
      <span>処理中...</span>
    </div>
  )
}

