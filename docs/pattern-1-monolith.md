# Pattern 1: モノリス + コンテナアーキテクチャ

> 📊 **アーキテクチャ図**: [Draw.io図を開く](./diagrams/pattern-1-monolith.drawio)

## 🎯 概要

シンプルな単一コンテナアプリケーション。スタートアップや小規模プロジェクトに最適。

## 📊 対象規模

- **ユーザー数**: ~10,000人
- **同時接続**: ~100-500
- **開発チーム**: 1-5人
- **予算**: 低予算

## 🏗️ アーキテクチャ図

```
┌─────────────────────────────────────────────────┐
│                  Internet                        │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
         ┌──────────────┐
         │ Route 53     │
         │ (DNS)        │
         └──────┬───────┘
                │
                ▼
         ┌──────────────┐
         │ CloudFront   │ (Optional - 静的コンテンツ配信)
         │ (CDN)        │
         └──────┬───────┘
                │
                ▼
         ┌──────────────┐
         │ ALB          │
         │ (Port 80/443)│
         └──────┬───────┘
                │
                ▼
      ┌─────────────────┐
      │   ECS Cluster   │
      │                 │
      │  ┌───────────┐  │
      │  │ Fargate   │  │
      │  │ Task      │  │
      │  │           │  │
      │  │ ┌───────┐ │  │
      │  │ │ Full  │ │  │
      │  │ │ Stack │ │  │      ┌──────────────┐
      │  │ │ App   │ │  │◄─────│ ElastiCache  │
      │  │ │       │ │  │      │ (Redis)      │
      │  │ │ Next.js│ │  │      └──────────────┘
      │  │ │ +API   │ │  │
      │  │ └───┬───┘ │  │
      │  └─────┼─────┘  │
      │        │        │
      └────────┼────────┘
               │
               ▼
        ┌──────────────┐
        │ RDS          │
        │ PostgreSQL   │
        │ (Single AZ)  │
        └──────────────┘
               │
               ▼
        ┌──────────────┐
        │ S3           │
        │ (画像・静的)   │
        └──────────────┘

    監視・ログ
    ┌──────────────┐
    │ CloudWatch   │
    │ Logs         │
    └──────────────┘
```

## 🛠️ 技術スタック

### アプリケーション
- **フレームワーク**: Next.js 14 (App Router)
  - フロントエンド: React Server Components
  - バックエンド: API Routes / Server Actions
- **言語**: TypeScript
- **ORM**: Prisma
- **認証**: NextAuth.js
- **UI**: Tailwind CSS, shadcn/ui

### インフラ
- **コンピューティング**: ECS Fargate (1 Task)
- **ロードバランサー**: Application Load Balancer
- **データベース**: RDS PostgreSQL (db.t3.micro)
- **キャッシュ**: ElastiCache Redis (cache.t3.micro)
- **ストレージ**: S3 (画像保存)
- **CDN**: CloudFront (オプション)
- **DNS**: Route 53
- **SSL/TLS**: ACM (AWS Certificate Manager)

### DevOps
- **IaC**: Terraform
- **CI/CD**: GitHub Actions
- **コンテナレジストリ**: Amazon ECR
- **監視**: CloudWatch, CloudWatch Logs
- **シークレット管理**: AWS Secrets Manager

## 📁 ディレクトリ構造

```
pattern-1-monolith/
├── README.md
├── app/                              # Next.js アプリケーション
│   ├── src/
│   │   ├── app/                      # App Router
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (shop)/
│   │   │   │   ├── products/
│   │   │   │   ├── cart/
│   │   │   │   └── orders/
│   │   │   ├── admin/
│   │   │   │   ├── products/
│   │   │   │   └── orders/
│   │   │   ├── api/                  # API Routes
│   │   │   │   ├── auth/
│   │   │   │   ├── products/
│   │   │   │   ├── cart/
│   │   │   │   └── orders/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/               # React コンポーネント
│   │   │   ├── ui/
│   │   │   ├── products/
│   │   │   ├── cart/
│   │   │   └── orders/
│   │   ├── lib/                      # ユーティリティ
│   │   │   ├── db.ts                # Prisma Client
│   │   │   ├── redis.ts             # Redis Client
│   │   │   ├── s3.ts                # S3 Client
│   │   │   └── auth.ts              # NextAuth config
│   │   ├── types/                    # TypeScript型定義
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       └── migrations/
│   ├── public/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
├── Dockerfile
├── docker-compose.yml                # ローカル開発環境
├── .env.example
├── .dockerignore
└── terraform/                        # インフラコード
    ├── main.tf
    ├── variables.tf
    ├── outputs.tf
    ├── vpc.tf
    ├── ecs.tf
    ├── alb.tf
    ├── rds.tf
    ├── elasticache.tf
    ├── s3.tf
    ├── cloudwatch.tf
    └── iam.tf
```

