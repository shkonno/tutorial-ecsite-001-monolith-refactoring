# Pattern 2: 3-Tier アーキテクチャ

> 📊 **アーキテクチャ図**: [Draw.io図を開く](./diagrams/pattern-2-three-tier.drawio)

## 🎯 概要

フロントエンド、バックエンドAPI、データベースを分離した構成。中規模アプリケーションに最適で、スケーラビリティと保守性のバランスが良い。

## 📊 対象規模

- **ユーザー数**: 10,000~100,000人
- **同時接続**: 500~5,000
- **開発チーム**: 5-15人
- **予算**: 中予算

## 🏗️ アーキテクチャ図

```
┌──────────────────────────────────────────────────────┐
│                    Internet                           │
└───────────────────┬──────────────────────────────────┘
                    │
                    ▼
            ┌──────────────┐
            │ Route 53     │
            │ (DNS)        │
            └──────┬───────┘
                   │
     ┌─────────────┴──────────────┐
     │                            │
     ▼                            ▼
┌──────────────┐         ┌──────────────┐
│ CloudFront   │         │ ALB          │
│ (Frontend)   │         │ (Backend API)│
└──────┬───────┘         └──────┬───────┘
       │                        │
       ▼                        ▼
┌──────────────┐       ┌────────────────────┐
│ S3           │       │  ECS Cluster       │
│ (Static)     │       │  (Backend)         │
│              │       │                    │
│ React Build  │       │ ┌────────────────┐ │
└──────────────┘       │ │ Fargate Task 1 │ │
                       │ │  ┌──────────┐  │ │
                       │ │  │ Node.js  │  │ │
                       │ │  │ API      │  │ │
                       │ │  └──────────┘  │ │
                       │ └────────────────┘ │
                       │                    │
                       │ ┌────────────────┐ │
                       │ │ Fargate Task 2 │ │
                       │ │  ┌──────────┐  │ │
                       │ │  │ Node.js  │  │ │
                       │ │  │ API      │  │ │
                       │ │  └──────────┘  │ │
                       │ └────────────────┘ │
                       └─────────┬──────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
       ┌──────────────┐   ┌──────────────┐  ┌──────────────┐
       │ RDS          │   │ ElastiCache  │  │ S3           │
       │ PostgreSQL   │   │ Redis        │  │ (画像)       │
       │ (Multi-AZ)   │   │              │  └──────────────┘
       │              │   └──────────────┘
       │ Primary      │
       │    ↕         │
       │ Standby      │
       └──────────────┘

監視・ログ
┌────────────────────────────────────┐
│ CloudWatch Logs + X-Ray            │
│ - Frontend Access Logs             │
│ - Backend API Logs                 │
│ - Distributed Tracing              │
└────────────────────────────────────┘
```

## 🛠️ 技術スタック

### フロントエンド
- **フレームワーク**: React 18 + TypeScript
- **ビルドツール**: Vite
- **状態管理**: TanStack Query (React Query)
- **ルーティング**: React Router v6
- **UIライブラリ**: Tailwind CSS, shadcn/ui
- **API クライアント**: Axios + OpenAPI Generator
- **認証**: JWT (localStorage)

### バックエンドAPI
- **フレームワーク**: NestJS (Node.js)
- **言語**: TypeScript
- **ORM**: Prisma
- **認証**: JWT (Passport.js)
- **バリデーション**: class-validator, class-transformer
- **ドキュメント**: Swagger/OpenAPI
- **テスト**: Jest, Supertest

### インフラ
- **フロントエンド配信**:
  - S3 (静的ホスティング)
  - CloudFront (CDN)
- **バックエンド**:
  - ECS Fargate (Auto Scaling)
  - Application Load Balancer
- **データベース**: RDS PostgreSQL Multi-AZ (db.t3.small)
- **キャッシュ**: ElastiCache Redis Cluster
- **ストレージ**: S3 (画像・ファイル)
- **DNS**: Route 53
- **SSL/TLS**: ACM

