# Pattern 1: Monolith Architecture - Production Dockerfile

FROM node:20-alpine AS base

# 依存関係インストールステージ
FROM base AS deps
WORKDIR /app

# Prisma用にOpenSSLをインストール
RUN apk add --no-cache libc6-compat openssl

COPY app/package*.json ./
RUN npm ci

# ビルドステージ
FROM base AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

# 依存関係をコピー
COPY --from=deps /app/node_modules ./node_modules
COPY app/ .

# Prisma Clientを生成（ビルド時はダミーのDATABASE_URLを使用）
ENV DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy"
RUN npx prisma generate

# Next.jsビルド
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 本番実行ステージ
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache openssl

# セキュリティ: 非rootユーザーで実行
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 必要なファイルのみコピー
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

