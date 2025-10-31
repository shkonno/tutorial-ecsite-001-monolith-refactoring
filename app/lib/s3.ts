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
 * ファイルをS3にアップロード
 */
export async function uploadToS3(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
    })

    await s3Client.send(command)
    
    // URLを生成して返す
    const url = process.env.AWS_ENDPOINT_URL
      ? `${process.env.AWS_ENDPOINT_URL}/${S3_BUCKET}/${key}`
      : `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

    console.log(`✅ File uploaded to S3: ${key}`)
    return url
  } catch (error) {
    console.error('❌ S3 upload error:', error)
    throw new Error('ファイルのアップロードに失敗しました')
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
 * S3からファイルを削除
 */
export async function deleteFromS3(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    })

    await s3Client.send(command)
    console.log(`✅ File deleted from S3: ${key}`)
  } catch (error) {
    console.error('❌ S3 delete error:', error)
    throw new Error('ファイルの削除に失敗しました')
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