## 🗄️ データベース設計

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER DEFAULT 0,
    category VARCHAR(100),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart Items
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
```

## 🔧 主要機能実装

### 1. ユーザー認証
```typescript
// src/lib/auth.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./db"
import bcrypt from "bcryptjs"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      // JWT認証実装
    })
  ],
  session: { strategy: "jwt" }
}
```

### 2. 商品一覧API
```typescript
// src/app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { redis } from "@/lib/redis"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  
  // Redisキャッシュチェック
  const cacheKey = `products:${page}:${limit}`
  const cached = await redis.get(cacheKey)
  if (cached) {
    return NextResponse.json(JSON.parse(cached))
  }
  
  // DB取得
  const products = await prisma.product.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { created_at: "desc" }
  })
  
  // キャッシュ保存
  await redis.setex(cacheKey, 300, JSON.stringify(products))
  
  return NextResponse.json(products)
}
```

### 3. カート管理
```typescript
// Server Actions
"use server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"

export async function addToCart(productId: string, quantity: number) {
  const session = await getServerSession()
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  return await prisma.cartItem.upsert({
    where: {
      user_id_product_id: {
        user_id: session.user.id,
        product_id: productId
      }
    },
    update: { quantity: { increment: quantity } },
    create: {
      user_id: session.user.id,
      product_id: productId,
      quantity
    }
  })
}
```

### 4. 注文処理
```typescript
// トランザクション処理
export async function createOrder(cartItems: CartItem[]) {
  const session = await getServerSession()
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  return await prisma.$transaction(async (tx) => {
    // 在庫チェック
    for (const item of cartItems) {
      const product = await tx.product.findUnique({
        where: { id: item.product_id }
      })
      if (!product || product.stock < item.quantity) {
        throw new Error("在庫不足")
      }
    }
    
    // 注文作成
    const order = await tx.order.create({
      data: {
        user_id: session.user.id,
        total_amount: calculateTotal(cartItems),
        status: "pending"
      }
    })
    
    // 注文アイテム作成 & 在庫減算
    for (const item of cartItems) {
      await tx.orderItem.create({
        data: {
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.product.price
        }
      })
      
      await tx.product.update({
        where: { id: item.product_id },
        data: { stock: { decrement: item.quantity } }
      })
    }
    
    // カート削除
    await tx.cartItem.deleteMany({
      where: { user_id: session.user.id }
    })
    
    return order
  })
}
```

## 🐳 Docker設定

### Dockerfile
```dockerfile
FROM node:20-alpine AS base

# 依存関係インストール
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ビルド
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# 本番実行
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### docker-compose.yml (ローカル開発 - LocalStack使用)
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/ecommerce
      REDIS_URL: redis://redis:6379
      NEXTAUTH_URL: http://localhost:3000
      NEXTAUTH_SECRET: dev-secret
      # LocalStack設定
      AWS_ENDPOINT_URL: http://localstack:4566
      AWS_REGION: ap-northeast-1
      AWS_ACCESS_KEY_ID: test
      AWS_SECRET_ACCESS_KEY: test
      S3_BUCKET: ecommerce-images
    depends_on:
      - db
      - redis
      - localstack
    volumes:
      - ./app:/app
      - /app/node_modules
  
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ecommerce
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
  
  # LocalStack - AWS サービスエミュレーター
  localstack:
    container_name: localstack-pattern1
    image: localstack/localstack:latest
    ports:
      - "4566:4566"            # LocalStack Gateway
      - "4510-4559:4510-4559"  # 外部サービスポート範囲
    environment:
      - SERVICES=s3,secretsmanager,cloudwatch
      - DEBUG=1
      - DOCKER_HOST=unix:///var/run/docker.sock
      - DEFAULT_REGION=ap-northeast-1
    volumes:
      - "${TMPDIR:-/tmp}/localstack:/var/lib/localstack"
      - "/var/run/docker.sock:/var/run/docker.sock"
      - ./localstack-init:/etc/localstack/init/ready.d

volumes:
  postgres_data:
  redis_data:
```

## ☁️ Terraform設定例

### main.tf
```hcl
terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC
module "vpc" {
  source = "./modules/vpc"
  
