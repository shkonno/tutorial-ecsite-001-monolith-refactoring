import Redis from 'ioredis'

// Redis接続クライアントの設定
const getRedisUrl = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
  return redisUrl
}

// Redisクライアントインスタンスの作成
export const redis = new Redis(getRedisUrl(), {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
  reconnectOnError(err) {
    const targetError = 'READONLY'
    if (err.message.includes(targetError)) {
      // クラスターで読み取り専用エラーが発生した場合、再接続
      return true
    }
    return false
  },
})

// Redis接続確認
redis.on('connect', () => {
  console.log('✅ Redis connected successfully')
})

redis.on('error', (error) => {
  console.error('❌ Redis connection error:', error)
})

// キャッシュのヘルパー関数

/**
 * キャッシュから値を取得、存在しない場合はfallback関数を実行してキャッシュに保存
 */
export async function getCachedData<T>(
  key: string,
  fallback: () => Promise<T>,
  ttl: number = 3600 // デフォルト1時間
): Promise<T> {
  try {
    // キャッシュから取得を試みる
    const cached = await redis.get(key)
    
    if (cached) {
      console.log(`✅ Cache hit: ${key}`)
      return JSON.parse(cached) as T
    }

    // キャッシュにない場合はfallbackを実行
    console.log(`⚠️ Cache miss: ${key}`)
    const data = await fallback()
    
    // キャッシュに保存（TTL付き）
    await redis.setex(key, ttl, JSON.stringify(data))
    
    return data
  } catch (error) {
    console.error(`❌ Redis error for key ${key}:`, error)
    // Redisエラー時はfallbackを実行
    return await fallback()
  }
}

/**
 * キャッシュを削除
 */
export async function invalidateCache(key: string | string[]): Promise<void> {
  try {
    const keys = Array.isArray(key) ? key : [key]
    await redis.del(...keys)
    console.log(`✅ Cache invalidated: ${keys.join(', ')}`)
  } catch (error) {
    console.error('❌ Redis invalidation error:', error)
  }
}

/**
 * パターンマッチでキャッシュキーを検索して削除
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
      console.log(`✅ Cache pattern invalidated: ${pattern} (${keys.length} keys)`)
    }
  } catch (error) {
    console.error('❌ Redis pattern invalidation error:', error)
  }
}

/**
 * セッション情報を保存
 */
export async function setSession(
  sessionId: string,
  data: Record<string, unknown>,
  ttl: number = 86400 // デフォルト24時間
): Promise<void> {
  try {
    await redis.setex(`session:${sessionId}`, ttl, JSON.stringify(data))
  } catch (error) {
    console.error('❌ Redis session save error:', error)
  }
}

/**
 * セッション情報を取得
 */
export async function getSession<T>(sessionId: string): Promise<T | null> {
  try {
    const data = await redis.get(`session:${sessionId}`)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('❌ Redis session get error:', error)
    return null
  }
}

/**
 * セッションを削除
 */
export async function deleteSession(sessionId: string): Promise<void> {
  try {
    await redis.del(`session:${sessionId}`)
  } catch (error) {
    console.error('❌ Redis session delete error:', error)
  }
}

