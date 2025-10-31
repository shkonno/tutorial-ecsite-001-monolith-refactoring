# Pattern 3: マイクロサービスアーキテクチャ (EKS)

> 📊 **アーキテクチャ図**: [Draw.io図を開く](./diagrams/pattern-3-microservices.drawio)

## 🎯 概要

ドメイン駆動設計に基づき、機能をマイクロサービスに分割。Amazon EKSとService Meshを使用した高度なアーキテクチャ。エンタープライズレベルの大規模システムに最適。

## 📊 対象規模

- **ユーザー数**: 100,000~1,000,000人以上
- **同時接続**: 5,000~50,000以上
- **開発チーム**: 15-50人以上（複数チーム）
- **予算**: 高予算

## 🏗️ アーキテクチャ図

```
┌──────────────────────────────────────────────────────────────┐
│                         Internet                              │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
                ┌──────────────┐
                │ Route 53     │
                └──────┬───────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌──────────────┐            ┌──────────────────┐
│ CloudFront   │            │ API Gateway      │
│ (Frontend)   │            │ (REST/GraphQL)   │
└──────┬───────┘            └────────┬─────────┘
       │                             │
       ▼                             ▼
┌──────────────┐           ┌─────────────────────────────────┐
│ S3 (Static)  │           │  Amazon EKS Cluster             │
└──────────────┘           │  (Kubernetes 1.28+)             │
                           │                                 │
                           │  ┌───────────────────────────┐  │
                           │  │   App Mesh / Istio        │  │
                           │  │   (Service Mesh)          │  │
                           │  └───────────┬───────────────┘  │
                           │              │                  │
                           │  ┌───────────┴───────────────┐  │
                           │  │    Ingress Controller     │  │
                           │  │    (ALB / Nginx)          │  │
                           │  └───────────┬───────────────┘  │
                           │              │                  │
   ┌───────────────────────┼──────────────┼──────────────────┼─────────────┐
   │                       │              │                  │             │
   ▼                       ▼              ▼                  ▼             ▼
┌──────────┐         ┌──────────┐   ┌──────────┐     ┌──────────┐  ┌──────────┐
│ User     │         │ Product  │   │  Cart    │     │  Order   │  │  Notif.  │
│ Service  │         │ Service  │   │ Service  │     │ Service  │  │ Service  │
│          │         │          │   │          │     │          │  │          │
│ Node.js  │         │ Node.js  │   │  Go      │     │ Python   │  │ Node.js  │
│ ────────┐│         │ ────────┐│   │ ────────┐│     │ ────────┐│  │ ────────┐│
│ Pod×3   ││         │ Pod×5   ││   │ Pod×3   ││     │ Pod×4   ││  │ Pod×2   ││
└──┬───────┘         └──┬───────┘   └──┬───────┘     └──┬───────┘  └──┬───────┘
   │                    │              │                │             │
   │                    │              │                │             │
   ▼                    ▼              ▼                ▼             ▼
┌──────────┐      ┌──────────┐   ┌──────────┐    ┌──────────┐  ┌──────────┐
│ RDS      │      │ RDS      │   │ Redis    │    │ RDS      │  │ SQS/SNS  │
│ Postgres │      │ Postgres │   │ (Cache)  │    │ Postgres │  │          │
│ (Users)  │      │ (Products│   │          │    │ (Orders) │  │          │
└──────────┘      └──────────┘   └──────────┘    └──────────┘  └──────────┘

            ┌────────────────────────────────────┐
            │  Shared Services / Infrastructure  │
            ├────────────────────────────────────┤
            │  - EventBridge (Event Bus)         │
            │  - S3 (File Storage)               │
            │  - ElastiCache (Shared Cache)      │
            │  - DynamoDB (Session Store)        │
            │  - Secrets Manager                 │
            └────────────────────────────────────┘

   ┌─────────────────────────────────────────────────────┐
   │           Observability Stack                       │
   ├─────────────────────────────────────────────────────┤
   │  - CloudWatch Container Insights                    │
   │  - X-Ray (Distributed Tracing)                      │
   │  - Prometheus + Grafana (Metrics)                   │
   │  - FluentBit (Logging)                              │
   │  - Jaeger (Alternative Tracing)                     │
   └─────────────────────────────────────────────────────┘
```