  vpc_cidr = "10.0.0.0/16"
  availability_zones = ["ap-northeast-1a", "ap-northeast-1c"]
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# ECS Task Definition
resource "aws_ecs_task_definition" "app" {
  family                   = "${var.project_name}-app"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn
  
  container_definitions = jsonencode([
    {
      name  = "app"
      image = "${aws_ecr_repository.app.repository_url}:latest"
      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]
      environment = [
        { name = "NODE_ENV", value = "production" }
      ]
      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = aws_secretsmanager_secret.db_url.arn
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.app.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

# ECS Service
resource "aws_ecs_service" "app" {
  name            = "${var.project_name}-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  
  network_configuration {
    subnets          = module.vpc.private_subnet_ids
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "app"
    container_port   = 3000
  }
}
```

## 📊 監視・ログ

### CloudWatch Logs
- アプリケーションログ
- アクセスログ
- エラーログ

### CloudWatch Metrics
- CPU使用率
- メモリ使用率
- リクエスト数
- レスポンスタイム
- エラー率

### CloudWatch Alarms
- CPU使用率 > 80%
- メモリ使用率 > 80%
- エラー率 > 5%
- レスポンスタイム > 1秒

## 🚀 デプロイ手順

### 1. ローカル開発環境セットアップ（LocalStack使用）
```bash
cd pattern-1-monolith

# LocalStack初期化スクリプトを作成
mkdir -p localstack-init
cat > localstack-init/init-aws.sh << 'EOF'
#!/bin/bash
echo "LocalStackを初期化中..."

# S3バケット作成
awslocal s3 mb s3://ecommerce-images
echo "S3バケット作成完了"

# Secrets Manager シークレット作成
awslocal secretsmanager create-secret \
  --name db-credentials \
  --secret-string '{"username":"postgres","password":"password"}'
echo "Secrets Manager設定完了"

echo "LocalStack初期化完了！"
EOF
chmod +x localstack-init/init-aws.sh

# Docker Compose起動
docker-compose up -d

# LocalStackの起動を待つ
echo "LocalStackの起動を待機中..."
sleep 10

# アプリケーションのセットアップ
cd app
npm install
npx prisma migrate dev
npm run dev
```

### LocalStack接続設定

#### S3クライアント設定
```typescript
// src/lib/s3.ts
import { S3Client } from "@aws-sdk/client-s3"

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-1',
  endpoint: process.env.AWS_ENDPOINT_URL, // LocalStack: http://localstack:4566
  forcePathStyle: true, // LocalStackで必要
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
  },
})
```

### 2. AWSインフラ構築
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

### 3. CI/CD (GitHub Actions)
```yaml
# .github/workflows/deploy.yml
name: Deploy to ECS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build, tag, and push image to Amazon ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: ecommerce-monolith
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster ecommerce-cluster \
            --service ecommerce-service \
            --force-new-deployment
```

## ✅ メリット

1. **シンプル**: 学習コストが低い
2. **高速開発**: 単一コードベースで開発が早い
3. **低コスト**: リソースが最小限
4. **デバッグ容易**: 単一プロセスでデバッグしやすい
5. **トランザクション**: DB トランザクションが簡単

## ⚠️ デメリット

1. **スケーリング制限**: 垂直スケーリングのみ
2. **単一障害点**: 1つのコンテナダウンで全体停止
3. **技術スタック固定**: 全体で同じ技術を使用
4. **デプロイリスク**: 小さな変更でも全体再デプロイ
5. **チーム拡大困難**: コード競合が発生しやすい

## 💰 コスト見積もり（月額）

### ローカル開発環境（LocalStack使用）
- **コスト**: **$0/月** 🎉
- PostgreSQL、Redis、LocalStackすべてローカルで実行
- チュートリアル・学習に最適
- AWS料金は一切かかりません

### 本番環境（AWS - 参考）

#### 開発環境
- ECS Fargate (0.5 vCPU, 1GB): ~$15
- RDS db.t3.micro: ~$15
- ElastiCache cache.t3.micro: ~$12
- ALB: ~$20
- S3 + CloudFront: ~$5
- **合計**: 約 $67/月

#### 本番環境（小規模）
- ECS Fargate (1 vCPU, 2GB) × 2: ~$60
- RDS db.t3.small (Multi-AZ): ~$70
- ElastiCache cache.t3.small: ~$25
- ALB: ~$20
- S3 + CloudFront: ~$20
- **合計**: 約 $195/月

## 🎯 適用場面

- ✅ MVP開発
- ✅ スタートアップ
- ✅ 社内ツール
- ✅ 小規模ECサイト
- ❌ 大規模トラフィック
- ❌ 複数チーム開発
- ❌ 複雑なビジネスロジック

