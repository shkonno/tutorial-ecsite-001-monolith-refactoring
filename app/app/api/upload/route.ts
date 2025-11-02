import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadToS3 } from '@/lib/s3'

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const session = await auth()

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: '管理者権限が必要です' },
        { status: 403 }
      )
    }

    // FormDataを取得
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'ファイルが選択されていません' },
        { status: 400 }
      )
    }

    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'ファイルサイズは5MB以下にしてください' },
        { status: 400 }
      )
    }

    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: '画像ファイルのみアップロードできます' },
        { status: 400 }
      )
    }

    // S3にアップロード
    const result = await uploadToS3(file, 'products')

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'アップロードに失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      message: 'アップロードが完了しました',
    })
  } catch (error: any) {
    console.error('画像アップロードエラー:', error)
    return NextResponse.json(
      { success: false, error: '画像のアップロードに失敗しました' },
      { status: 500 }
    )
  }
}