## 🛠️ 技術スタック

### フロントエンド
- **フレームワーク**: React 18 + TypeScript
- **状態管理**: Redux Toolkit / Zustand
- **API通信**: GraphQL (Apollo Client) / REST (React Query)
- **UI**: Tailwind CSS, shadcn/ui

### マイクロサービス

#### User Service (ユーザー管理)
- **言語**: Node.js + TypeScript (NestJS)
- **DB**: RDS PostgreSQL
- **責務**: 認証、ユーザープロフィール、権限管理

#### Product Service (商品管理)
- **言語**: Node.js + TypeScript (NestJS)
- **DB**: RDS PostgreSQL
- **キャッシュ**: ElastiCache Redis
- **責務**: 商品CRUD、カテゴリ、在庫情報

#### Cart Service (カート管理)
- **言語**: Go (Gin/Echo)
- **ストレージ**: Redis (セッションベース)
- **責務**: カート操作、一時保存

#### Order Service (注文管理)
- **言語**: Python (FastAPI)
- **DB**: RDS PostgreSQL
- **責務**: 注文処理、注文履歴、決済連携

#### Notification Service (通知)
- **言語**: Node.js + TypeScript
- **メッセージング**: SQS/SNS
- **責務**: メール、プッシュ通知

### インフラストラクチャ

#### Kubernetes (EKS)
- **バージョン**: 1.28+
- **ノード**: Managed Node Groups (t3.medium~)
- **Ingress**: AWS Load Balancer Controller
- **Service Mesh**: AWS App Mesh または Istio

#### データベース
- **RDS PostgreSQL**: サービス毎に分離
- **DynamoDB**: セッションストア
- **ElastiCache Redis**: 共有キャッシュ

#### メッセージング
- **EventBridge**: イベントバス
- **SQS**: 非同期キュー
- **SNS**: Pub/Sub

#### ストレージ
- **S3**: 画像・ファイル
- **EBS**: Persistent Volume

### DevOps

#### Infrastructure as Code
- **Terraform**: AWS リソース
- **Helm**: Kubernetes アプリケーション

#### CI/CD
- **GitHub Actions**: ビルド・テスト
- **ArgoCD**: GitOps デプロイメント
- **Flux CD**: Alternative GitOps

#### 監視・ログ
- **CloudWatch Container Insights**
- **Prometheus + Grafana**
- **X-Ray**: 分散トレーシング
- **FluentBit**: ログ集約

## 📁 ディレクトリ構造

```
pattern-3-microservices/
├── README.md
├── frontend/                         # フロントエンド
│   └── (Pattern 2と同様)
├── services/                         # マイクロサービス
│   ├── user-service/
│   │   ├── src/
│   │   ├── prisma/
│   │   ├── test/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── helm/
│   │       └── Chart.yaml
│   ├── product-service/
│   │   ├── src/
│   │   ├── prisma/
│   │   ├── test/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── helm/
│   │       └── Chart.yaml
│   ├── cart-service/
│   │   ├── cmd/
│   │   ├── internal/
│   │   ├── pkg/
│   │   ├── Dockerfile
│   │   ├── go.mod
│   │   └── helm/
│   │       └── Chart.yaml
│   ├── order-service/
│   │   ├── app/
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── helm/
│   │       └── Chart.yaml
│   └── notification-service/
│       ├── src/
│       ├── test/
│       ├── Dockerfile
│       ├── package.json
│       └── helm/
│           └── Chart.yaml
├── shared/                           # 共有ライブラリ
│   ├── proto/                        # gRPC定義（オプション）
│   │   ├── user.proto
│   │   ├── product.proto
│   │   └── order.proto
│   ├── events/                       # イベントスキーマ
│   │   ├── user-events.json
│   │   ├── product-events.json
│   │   └── order-events.json
│   └── types/                        # 共有型定義
├── kubernetes/                       # K8s マニフェスト
│   ├── base/                         # Kustomize base
│   │   ├── namespace.yaml
│   │   ├── configmap.yaml
│   │   └── secrets.yaml
│   ├── overlays/
│   │   ├── dev/
│   │   ├── staging/
│   │   └── production/
│   ├── ingress/
│   │   └── ingress.yaml
│   ├── service-mesh/
│   │   ├── virtual-services.yaml
│   │   ├── destination-rules.yaml
│   │   └── gateway.yaml
│   └── monitoring/
│       ├── prometheus.yaml
│       ├── grafana.yaml
│       └── alerts.yaml
├── terraform/                        # インフラコード
│   ├── main.tf
│   ├── eks.tf
│   ├── rds.tf
│   ├── elasticache.tf
│   ├── s3.tf
│   ├── eventbridge.tf
│   ├── sqs-sns.tf
│   └── modules/
│       ├── eks/
│       ├── rds/
│       └── service-mesh/
├── scripts/                          # 運用スクリプト
│   ├── deploy.sh
│   ├── rollback.sh
│   └── seed-data.sh
└── docker-compose.yml                # ローカル開発
```