### DevOps
- **IaC**: Terraform
- **CI/CD**: GitHub Actions (分離されたパイプライン)
- **コンテナレジストリ**: Amazon ECR
- **監視**: CloudWatch, X-Ray
- **シークレット管理**: AWS Secrets Manager, Parameter Store

## 📁 ディレクトリ構造

```
pattern-2-three-tier/
├── README.md
├── frontend/                         # フロントエンド
│   ├── src/
│   │   ├── pages/                    # ページコンポーネント
│   │   │   ├── Home.tsx
│   │   │   ├── Products/
│   │   │   │   ├── ProductList.tsx
│   │   │   │   └── ProductDetail.tsx
│   │   │   ├── Cart/
│   │   │   │   └── Cart.tsx
│   │   │   ├── Orders/
│   │   │   │   ├── OrderList.tsx
│   │   │   │   └── OrderDetail.tsx
│   │   │   ├── Auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   └── Register.tsx
│   │   │   └── Admin/
│   │   │       ├── ProductManagement.tsx
│   │   │       └── OrderManagement.tsx
│   │   ├── components/               # 共通コンポーネント
│   │   │   ├── ui/
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── Layout.tsx
│   │   │   ├── products/
│   │   │   ├── cart/
│   │   │   └── orders/
│   │   ├── hooks/                    # カスタムフック
│   │   │   ├── useAuth.ts
│   │   │   ├── useProducts.ts
│   │   │   ├── useCart.ts
│   │   │   └── useOrders.ts
│   │   ├── api/                      # API クライアント
│   │   │   ├── client.ts
│   │   │   ├── auth.api.ts
│   │   │   ├── products.api.ts
│   │   │   ├── cart.api.ts
│   │   │   └── orders.api.ts
│   │   ├── store/                    # 状態管理
│   │   │   ├── auth.store.ts
│   │   │   └── cart.store.ts
│   │   ├── types/                    # 型定義
│   │   │   └── api.types.ts
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── Dockerfile
├── backend/                          # バックエンド API
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── auth/                     # 認証モジュール
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   └── guards/
│   │   ├── users/                    # ユーザーモジュール
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── dto/
│   │   ├── products/                 # 商品モジュール
│   │   │   ├── products.module.ts
│   │   │   ├── products.controller.ts
│   │   │   ├── products.service.ts
│   │   │   └── dto/
│   │   ├── cart/                     # カートモジュール
│   │   │   ├── cart.module.ts
│   │   │   ├── cart.controller.ts
│   │   │   ├── cart.service.ts
│   │   │   └── dto/
│   │   ├── orders/                   # 注文モジュール
│   │   │   ├── orders.module.ts
│   │   │   ├── orders.controller.ts
│   │   │   ├── orders.service.ts
│   │   │   └── dto/
│   │   ├── common/                   # 共通
│   │   │   ├── filters/
│   │   │   ├── interceptors/
│   │   │   ├── pipes/
│   │   │   └── decorators/
│   │   ├── database/                 # データベース
│   │   │   ├── database.module.ts
│   │   │   └── prisma.service.ts
│   │   ├── cache/                    # キャッシュ
│   │   │   ├── cache.module.ts
│   │   │   └── redis.service.ts
│   │   └── storage/                  # ストレージ
│   │       ├── storage.module.ts
│   │       └── s3.service.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── test/
│   ├── package.json
│   ├── nest-cli.json
│   ├── tsconfig.json
│   └── Dockerfile
├── docker-compose.yml                # ローカル開発環境
└── terraform/                        # インフラコード
    ├── main.tf
    ├── variables.tf
    ├── outputs.tf
    ├── modules/
    │   ├── frontend/
    │   │   ├── s3.tf
    │   │   ├── cloudfront.tf
    │   │   └── outputs.tf
    │   └── backend/
    │       ├── ecs.tf
    │       ├── alb.tf
    │       └── outputs.tf
    ├── vpc.tf
    ├── rds.tf
    ├── elasticache.tf
    ├── ecr.tf
    └── cloudwatch.tf
```

