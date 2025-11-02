import { NextRequest, NextResponse } from 'next/server';
import { Redis } from 'ioredis';

// Redisクライアント（既存のredis.tsを使用）
import { redis } from './redis';

export interface RateLimitConfig {
  windowMs: number; // 時間窓（ミリ秒）
  maxRequests: number; // 最大リクエスト数
  keyPrefix?: string; // キープレフィックス
  skipSuccessfulRequests?: boolean; // 成功したリクエストをスキップ
  skipFailedRequests?: boolean; // 失敗したリクエストをスキップ
}

// デフォルト設定
const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1分
  maxRequests: 60, // 60リクエスト/分
  keyPrefix: 'rate_limit:',
};

/**
 * IPアドレスベースのレート制限
 */
export async function rateLimitByIP(
  request: NextRequest,
  config: Partial<RateLimitConfig> = {}
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const ip = request.ip || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const key = `${mergedConfig.keyPrefix}ip:${ip}`;

  return await checkRateLimit(key, mergedConfig);
}

/**
 * ユーザーIDベースのレート制限
 */
export async function rateLimitByUser(
  userId: string,
  config: Partial<RateLimitConfig> = {}
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const key = `${mergedConfig.keyPrefix}user:${userId}`;

  return await checkRateLimit(key, mergedConfig);
}

/**
 * APIエンドポイントベースのレート制限
 */
export async function rateLimitByEndpoint(
  request: NextRequest,
  config: Partial<RateLimitConfig> = {}
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const pathname = request.nextUrl.pathname;
  const key = `${mergedConfig.keyPrefix}endpoint:${ip}:${pathname}`;

  return await checkRateLimit(key, mergedConfig);
}

/**
 * レート制限チェックのコア実装（Token Bucket アルゴリズム）
 */
async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  try {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Redisトランザクション
    const pipeline = redis.pipeline();
    
    // 古いエントリを削除
    pipeline.zremrangebyscore(key, 0, windowStart);
    
    // 現在のリクエスト数を取得
    pipeline.zcard(key);
    
    // 新しいリクエストを追加
    pipeline.zadd(key, now, `${now}`);
    
    // TTLを設定（時間窓の2倍）
    pipeline.expire(key, Math.ceil(config.windowMs / 1000) * 2);

    const results = await pipeline.exec();
    
    if (!results) {
      throw new Error('Redis pipeline failed');
    }

    // リクエスト数を取得（zadd前の値）
    const requestCount = (results[1][1] as number) || 0;
    const remaining = Math.max(0, config.maxRequests - requestCount - 1);
    const reset = now + config.windowMs;

    if (requestCount >= config.maxRequests) {
      return {
        success: false,
        limit: config.maxRequests,
        remaining: 0,
        reset,
      };
    }

    return {
      success: true,
      limit: config.maxRequests,
      remaining,
      reset,
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // エラー時はレート制限をスキップ（fail-open）
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: Date.now() + config.windowMs,
    };
  }
}

/**
 * レート制限ミドルウェア（API Route用）
 */
export function createRateLimitMiddleware(config: Partial<RateLimitConfig> = {}) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const result = await rateLimitByIP(request, config);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Too Many Requests',
          message: 'レート制限を超えました。しばらく待ってから再度お試しください。',
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.reset.toString(),
            'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // レート制限ヘッダーを追加
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', result.limit.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.reset.toString());

    return null; // レート制限OKの場合はnullを返す
  };
}

/**
 * エンドポイント別のレート制限設定
 */
export const RATE_LIMIT_CONFIGS = {
  // 認証関連（厳しめ）
  auth: {
    windowMs: 15 * 60 * 1000, // 15分
    maxRequests: 5, // 5リクエスト/15分
  },
  // API一般
  api: {
    windowMs: 60 * 1000, // 1分
    maxRequests: 60, // 60リクエスト/分
  },
  // 検索（緩め）
  search: {
    windowMs: 60 * 1000, // 1分
    maxRequests: 100, // 100リクエスト/分
  },
  // 画像アップロード（厳しめ）
  upload: {
    windowMs: 60 * 1000, // 1分
    maxRequests: 10, // 10リクエスト/分
  },
  // 管理者機能
  admin: {
    windowMs: 60 * 1000, // 1分
    maxRequests: 120, // 120リクエスト/分
  },
};