## 🗄️ データベース設計（サービス毎に分離）

### User Service DB
```sql
CREATE DATABASE user_service;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Product Service DB
```sql
CREATE DATABASE product_service;

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

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    parent_id UUID REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Order Service DB
```sql
CREATE DATABASE order_service;

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- 外部キーではない
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL, -- 外部キーではない
    product_name VARCHAR(255) NOT NULL, -- データ複製
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
```

### Cart Service (Redis)
```
Key: cart:{user_id}
Value: JSON {
  "items": [
    {
      "product_id": "uuid",
      "quantity": 2,
      "added_at": "timestamp"
    }
  ]
}
TTL: 7 days
```

## 🔧 サービス間通信

### 1. 同期通信（REST API）

#### Product Service API
```typescript
// services/product-service/src/products/products.controller.ts
@Controller('products')
export class ProductsController {
  @Get()
  async findAll(@Query() query: ProductsQueryDto) {
    return this.productsService.findAll(query)
  }
  
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id)
  }
  
  // Internal API（サービス間通信用）
  @Get('internal/batch')
  @UseGuards(InternalAuthGuard)
  async findByIds(@Query('ids') ids: string[]) {
    return this.productsService.findByIds(ids)
  }
  
  // 在庫確認・減算（Order Serviceから呼ばれる）
  @Post('internal/reserve-stock')
  @UseGuards(InternalAuthGuard)
  async reserveStock(@Body() dto: ReserveStockDto) {
    return this.productsService.reserveStock(dto.items)
  }
}
```

#### Order Service → Product Service 通信
```python
# services/order-service/app/clients/product_client.py
import httpx
from typing import List

class ProductClient:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url
        self.api_key = api_key
    
    async def get_products(self, product_ids: List[str]) -> List[dict]:
        """複数商品の情報を取得"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/products/internal/batch",
                params={"ids": ",".join(product_ids)},
                headers={"X-API-Key": self.api_key},
                timeout=5.0
            )
            response.raise_for_status()
            return response.json()
    
    async def reserve_stock(self, items: List[dict]) -> bool:
        """在庫を予約（減算）"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/products/internal/reserve-stock",
                json={"items": items},
                headers={"X-API-Key": self.api_key},
                timeout=10.0
            )
            return response.status_code == 200
```

### LocalStack初期化スクリプト
```bash
# localstack-init/init-aws.sh
#!/bin/bash
echo "LocalStack (Pattern 3) を初期化中..."

# S3バケット作成
awslocal s3 mb s3://ecommerce-user-images
awslocal s3 mb s3://ecommerce-product-images
echo "S3バケット作成完了"

# EventBridge イベントバス作成
awslocal events create-event-bus --name ecommerce-event-bus
echo "EventBridgeイベントバス作成完了"

# SQS キュー作成
awslocal sqs create-queue --queue-name order-processing-queue
awslocal sqs create-queue --queue-name notification-queue
echo "SQSキュー作成完了"

# SNS トピック作成
awslocal sns create-topic --name order-notifications
echo "SNSトピック作成完了"

# Secrets Manager
awslocal secretsmanager create-secret \
  --name user-service/db \
  --secret-string '{"username":"postgres","password":"password"}'

awslocal secretsmanager create-secret \
  --name product-service/db \
  --secret-string '{"username":"postgres","password":"password"}'

awslocal secretsmanager create-secret \
  --name order-service/db \
  --secret-string '{"username":"postgres","password":"password"}'

echo "Secrets Manager設定完了"
echo "LocalStack初期化完了！"
```