## 🗄️ データベース設計

Pattern 1と同じスキーマを使用しますが、以下を追加：

```sql
-- セッション管理（オプション）
CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 商品レビュー（拡張機能）
CREATE TABLE product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_product_reviews_product_id ON product_reviews(product_id);
```

## 🔧 主要機能実装

### フロントエンド

#### 1. API クライアント設定
```typescript
// src/api/client.ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// リクエストインターセプター（JWT追加）
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// レスポンスインターセプター（エラーハンドリング）
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

#### 2. カスタムフック（React Query）
```typescript
// src/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '@/api/products.api'

export function useProducts(params?: ProductsQueryParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productsApi.getProduct(id),
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: productsApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
```

#### 3. 商品一覧ページ
```typescript
// src/pages/Products/ProductList.tsx
import { useState } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { ProductCard } from '@/components/products/ProductCard'
import { Pagination } from '@/components/ui/Pagination'

export function ProductList() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  
  const { data, isLoading, error } = useProducts({ page, search })
  
  if (isLoading) return <div>読み込み中...</div>
  if (error) return <div>エラーが発生しました</div>
  
  return (
    <div className="container mx-auto px-4">
      <div className="mb-6">
        <input
          type="search"
          placeholder="商品を検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data?.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      <Pagination
        currentPage={page}
        totalPages={data?.totalPages || 1}
        onPageChange={setPage}
      />
    </div>
  )
}
```

### バックエンド

#### 1. メインエントリーポイント
```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  
  // CORS設定
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
  
  // グローバルバリデーション
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }))
  
  // Swagger設定
  const config = new DocumentBuilder()
    .setTitle('EC Site API')
    .setDescription('EC Site API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)
  
  await app.listen(3001)
}
bootstrap()
```

#### 2. 商品コントローラー
```typescript
// src/products/products.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { ProductsService } from './products.service'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { RolesGuard } from '@/auth/guards/roles.guard'
import { Roles } from '@/common/decorators/roles.decorator'
import { CacheInterceptor } from '@nestjs/cache-manager'
import { CreateProductDto, UpdateProductDto, ProductsQueryDto } from './dto'

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  
  @Get()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '商品一覧取得' })
  async findAll(@Query() query: ProductsQueryDto) {
    return this.productsService.findAll(query)
  }
  
  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: '商品詳細取得' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id)
  }
  
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '商品作成' })
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto)
  }
  
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '商品更新' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto)
  }
  
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '商品削除' })
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id)
  }
}
```

#### 3. 商品サービス
```typescript
// src/products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/database/prisma.service'
import { RedisService } from '@/cache/redis.service'
import { CreateProductDto, UpdateProductDto, ProductsQueryDto } from './dto'

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}
  
  async findAll(query: ProductsQueryDto) {
    const { page = 1, limit = 20, search, category } = query
    const skip = (page - 1) * limit
    
    // キャッシュキー生成
    const cacheKey = `products:${page}:${limit}:${search || ''}:${category || ''}`
    
    // キャッシュチェック
    const cached = await this.redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }
    
    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(category && { category }),
    }
    
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ])
    
    const result = {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
    
    // キャッシュ保存（5分）
    await this.redis.setex(cacheKey, 300, JSON.stringify(result))
    
    return result
  }
  
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    })
    
    if (!product) {
      throw new NotFoundException('商品が見つかりません')
    }
    
    return product
  }
  
  async create(createProductDto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: createProductDto,
    })
    
    // キャッシュ削除
    await this.redis.deletePattern('products:*')
    
    return product
  }
  
  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id) // 存在チェック
    
    const product = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    })
    
    // キャッシュ削除
    await this.redis.deletePattern('products:*')
    
    return product
  }
  
  async remove(id: string) {
    await this.findOne(id) // 存在チェック
    
    await this.prisma.product.delete({
      where: { id },
    })
    
    // キャッシュ削除
    await this.redis.deletePattern('products:*')
    
    return { message: '商品を削除しました' }
  }
}
```

#### 4. 注文処理（トランザクション）
```typescript
// src/orders/orders.service.ts
async createOrder(userId: string, createOrderDto: CreateOrderDto) {
  return this.prisma.$transaction(async (tx) => {
    // カート取得
    const cartItems = await tx.cartItem.findMany({
      where: { user_id: userId },
      include: { product: true },
    })
    
    if (cartItems.length === 0) {
      throw new BadRequestException('カートが空です')
    }
    
    // 在庫チェック
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        throw new BadRequestException(
          `${item.product.name}の在庫が不足しています`
        )
      }
    }
    
    // 合計金額計算
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )
    
    // 注文作成
    const order = await tx.order.create({
      data: {
        user_id: userId,
        total_amount: totalAmount,
        status: 'pending',
      },
    })
    
    // 注文アイテム作成 & 在庫減算
    for (const item of cartItems) {
      await tx.orderItem.create({
        data: {
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.product.price,
        },
      })
      
      await tx.product.update({
        where: { id: item.product_id },
        data: {
          stock: { decrement: item.quantity },
        },
      })
    }
    
    // カートクリア
    await tx.cartItem.deleteMany({
      where: { user_id: userId },
    })
    
    return order
  })
}
```

## 🐳 Docker設定

### LocalStack初期化スクリプト
```bash
# localstack-init/init-aws.sh
#!/bin/bash
echo "LocalStackを初期化中..."

