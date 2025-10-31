'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { FiAlertTriangle } from 'react-icons/fi'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // エラーをログに記録
    console.error('Error:', error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-center mb-4">
            <FiAlertTriangle className="w-16 h-16 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            エラーが発生しました
          </h1>
          
          <p className="text-gray-600 mb-6">
            申し訳ございません。予期しないエラーが発生しました。
          </p>

          {error.digest && (
            <p className="text-sm text-gray-500 mb-6">
              エラーID: {error.digest}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              もう一度試す
            </button>
            
            <Link
              href="/"
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ホームに戻る
            </Link>
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          問題が解決しない場合は、
          <Link href="/contact" className="text-indigo-600 hover:underline">
            お問い合わせ
          </Link>
          ください。
        </p>
      </div>
    </div>
  )
}