### 2. 非同期通信（EventBridge with LocalStack）

#### イベント発行（Order Service）
```python
# services/order-service/app/events/publisher.py
import boto3
import json
import os
from datetime import datetime

class EventPublisher:
    def __init__(self):
        # LocalStack対応
        endpoint_url = os.getenv('AWS_ENDPOINT_URL')
        if endpoint_url:
            self.client = boto3.client(
                'events',
                endpoint_url=endpoint_url,
                region_name='ap-northeast-1',
                aws_access_key_id='test',
                aws_secret_access_key='test'
            )
        else:
            self.client = boto3.client('events')
        
        self.event_bus_name = 'ecommerce-event-bus'
    
    async def publish_order_created(self, order: dict):
        """注文作成イベントを発行"""
        event = {
            'Source': 'order-service',
            'DetailType': 'OrderCreated',
            'Detail': json.dumps({
                'order_id': order['id'],
                'user_id': order['user_id'],
                'total_amount': float(order['total_amount']),
                'items': order['items'],
                'timestamp': datetime.utcnow().isoformat()
            }),
            'EventBusName': self.event_bus_name
        }
        
        response = self.client.put_events(Entries=[event])
        return response
```

#### イベント購読（Notification Service）
```typescript
// services/notification-service/src/handlers/order-created.handler.ts
import { SQSEvent, SQSHandler } from 'aws-lambda'
import { EmailService } from '../services/email.service'

export const handler: SQSHandler = async (event: SQSEvent) => {
  const emailService = new EmailService()
  
  for (const record of event.Records) {
    const message = JSON.parse(record.body)
    const detail = JSON.parse(message.detail)
    
    if (message.detailType === 'OrderCreated') {
      await emailService.sendOrderConfirmation({
        userId: detail.user_id,
        orderId: detail.order_id,
        totalAmount: detail.total_amount,
        items: detail.items
      })
    }
  }
}
```

### 3. gRPC通信（オプション・高パフォーマンス）

#### Proto定義
```protobuf
// shared/proto/product.proto
syntax = "proto3";

package product;

service ProductService {
  rpc GetProduct(GetProductRequest) returns (Product);
  rpc GetProducts(GetProductsRequest) returns (GetProductsResponse);
  rpc ReserveStock(ReserveStockRequest) returns (ReserveStockResponse);
}

message GetProductRequest {
  string id = 1;
}

message Product {
  string id = 1;
  string name = 2;
  double price = 3;
  int32 stock = 4;
}

message GetProductsRequest {
  repeated string ids = 1;
}

message GetProductsResponse {
  repeated Product products = 1;
}

message ReserveStockRequest {
  repeated StockItem items = 1;
}

message StockItem {
  string product_id = 1;
  int32 quantity = 2;
}

message ReserveStockResponse {
  bool success = 1;
  string message = 2;
}
```

## ☁️ Kubernetes マニフェスト例

### Product Service Deployment
```yaml
# kubernetes/services/product-service/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: product-service
  namespace: ecommerce
  labels:
    app: product-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: product-service
  template:
    metadata:
      labels:
        app: product-service
        version: v1
    spec:
      serviceAccountName: product-service
      containers:
      - name: product-service
        image: 123456789.dkr.ecr.ap-northeast-1.amazonaws.com/product-service:latest
        ports:
        - containerPort: 3000
          protocol: TCP
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: product-service-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: product-service-secrets
              key: redis-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: product-service
  namespace: ecommerce
spec:
  selector:
    app: product-service
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: product-service-hpa
  namespace: ecommerce
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: product-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### API Gateway (Ingress)
```yaml
# kubernetes/ingress/api-gateway.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-gateway
  namespace: ecommerce
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:...
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS": 443}]'
    alb.ingress.kubernetes.io/ssl-redirect: '443'
spec:
  rules:
  - host: api.ecommerce.example.com
    http:
      paths:
      - path: /api/users
        pathType: Prefix
        backend:
          service:
            name: user-service
            port:
              number: 80
      - path: /api/products
        pathType: Prefix
        backend:
          service:
            name: product-service
            port:
              number: 80
      - path: /api/cart
        pathType: Prefix
        backend:
          service:
            name: cart-service
            port:
              number: 80
      - path: /api/orders
        pathType: Prefix
        backend:
          service:
            name: order-service
            port:
              number: 80