# S3バケット作成（画像保存用）
awslocal s3 mb s3://ecommerce-images
awslocal s3 mb s3://ecommerce-frontend

echo "S3バケット作成完了"

# Secrets Manager設定
awslocal secretsmanager create-secret \
  --name backend/db-credentials \
  --secret-string '{"username":"postgres","password":"password"}'

echo "Secrets Manager設定完了"

echo "LocalStack初期化完了！"
```

### ストレージサービス設定（LocalStack対応）
```typescript
// backend/src/storage/s3.service.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'

@Injectable()
export class S3Service {
  private s3Client: S3Client
  private bucketName: string

  constructor() {
    this.bucketName = process.env.S3_BUCKET || 'ecommerce-images'
    
    // LocalStack対応の設定
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'ap-northeast-1',
      endpoint: process.env.AWS_ENDPOINT_URL, // LocalStack: http://localstack:4566
      forcePathStyle: true, // LocalStackで必須
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
      },
    })
  }

  async uploadFile(key: string, body: Buffer, contentType: string): Promise<string> {
    await this.s3Client.send(new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    }))

    // LocalStackの場合のURL生成
    if (process.env.AWS_ENDPOINT_URL) {
      return `${process.env.AWS_ENDPOINT_URL}/${this.bucketName}/${key}`
    }
    
    return `https://${this.bucketName}.s3.amazonaws.com/${key}`
  }

  async getFile(key: string): Promise<Buffer> {
    const response = await this.s3Client.send(new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    }))

    return Buffer.from(await response.Body.transformToByteArray())
  }
}
```

### Backend Dockerfile
```dockerfile
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

USER nestjs

EXPOSE 3001

CMD ["node", "dist/main"]
```

### Frontend Dockerfile
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml (LocalStack使用)
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:3001/api
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend
  
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/ecommerce
      REDIS_URL: redis://redis:6379
      JWT_SECRET: dev-secret
      FRONTEND_URL: http://localhost:5173
      # LocalStack設定
      AWS_ENDPOINT_URL: http://localstack:4566
      AWS_REGION: ap-northeast-1
      AWS_ACCESS_KEY_ID: test
      AWS_SECRET_ACCESS_KEY: test
      S3_BUCKET: ecommerce-images
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - db
      - redis
      - localstack
  
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
    container_name: localstack-pattern2
    image: localstack/localstack:latest
    ports:
      - "4566:4566"            # LocalStack Gateway
      - "4510-4559:4510-4559"  # 外部サービスポート範囲
    environment:
      - SERVICES=s3,secretsmanager,cloudwatch,xray
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

### フロントエンド（S3 + CloudFront）
```hcl
# S3 Bucket
resource "aws_s3_bucket" "frontend" {
  bucket = "${var.project_name}-frontend"
}

resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  
  index_document {
    suffix = "index.html"
  }
  
  error_document {
    key = "index.html"
  }
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "frontend" {
  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.frontend.id}"
    
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.frontend.cloudfront_access_identity_path
    }
  }
  
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.frontend.id}"
    
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
```

### バックエンド（ECS + Auto Scaling）
```hcl
# Auto Scaling
resource "aws_appautoscaling_target" "ecs_target" {
  max_capacity       = 10
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.backend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "ecs_cpu" {
  name               = "${var.project_name}-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target.service_namespace
  
  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}

resource "aws_appautoscaling_policy" "ecs_memory" {
  name               = "${var.project_name}-memory-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target.service_namespace
  
  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    target_value = 80.0
  }
}
```

## 🚀 CI/CD パイプライン

### フロントエンド デプロイ
```yaml
# .github/workflows/deploy-frontend.yml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
      
      - name: Build
        working-directory: ./frontend
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
        run: npm run build
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-1
      
      - name: Deploy to S3
        run: |
          aws s3 sync ./frontend/dist s3://${{ secrets.S3_BUCKET }} --delete
      
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_ID }} \
            --paths "/*"
```

### バックエンド デプロイ
```yaml
# .github/workflows/deploy-backend.yml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

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
      
      - name: Build, tag, and push image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: ecommerce-backend
          IMAGE_TAG: ${{ github.sha }}
        working-directory: ./backend
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
      
      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster ecommerce-cluster \
            --service ecommerce-backend-service \
            --force-new-deployment
```

## ✅ メリット

1. **独立したスケーリング**: フロントエンドとバックエンドを個別にスケール可能
2. **技術的柔軟性**: 各層で異なる技術スタックを選択可能
3. **チーム分割**: フロントエンド/バックエンドチームで並行開発
4. **キャッシュ最適化**: CloudFrontとRedisで多層キャッシング
5. **高可用性**: Multi-AZ RDS、Auto Scaling
6. **デプロイ独立性**: フロントエンド/バックエンドを個別デプロイ

## ⚠️ デメリット

1. **複雑性増加**: 2つのアプリケーション管理が必要
2. **CORS対応**: クロスオリジン設定が必要
3. **ネットワークレイテンシ**: API呼び出しのオーバーヘッド
4. **開発環境構築**: docker-composeで複数サービス管理
5. **コスト増加**: Pattern 1より高コスト

## 💰 コスト見積もり（月額）

### ローカル開発環境（LocalStack使用）
- **コスト**: **$0/月** 🎉
- PostgreSQL、Redis、LocalStack（S3, CloudWatch, X-Ray）すべてローカルで実行
- チュートリアル・学習に最適
- AWS料金は一切かかりません

### 本番環境（AWS - 参考）

#### 開発環境
- ECS Fargate (Backend 0.5 vCPU, 1GB) × 1: ~$15
- S3 + CloudFront (Frontend): ~$5
- RDS db.t3.micro: ~$15
- ElastiCache cache.t3.micro: ~$12
- ALB: ~$20
- **合計**: 約 $67/月

#### 本番環境（中規模）
- ECS Fargate (Backend 1 vCPU, 2GB) × 2-4 (Auto Scaling): ~$120
- S3 + CloudFront (Frontend): ~$50
- RDS db.t3.small (Multi-AZ): ~$70
- ElastiCache cache.t3.small: ~$25
- ALB: ~$20
- X-Ray: ~$10
- **合計**: 約 $295/月

## 🎯 適用場面

- ✅ 中規模Webアプリケーション
- ✅ SaaSプロダクト
- ✅ モバイルアプリ + Webのバックエンド
- ✅ フロントエンド/バックエンドチーム分割
- ✅ 段階的スケーリングが必要
- ❌ 超大規模システム（マイクロサービス推奨）
- ❌ 極小規模（モノリス推奨）

