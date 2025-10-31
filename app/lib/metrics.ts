import { Counter, Gauge, Histogram, Registry } from 'prom-client'

// グローバルレジストリの作成
export const register = new Registry()

// デフォルトメトリクスの収集を有効化
// register.setDefaultLabels({
//   app: 'ecommerce-nextjs',
// })

// カスタムメトリクス

// HTTPリクエストカウンター
export const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
})

// HTTPリクエスト継続時間
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register],
})

// アクティブなHTTPリクエスト数
export const httpRequestsInProgress = new Gauge({
  name: 'http_requests_in_progress',
  help: 'Number of HTTP requests currently being processed',
  labelNames: ['method', 'route'],
  registers: [register],
})

// データベース接続数
export const dbConnections = new Gauge({
  name: 'db_connections_total',
  help: 'Total number of database connections',
  labelNames: ['state'], // idle, active
  registers: [register],
})

// データベースクエリ継続時間
export const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation'],
  buckets: [0.001, 0.01, 0.1, 0.5, 1],
  registers: [register],
})

// Redisキャッシュヒット/ミス
export const cacheHits = new Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_type'],
  registers: [register],
})

export const cacheMisses = new Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_type'],
  registers: [register],
})

// ビジネスメトリクス

// 注文数
export const ordersCreated = new Counter({
  name: 'orders_created_total',
  help: 'Total number of orders created',
  labelNames: ['status'],
  registers: [register],
})

// カート追加数
export const cartAdditions = new Counter({
  name: 'cart_additions_total',
  help: 'Total number of products added to cart',
  registers: [register],
})

// 商品閲覧数
export const productViews = new Counter({
  name: 'product_views_total',
  help: 'Total number of product views',
  registers: [register],
})

// ユーザー登録数
export const userRegistrations = new Counter({
  name: 'user_registrations_total',
  help: 'Total number of user registrations',
  registers: [register],
})

// ユーザーログイン数
export const userLogins = new Counter({
  name: 'user_logins_total',
  help: 'Total number of user logins',
  labelNames: ['success'],
  registers: [register],
})

// 収益
export const revenue = new Counter({
  name: 'revenue_total_jpy',
  help: 'Total revenue in JPY',
  registers: [register],
})

// アクティブユーザー数
export const activeUsers = new Gauge({
  name: 'active_users_total',
  help: 'Number of currently active users',
  registers: [register],
})