```

### Service Mesh (Istio Virtual Service)
```yaml
# kubernetes/service-mesh/product-virtual-service.yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: product-service
  namespace: ecommerce
spec:
  hosts:
  - product-service
  http:
  - match:
    - headers:
        x-api-version:
          exact: "v2"
    route:
    - destination:
        host: product-service
        subset: v2
  - route:
    - destination:
        host: product-service
        subset: v1
      weight: 90
    - destination:
        host: product-service
        subset: v2
      weight: 10  # Canary Deployment
    timeout: 5s
    retries:
      attempts: 3
      perTryTimeout: 2s
---
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: product-service
  namespace: ecommerce
spec:
  host: product-service
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 50
        http2MaxRequests: 100
    loadBalancer:
      simple: LEAST_REQUEST
    outlierDetection:
      consecutiveErrors: 5
      interval: 30s
      baseEjectionTime: 30s
  subsets:
  - name: v1
    labels:
      version: v1
  - name: v2
    labels:
      version: v2
```

## 🐳 Docker Compose（ローカル開発）

```yaml
version: '3.8'

services:
  # Frontend
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:8080/api
    volumes:
      - ./frontend:/app
  
  # API Gateway
  api-gateway:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - user-service
      - product-service
      - cart-service
      - order-service
  
  # User Service
  user-service:
    build: ./services/user-service
    environment:
      DATABASE_URL: postgresql://postgres:password@user-db:5432/user_service
      JWT_SECRET: dev-secret
    depends_on:
      - user-db
  
  # Product Service
  product-service:
    build: ./services/product-service
    environment:
      DATABASE_URL: postgresql://postgres:password@product-db:5432/product_service
      REDIS_URL: redis://redis:6379
    depends_on:
      - product-db
      - redis
  
  # Cart Service
  cart-service:
    build: ./services/cart-service
    environment:
      REDIS_URL: redis://redis:6379
      PRODUCT_SERVICE_URL: http://product-service:3000
    depends_on:
      - redis
  
  # Order Service
  order-service:
    build: ./services/order-service
    environment:
      DATABASE_URL: postgresql://postgres:password@order-db:5432/order_service
      PRODUCT_SERVICE_URL: http://product-service:3000
      USER_SERVICE_URL: http://user-service:3000
    depends_on:
      - order-db
  
  # Notification Service
  notification-service:
    build: ./services/notification-service
    environment:
      SQS_QUEUE_URL: http://localstack:4566/000000000000/order-events
    depends_on:
      - localstack
  
  # Databases
  user-db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: user_service
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - user_db_data:/var/lib/postgresql/data
  
  product-db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: product_service
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - product_db_data:/var/lib/postgresql/data
  
  order-db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: order_service
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - order_db_data:/var/lib/postgresql/data
  
  # Cache
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
  
  # LocalStack - AWS サービスエミュレーター（完全版）
  localstack:
    container_name: localstack-pattern3
    image: localstack/localstack:latest
    ports:
      - "4566:4566"            # LocalStack Gateway
      - "4510-4559:4510-4559"  # 外部サービスポート範囲
    environment:
      # マイクロサービスで使用するAWSサービス
      - SERVICES=s3,sqs,sns,secretsmanager,cloudwatch,xray,events
      - DEBUG=1
      - DOCKER_HOST=unix:///var/run/docker.sock
      - DEFAULT_REGION=ap-northeast-1
      # EventBridge有効化
      - MAIN_CONTAINER_NAME=localstack-pattern3
    volumes:
      - "${TMPDIR:-/tmp}/localstack:/var/lib/localstack"
      - "/var/run/docker.sock:/var/run/docker.sock"
      - ./localstack-init:/etc/localstack/init/ready.d
      - localstack_data:/tmp/localstack

volumes:
  user_db_data:
  product_db_data:
  order_db_data:
  redis_data:
  localstack_data:
```

## 🚀 CI/CD (GitOps with ArgoCD)

### GitHub Actions（ビルド・プッシュ）
```yaml
# .github/workflows/build-product-service.yml
name: Build Product Service

