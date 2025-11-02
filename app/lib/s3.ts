import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// S3クライアントの設定
const getS3Client = () => {
  const config: {
    region: string
    credentials: {
      accessKeyId: string
      secretAccessKey: string
    }
    endpoint?: string
    forcePathStyle?: boolean
  } = {
    region: process.env.AWS_REGION || 'ap-northeast-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
    },
  }

  // LocalStackを使用する場合
  if (process.env.AWS_ENDPOINT_URL) {
    config.endpoint = process.env.AWS_ENDPOINT_URL
    config.forcePathStyle = true // LocalStackではpath-styleが必要
  }

  return new S3Client(config)
}

export const s3Client = getS3Client()
export const S3_BUCKET = process.env.S3_BUCKET || 'ecommerce-images'

/**
 * ファイルをS3にアップロード（File オブジェクトから）
 */
export async function uploadToS3(
  file: File,
  prefix: string = 'products'
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // ファイルをBufferに変換
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // ファイル名を生成
    const key = generateImageKey(file.name, prefix)
    
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })

    await s3Client.send(command)
    
    // URLを生成して返す
    const url = process.env.AWS_ENDPOINT_URL
      ? `${process.env.AWS_ENDPOINT_URL}/${S3_BUCKET}/${key}`
      : `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

    console.log(`✅ File uploaded to S3: ${key}`)
    return { success: true, url }
  } catch (error) {
    console.error('❌ S3 upload error:', error)
    return { success: false, error: 'ファイルのアップロードに失敗しました' }
  }
}

/**
 * S3からファイルを取得（署名付きURL）
 */
export async function getSignedS3Url(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    })

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn })
    return signedUrl
  } catch (error) {
    console.error('❌ S3 signed URL error:', error)
    throw new Error('署名付きURLの生成に失敗しました')
  }
}

/**
 * S3からファイルを削除（URLから）
 */
export async function deleteFromS3(url: string): Promise<void> {
  try {
    // URLからキーを抽出
    const key = url.split(`/${S3_BUCKET}/`)[1]
    
    if (!key) {
      console.warn('⚠️ Invalid S3 URL, skipping deletion:', url)
      return
    }
    
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    })

    await s3Client.send(command)
    console.log(`✅ File deleted from S3: ${key}`)
  } catch (error) {
    console.error('❌ S3 delete error:', error)
    // 削除失敗は致命的ではないのでエラーをスローしない
  }
}

/**
 * 画像ファイル名を生成（UUID + 拡張子）
 */
export function generateImageKey(
  filename: string,
  prefix: string = 'products'
): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = filename.split('.').pop()
  return `${prefix}/${timestamp}-${randomString}.${extension}`
}