on:
  push:
    branches: [main]
    paths:
      - 'services/product-service/**'

jobs:
  build-and-push:
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
      
      - name: Build and push
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd services/product-service
          docker build -t $ECR_REGISTRY/product-service:$IMAGE_TAG .
          docker tag $ECR_REGISTRY/product-service:$IMAGE_TAG $ECR_REGISTRY/product-service:latest
          docker push $ECR_REGISTRY/product-service:$IMAGE_TAG
          docker push $ECR_REGISTRY/product-service:latest
      
      - name: Update Kubernetes manifest
        run: |
          cd kubernetes/services/product-service
          sed -i 's|image: .*|image: ${{ steps.login-ecr.outputs.registry }}/product-service:${{ github.sha }}|' deployment.yaml
          git config user.name github-actions
          git config user.email github-actions@github.com
          git add .
          git commit -m "Update product-service image to ${{ github.sha }}"
          git push
```

### ArgoCD Application
```yaml
# argocd/product-service-app.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: product-service
  namespace: argocd
spec:
  project: ecommerce
  source:
    repoURL: https://github.com/yourorg/ecommerce-k8s
    targetRevision: HEAD
    path: kubernetes/services/product-service
  destination:
    server: https://kubernetes.default.svc
    namespace: ecommerce
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
```

## ✅ メリット

1. **独立したデプロイ**: サービス毎に独立してデプロイ・スケール可能
2. **技術的多様性**: サービス毎に最適な技術スタックを選択
3. **障害分離**: 1サービスの障害が全体に波及しにくい
4. **チーム独立性**: 複数チームが並行開発可能
5. **スケーラビリティ**: サービス単位で細かくスケール
6. **段階的移行**: レガシーシステムから段階的に移行可能

## ⚠️ デメリット

1. **複雑性**: アーキテクチャ・運用が非常に複雑
2. **分散トランザクション**: データ整合性の保証が困難（Saga パターン必要）
3. **ネットワークレイテンシ**: サービス間通信のオーバーヘッド
4. **デバッグ困難**: 分散トレーシングなしでは問題特定が困難
5. **運用コスト**: Kubernetes運用の専門知識が必要
6. **高コスト**: インフラコストが大幅に増加

## 💰 コスト見積もり（月額）

### ローカル開発環境（LocalStack使用）
- **コスト**: **$0/月** 🎉
- PostgreSQL × 3、Redis、LocalStack（S3, SQS, SNS, EventBridge, Secrets Manager）すべてローカルで実行
- マイクロサービスアーキテクチャの学習・開発に最適
- Kubernetesなしで全サービスが動作
- AWS料金は一切かかりません

### 本番環境（AWS - 参考）

#### 開発環境（最小構成）
- EKS Control Plane: $73
- Worker Nodes (t3.medium × 3): ~$90
- RDS db.t3.micro × 3: ~$45
- ElastiCache: ~$12
- ALB: ~$20
- **合計**: 約 $240/月

#### 本番環境（中規模）
- EKS Control Plane: $73
- Worker Nodes (t3.large × 6-10): ~$400
- RDS db.t3.medium × 3 (Multi-AZ): ~$300
- ElastiCache Cluster: ~$100
- ALB + NLB: ~$40
- S3 + CloudFront: ~$50
- EventBridge + SQS/SNS: ~$30
- CloudWatch + X-Ray: ~$100
- **合計**: 約 $1,093/月

## 🎯 適用場面

- ✅ 大規模ECサイト・マーケットプレイス
- ✅ エンタープライズSaaS
- ✅ 複数チーム開発（15人以上）
- ✅ 急激なトラフィック増加が予想される
- ✅ 異なる技術スタックの混在が必要
- ✅ 高可用性・高信頼性が必須
- ❌ スタートアップ・MVP
- ❌ 小規模チーム（運用負荷が高すぎる）
- ❌ シンプルなCRUDアプリケーション

## 📚 学習ポイント

- Kubernetes基礎から応用
- Service Mesh (Istio/App Mesh)
- 分散トレーシング
- サーガパターン（分散トランザクション）
- イベント駆動アーキテクチャ
- CQRS (Command Query Responsibility Segregation)
- API Gateway パターン
- Circuit Breaker パターン
- GitOps (ArgoCD/Flux)

