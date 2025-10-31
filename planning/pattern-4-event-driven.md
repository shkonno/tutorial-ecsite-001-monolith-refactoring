# Pattern 4: イベント駆動 + ハイブリッドアーキテクチャ

> 📊 **アーキテクチャ図**: [Draw.io図を開く](./diagrams/pattern-4-event-driven.drawio)

## 🎯 概要

コンテナ(ECS)とサーバーレス(Lambda)を組み合わせたハイブリッド構成。EventBridgeを中心としたイベント駆動アーキテクチャで、コスト最適化と高スケーラビリティを実現。

## 📊 対象規模

- **ユーザー数**: 50,000~500,000人
- **同時接続**: 変動が大きい（1,000~20,000）
- **トラフィック**: スパイキー（セール時など急増）
- **開発チーム**: 5-20人
- **予算**: 中〜高予算（変動コスト）

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
│ + S3         │            │ (REST/WebSocket) │
│ (Frontend)   │            └────────┬─────────┘
└──────────────┘                     │
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
          ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
          │ Lambda       │  │ ECS Fargate  │  │ Lambda       │
          │ (Auth)       │  │ (Core API)   │  │ (Query)      │
          └──────────────┘  └──────┬───────┘  └──────────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │  EventBridge    │
                          │  (Event Bus)    │
                          └────────┬────────┘
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      │                            │                            │
      ▼                            ▼                            ▼
┌─────────────┐            ┌─────────────┐            ┌─────────────┐
│ SQS Queue   │            │ SQS Queue   │            │ SNS Topic   │
│ (Order)     │            │ (Stock)     │            │ (Notif)     │
└──────┬──────┘            └──────┬──────┘            └──────┬──────┘
       │                          │                          │
       ▼                          ▼                          ▼
┌─────────────┐            ┌─────────────┐            ┌─────────────┐
│ Lambda      │            │ ECS Task    │            │ Lambda      │
│ (Order      │            │ (Stock      │            │ (Email/SMS) │
│  Processor) │            │  Updater)   │            │             │
└──────┬──────┘            └──────┬──────┘            └─────────────┘
       │                          │
       ▼                          ▼
┌─────────────────────────────────────────────────────┐
│              データストア層                          │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ RDS      │  │ DynamoDB │  │ ElastiCache│        │
│  │ Postgres │  │ (Orders/ │  │ Redis      │        │
│  │ (Products│  │  Sessions)│  │ (Cache)    │        │
│  │  Users)  │  │          │  │            │        │
│  └──────────┘  └──────────┘  └──────────┘         │
│                                                     │
│  ┌──────────┐  ┌──────────┐                       │
│  │ S3       │  │ OpenSearch│                       │
│  │ (Images) │  │ (Search)  │                       │
│  └──────────┘  └──────────┘                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│         Step Functions (オーケストレーション)        │
├─────────────────────────────────────────────────────┤
│  Order Saga Workflow:                               │
│  1. 在庫確認 → 2. 決済 → 3. 在庫減算 → 4. 通知      │
│  ※失敗時は自動ロールバック                          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              監視・ログ                              │
├─────────────────────────────────────────────────────┤
│  - CloudWatch Logs & Metrics                        │
│  - X-Ray (Distributed Tracing)                      │
│  - CloudWatch Insights                              │
│  - EventBridge Archive & Replay                     │
└─────────────────────────────────────────────────────┘
```

## 🛠️ 技術スタック

### フロントエンド
- **フレームワーク**: React 18 + TypeScript (Vite)
- **状態管理**: Zustand + React Query
- **リアルタイム**: WebSocket (API Gateway WebSocket)
- **UI**: Tailwind CSS

### バックエンド（ハイブリッド）

#### コンテナ（ECS Fargate）
- **Core API Service**: Node.js (NestJS)
  - 商品CRUD、ユーザー管理
  - 複雑なビジネスロジック
  - 長時間処理（レポート生成など）

- **Stock Management Service**: Go
  - 在庫管理（高パフォーマンス要求）
  - リアルタイム在庫更新

#### サーバーレス（Lambda）
- **Auth Functions**: Node.js
  - JWT発行・検証
  - OAuth連携
  
- **Query Functions**: Python
  - 商品検索（OpenSearch連携）
  - レコメンデーション

- **Event Processors**: Node.js/Python
  - 注文処理
  - 通知送信
  - データ同期

### イベント・メッセージング
- **EventBridge**: イベントバス（中央集約）
- **SQS**: 非同期キュー（確実な処理）
- **SNS**: Pub/Sub（ファンアウト通知）
- **Step Functions**: ワークフローオーケストレーション

### データストア
- **RDS PostgreSQL**: トランザクションデータ（商品、ユーザー）
- **DynamoDB**: 注文履歴、セッション（高スループット）
- **ElastiCache Redis**: キャッシュ、リアルタイムデータ
- **OpenSearch**: 全文検索
- **S3**: 画像、ログアーカイブ

### DevOps
- **IaC**: AWS SAM + Terraform
- **CI/CD**: GitHub Actions + CodePipeline
- **監視**: CloudWatch, X-Ray

## 📁 ディレクトリ構造

```
pattern-4-event-driven/
├── README.md
├── frontend/                         # フロントエンド
│   └── (Pattern 2と同様)
├── containers/                       # ECSコンテナ
│   ├── core-api/                     # コアAPI（NestJS）
│   │   ├── src/
│   │   │   ├── products/
│   │   │   ├── users/
│   │   │   ├── events/              # イベント発行
│   │   │   └── main.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   └── stock-service/                # 在庫管理（Go）
│       ├── cmd/
│       ├── internal/
│       ├── Dockerfile
│       └── go.mod
├── lambdas/                          # Lambda関数
│   ├── auth/
│   │   ├── login/
│   │   │   ├── handler.ts
│   │   │   └── package.json
│   │   └── register/
│   │       ├── handler.ts
│   │       └── package.json
│   ├── query/
│   │   ├── product-search/
│   │   │   ├── handler.py
│   │   │   └── requirements.txt
│   │   └── recommendations/
│   │       ├── handler.py
│   │       └── requirements.txt
│   ├── processors/
│   │   ├── order-processor/
│   │   │   ├── handler.ts
│   │   │   └── package.json
│   │   ├── stock-updater/
│   │   │   ├── handler.py
│   │   │   └── requirements.txt
│   │   └── notification-sender/
│   │       ├── handler.ts
│   │       └── package.json
│   └── shared/                       # 共有ライブラリ
│       ├── utils/
│       └── types/
├── step-functions/                   # ワークフロー定義
│   ├── order-saga.asl.json
│   └── inventory-restock.asl.json
├── events/                           # イベントスキーマ
│   ├── schemas/
│   │   ├── order-created.json
│   │   ├── order-completed.json
│   │   ├── stock-updated.json
│   │   └── user-registered.json
│   └── rules/
│       ├── order-processing-rule.json
│       └── notification-rule.json
├── infrastructure/                   # インフラコード
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── ecs.tf
│   │   ├── api-gateway.tf
│   │   ├── eventbridge.tf
│   │   ├── sqs-sns.tf
│   │   ├── dynamodb.tf
│   │   ├── rds.tf
│   │   └── opensearch.tf
│   └── sam/                          # SAM (Lambda)
│       ├── template.yaml
│       └── samconfig.toml
├── scripts/
│   ├── deploy-lambdas.sh
│   └── seed-data.sh
└── docker-compose.yml                # ローカル開発
```

## 🗄️ データベース設計

### RDS PostgreSQL（リレーショナルデータ）
```sql
-- Users（認証・プロフィール）
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products（商品マスター）
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock（在庫マスター）
CREATE TABLE stock (
    product_id UUID PRIMARY KEY REFERENCES products(id),
    quantity INTEGER DEFAULT 0,
    reserved INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### DynamoDB（高スループットデータ）

#### Orders Table
```
Partition Key: user_id (String)
Sort Key: order_id (String)
GSI: order_id-index (order_idでクエリ可能)

Item構造:
{
  "user_id": "uuid",
  "order_id": "uuid",
  "status": "pending|processing|completed|failed",
  "total_amount": 15000,
  "items": [
    {
      "product_id": "uuid",
      "product_name": "商品名",
      "quantity": 2,
      "price": 7500
    }
  ],
  "created_at": "2025-10-29T10:00:00Z",
  "updated_at": "2025-10-29T10:05:00Z",
  "ttl": 1735660800  // 1年後自動削除
}
```

#### Sessions Table
```
Partition Key: session_id (String)

Item構造:
{
  "session_id": "uuid",
  "user_id": "uuid",
  "cart": {
    "items": [...]
  },
  "expires_at": "timestamp",
  "ttl": 1698566400  // TTL for automatic deletion
}
```

## 🔧 イベント駆動実装

## LocalStack初期化スクリプト（イベント駆動用）

```bash
# localstack-init/init-aws.sh
#!/bin/bash
echo "LocalStack (Pattern 4 - Event-Driven) を初期化中..."

# S3バケット作成
awslocal s3 mb s3://ecommerce-images
awslocal s3 mb s3://ecommerce-reports
echo "S3バケット作成完了"

# DynamoDB テーブル作成
awslocal dynamodb create-table \
  --table-name ecommerce-orders \
  --attribute-definitions \
    AttributeName=user_id,AttributeType=S \
    AttributeName=order_id,AttributeType=S \
  --key-schema \
    AttributeName=user_id,KeyType=HASH \
    AttributeName=order_id,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    "IndexName=order_id-index,KeySchema=[{AttributeName=order_id,KeyType=HASH}],Projection={ProjectionType=ALL}"

awslocal dynamodb create-table \
  --table-name ecommerce-sessions \
  --attribute-definitions AttributeName=session_id,AttributeType=S \
  --key-schema AttributeName=session_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

echo "DynamoDBテーブル作成完了"

# EventBridge イベントバス作成
awslocal events create-event-bus --name ecommerce-event-bus
echo "EventBridgeイベントバス作成完了"

# SQS キュー作成
awslocal sqs create-queue --queue-name order-processing-queue
awslocal sqs create-queue --queue-name order-processing-dlq
awslocal sqs create-queue --queue-name stock-update-queue
awslocal sqs create-queue --queue-name notification-queue
echo "SQSキュー作成完了"

# SNS トピック作成
awslocal sns create-topic --name order-notifications
awslocal sns create-topic --name stock-alerts
echo "SNSトピック作成完了"

# EventBridge ルール作成（OrderCreated → SQS）
ORDER_QUEUE_ARN=$(awslocal sqs get-queue-attributes \
  --queue-url http://localstack:4566/000000000000/order-processing-queue \
  --attribute-names QueueArn --query 'Attributes.QueueArn' --output text)

awslocal events put-rule \
  --name order-created-rule \
  --event-bus-name ecommerce-event-bus \
  --event-pattern '{"source":["core-api.orders"],"detail-type":["OrderCreated"]}'

awslocal events put-targets \
  --rule order-created-rule \
  --event-bus-name ecommerce-event-bus \
  --targets "Id=1,Arn=$ORDER_QUEUE_ARN"

echo "EventBridgeルール作成完了"

# Secrets Manager
awslocal secretsmanager create-secret \
  --name core-api/db-credentials \
  --secret-string '{"username":"postgres","password":"password"}'

echo "Secrets Manager設定完了"
echo "LocalStack初期化完了！"
```

### 1. イベント発行（Core API with LocalStack）

```typescript
// containers/core-api/src/events/event-publisher.ts
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge'

export class EventPublisher {
  private client: EventBridgeClient
  private eventBusName: string
  
  constructor() {
    // LocalStack対応
    const endpoint = process.env.AWS_ENDPOINT_URL
    this.client = new EventBridgeClient({
      region: process.env.AWS_REGION || 'ap-northeast-1',
      ...(endpoint && {
        endpoint,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
        },
      }),
    })
    this.eventBusName = process.env.EVENT_BUS_NAME || 'ecommerce-event-bus'
  }
  
  async publishOrderCreated(order: Order) {
    const event = {
      Source: 'core-api.orders',
      DetailType: 'OrderCreated',
      Detail: JSON.stringify({
        orderId: order.id,
        userId: order.userId,
        items: order.items,
        totalAmount: order.totalAmount,
        timestamp: new Date().toISOString()
      }),
      EventBusName: this.eventBusName
    }
    
    const command = new PutEventsCommand({ Entries: [event] })
    const response = await this.client.send(command)
    
    if (response.FailedEntryCount && response.FailedEntryCount > 0) {
      throw new Error('Failed to publish event')
    }
    
    return response
  }
  
  async publishStockReserved(productId: string, quantity: number) {
    const event = {
      Source: 'core-api.stock',
      DetailType: 'StockReserved',
      Detail: JSON.stringify({
        productId,
        quantity,
        timestamp: new Date().toISOString()
      }),
      EventBusName: this.eventBusName
    }
    
    await this.client.send(new PutEventsCommand({ Entries: [event] }))
  }
}
```

### 2. 注文処理Lambda（イベント購読、LocalStack対応）

```typescript
// lambdas/processors/order-processor/handler.ts
import { SQSEvent, SQSHandler } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'

// LocalStack対応のDynamoDB設定
const endpoint = process.env.AWS_ENDPOINT_URL
const ddbClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.AWS_REGION || 'ap-northeast-1',
    ...(endpoint && {
      endpoint,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
      },
    }),
  })
)

export const handler: SQSHandler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    try {
      const message = JSON.parse(record.body)
      const detail = JSON.parse(message.detail)
      
      if (message.detailType === 'OrderCreated') {
        await processOrder(detail)
      }
    } catch (error) {
      console.error('Error processing message:', error)
      throw error // SQSが再試行
    }
  }
}

async function processOrder(orderDetail: any) {
  // DynamoDBに注文を保存
  await ddbClient.send(new PutCommand({
    TableName: process.env.ORDERS_TABLE,
    Item: {
      user_id: orderDetail.userId,
      order_id: orderDetail.orderId,
      status: 'processing',
      total_amount: orderDetail.totalAmount,
      items: orderDetail.items,
      created_at: orderDetail.timestamp,
      updated_at: new Date().toISOString()
    }
  }))
  
  console.log(`Order ${orderDetail.orderId} processed successfully`)
}
```

### 3. Step Functions ワークフロー（Sagaパターン）

```json
{
  "Comment": "Order Processing Saga",
  "StartAt": "ReserveStock",
  "States": {
    "ReserveStock": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:ap-northeast-1:123456789:function:reserve-stock",
      "ResultPath": "$.stockReservation",
      "Catch": [{
        "ErrorEquals": ["States.ALL"],
        "Next": "OrderFailed",
        "ResultPath": "$.error"
      }],
      "Next": "ProcessPayment"
    },
    "ProcessPayment": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:ap-northeast-1:123456789:function:process-payment",
      "ResultPath": "$.payment",
      "Catch": [{
        "ErrorEquals": ["States.ALL"],
        "Next": "ReleaseStock",
        "ResultPath": "$.error"
      }],
      "Next": "UpdateStock"
    },
    "UpdateStock": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:ap-northeast-1:123456789:function:update-stock",
      "ResultPath": "$.stockUpdate",
      "Catch": [{
        "ErrorEquals": ["States.ALL"],
        "Next": "RefundPayment",
        "ResultPath": "$.error"
      }],
      "Next": "SendNotification"
    },
    "SendNotification": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:ap-northeast-1:123456789:function:send-notification",
      "ResultPath": "$.notification",
      "Next": "OrderCompleted"
    },
    "OrderCompleted": {
      "Type": "Succeed"
    },
    "ReleaseStock": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:ap-northeast-1:123456789:function:release-stock",
      "ResultPath": "$.stockRelease",
      "Next": "OrderFailed"
    },
    "RefundPayment": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:ap-northeast-1:123456789:function:refund-payment",
      "ResultPath": "$.refund",
      "Next": "ReleaseStock"
    },
    "OrderFailed": {
      "Type": "Fail",
      "Error": "OrderProcessingFailed",
      "Cause": "Order processing failed at one of the steps"
    }
  }
}
```

### 4. リアルタイム通知（WebSocket）

```typescript
// lambdas/websocket/connection/handler.ts
import { APIGatewayProxyHandler } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'

const ddbClient = DynamoDBDocumentClient.from(new DynamoDBClient({}))

export const connectHandler: APIGatewayProxyHandler = async (event) => {
  const connectionId = event.requestContext.connectionId
  const userId = event.queryStringParameters?.userId
  
  // 接続情報を保存
  await ddbClient.send(new PutCommand({
    TableName: process.env.CONNECTIONS_TABLE,
    Item: {
      connectionId,
      userId,
      connectedAt: new Date().toISOString()
    }
  }))
  
  return { statusCode: 200, body: 'Connected' }
}

// 注文ステータス更新をWebSocketで送信
export const notifyOrderStatus = async (userId: string, orderStatus: any) => {
  const apiGateway = new ApiGatewayManagementApiClient({
    endpoint: process.env.WEBSOCKET_ENDPOINT
  })
  
  // ユーザーの接続を取得
  const connections = await getConnectionsByUserId(userId)
  
  for (const connection of connections) {
    try {
      await apiGateway.send(new PostToConnectionCommand({
        ConnectionId: connection.connectionId,
        Data: JSON.stringify({
          type: 'ORDER_STATUS_UPDATE',
          data: orderStatus
        })
      }))
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }
}
```

## ☁️ AWS SAM テンプレート例

```yaml
# infrastructure/sam/template.yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Runtime: nodejs20.x
    Timeout: 30
    MemorySize: 512
    Environment:
      Variables:
        EVENT_BUS_NAME: !Ref EventBus
        ORDERS_TABLE: !Ref OrdersTable

Resources:
  # EventBridge
  EventBus:
    Type: AWS::Events::EventBus
    Properties:
      Name: ecommerce-event-bus
  
  # Order Processor Lambda
  OrderProcessorFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: ../../lambdas/processors/order-processor/
      Handler: handler.handler
      Events:
        OrderQueue:
          Type: SQS
          Properties:
            Queue: !GetAtt OrderQueue.Arn
            BatchSize: 10
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref OrdersTable
  
  # Order SQS Queue
  OrderQueue:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: order-processing-queue
      VisibilityTimeout: 180
      RedrivePolicy:
        deadLetterTargetArn: !GetAtt OrderDLQ.Arn
        maxReceiveCount: 3
  
  OrderDLQ:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: order-processing-dlq
  
  # EventBridge Rule
  OrderCreatedRule:
    Type: AWS::Events::Rule
    Properties:
      EventBusName: !Ref EventBus
      EventPattern:
        source:
          - core-api.orders
        detail-type:
          - OrderCreated
      Targets:
        - Arn: !GetAtt OrderQueue.Arn
          Id: OrderQueueTarget
  
  # DynamoDB Tables
  OrdersTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: ecommerce-orders
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: user_id
          AttributeType: S
        - AttributeName: order_id
          AttributeType: S
      KeySchema:
        - AttributeName: user_id
          KeyType: HASH
        - AttributeName: order_id
          KeyType: RANGE
      GlobalSecondaryIndexes:
        - IndexName: order_id-index
          KeySchema:
            - AttributeName: order_id
              KeyType: HASH
          Projection:
            ProjectionType: ALL
      TimeToLiveSpecification:
        AttributeName: ttl
        Enabled: true
  
  # API Gateway (WebSocket)
  WebSocketApi:
    Type: AWS::ApiGatewayV2::Api
    Properties:
      Name: ecommerce-websocket
      ProtocolType: WEBSOCKET
      RouteSelectionExpression: $request.body.action
  
  ConnectFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: ../../lambdas/websocket/connection/
      Handler: handler.connectHandler
  
  # Step Functions
  OrderSagaStateMachine:
    Type: AWS::Serverless::StateMachine
    Properties:
      DefinitionUri: ../../step-functions/order-saga.asl.json
      Role: !GetAtt StateMachineRole.Arn
      Events:
        OrderCreated:
          Type: EventBridgeRule
          Properties:
            EventBusName: !Ref EventBus
            Pattern:
              source:
                - core-api.orders
              detail-type:
                - OrderCreated

Outputs:
  EventBusName:
    Value: !Ref EventBus
  OrdersTableName:
    Value: !Ref OrdersTable
  WebSocketURL:
    Value: !Sub 'wss://${WebSocketApi}.execute-api.${AWS::Region}.amazonaws.com/${Stage}'
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
      VITE_API_URL: http://localhost:3000/api
      VITE_WS_URL: ws://localhost:3001
  
  # Core API (ECS Fargate相当)
  core-api:
    build: ./containers/core-api
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/ecommerce
      REDIS_URL: redis://redis:6379
      EVENT_BUS_ENDPOINT: http://localstack:4566
    depends_on:
      - postgres
      - redis
      - localstack
  
  # Stock Service (ECS Fargate相当)
  stock-service:
    build: ./containers/stock-service
    ports:
      - "3002:3002"
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/ecommerce
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
  
  # LocalStack - AWS サービスエミュレーター（フル機能版）
  localstack:
    container_name: localstack-pattern4
    image: localstack/localstack:latest
    ports:
      - "4566:4566"            # LocalStack Gateway
      - "4510-4559:4510-4559"  # 外部サービスポート範囲
    environment:
      # イベント駆動で使用する全AWSサービス
      - SERVICES=lambda,sqs,sns,dynamodb,s3,events,apigateway,secretsmanager,cloudwatch,xray,stepfunctions
      - DEBUG=1
      - LAMBDA_EXECUTOR=docker
      - DOCKER_HOST=unix:///var/run/docker.sock
      - DEFAULT_REGION=ap-northeast-1
      # Lambda関数の実行環境
      - LAMBDA_DOCKER_NETWORK=pattern-4-event-driven_default
      - MAIN_CONTAINER_NAME=localstack-pattern4
    volumes:
      - "${TMPDIR:-/tmp}/localstack:/var/lib/localstack"
      - /var/run/docker.sock:/var/run/docker.sock
      - ./localstack-init:/etc/localstack/init/ready.d
      - ./lambdas:/var/task/lambdas
  
  # PostgreSQL
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ecommerce
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  # OpenSearch (Elasticsearch互換)
  opensearch:
    image: opensearchproject/opensearch:2
    environment:
      discovery.type: single-node
      DISABLE_SECURITY_PLUGIN: true
    ports:
      - "9200:9200"
    volumes:
      - opensearch_data:/usr/share/opensearch/data

volumes:
  postgres_data:
  opensearch_data:
```

## 🚀 デプロイメント

### ローカル開発環境の起動（LocalStack使用）
```bash
cd pattern-4-event-driven

# LocalStack初期化スクリプトを作成
mkdir -p localstack-init
# init-aws.shを作成（上記のスクリプト参照）

# Docker Compose起動
docker-compose up -d

# LocalStackの起動を待つ
echo "LocalStackの起動を待機中..."
sleep 15

# 初期化が完了したか確認
docker logs localstack-pattern4

# Lambda関数をLocalStackにデプロイ（開発時）
./scripts/deploy-lambdas-local.sh

# アプリケーション起動
cd containers/core-api
npm install
npm run dev
```

### LocalStack用Lambda関数デプロイスクリプト
```bash
# scripts/deploy-lambdas-local.sh
#!/bin/bash
echo "Lambda関数をLocalStackにデプロイ中..."

# Order Processor
cd lambdas/processors/order-processor
zip -r function.zip .
awslocal lambda create-function \
  --function-name order-processor \
  --runtime nodejs20.x \
  --handler handler.handler \
  --zip-file fileb://function.zip \
  --role arn:aws:iam::000000000000:role/lambda-role \
  --environment "Variables={AWS_ENDPOINT_URL=http://localstack:4566,ORDERS_TABLE=ecommerce-orders}"

# Notification Sender
cd ../../notification-sender
zip -r function.zip .
awslocal lambda create-function \
  --function-name notification-sender \
  --runtime nodejs20.x \
  --handler handler.handler \
  --zip-file fileb://function.zip \
  --role arn:aws:iam::000000000000:role/lambda-role

echo "Lambda関数デプロイ完了！"
```

### Lambda デプロイ（本番環境）
```bash
# SAM Deploy
cd infrastructure/sam
sam build
sam deploy --guided

# または個別デプロイ
cd lambdas/processors/order-processor
npm run build
aws lambda update-function-code \
  --function-name order-processor \
  --zip-file fileb://dist/function.zip
```

### ECS デプロイ
```bash
# Terraform
cd infrastructure/terraform
terraform init
terraform apply

# コンテナイメージ更新
aws ecr get-login-password --region ap-northeast-1 | \
  docker login --username AWS --password-stdin 123456789.dkr.ecr.ap-northeast-1.amazonaws.com

docker build -t core-api ./containers/core-api
docker tag core-api:latest 123456789.dkr.ecr.ap-northeast-1.amazonaws.com/core-api:latest
docker push 123456789.dkr.ecr.ap-northeast-1.amazonaws.com/core-api:latest

aws ecs update-service --cluster ecommerce --service core-api --force-new-deployment
```

## ✅ メリット

1. **コスト最適化**: 使用量ベース課金（Lambdaは実行時のみ）
2. **自動スケーリング**: Lambda/DynamoDBは完全自動スケール
3. **疎結合**: イベント駆動で各コンポーネントが独立
4. **非同期処理**: 長時間処理をバックグラウンドで実行
5. **リトライ・リカバリ**: SQS DLQ、Step Functionsで自動リトライ
6. **スパイク対応**: 急激なトラフィック増加に強い
7. **運用負荷低減**: サーバーレスで運用負荷最小化

## ⚠️ デメリット

1. **コールドスタート**: Lambdaの初回実行が遅い
2. **複雑なデバッグ**: 分散処理のデバッグが困難
3. **ベンダーロックイン**: AWSサービスに強く依存
4. **イベント順序**: EventBridgeは順序保証なし（SQS FIFOで対応可能）
5. **Lambda制限**: 実行時間15分、メモリ10GB上限
6. **コスト予測困難**: 使用量次第でコストが変動
7. **ローカル開発**: LocalStackでもAWSとの差異あり

## 💰 コスト見積もり（月額）

### ローカル開発環境（LocalStack使用）
- **コスト**: **$0/月** 🎉
- PostgreSQL、Redis、OpenSearch、LocalStackすべてローカルで実行
- LocalStackでエミュレート：
  - Lambda（無制限実行）
  - DynamoDB（無制限読み書き）
  - SQS/SNS（無制限メッセージ）
  - EventBridge（無制限イベント）
  - Step Functions（無制限ワークフロー）
  - API Gateway（WebSocket含む）
- イベント駆動アーキテクチャの完全な学習環境
- AWS料金は一切かかりません

### 本番環境（AWS - 参考）

#### 開発環境
- ECS Fargate (0.5 vCPU, 1GB) × 2: ~$30
- Lambda (100万リクエスト/月): ~$0.20
- API Gateway: ~$3.50
- DynamoDB (オンデマンド): ~$2
- RDS db.t3.micro: ~$15
- ElastiCache: ~$12
- EventBridge: ~$1
- Step Functions: ~$0.25
- **合計**: 約 $64/月

#### 本番環境（中規模、変動あり）

**通常時**
- ECS Fargate (1 vCPU, 2GB) × 2: ~$60
- Lambda (5000万リクエスト/月): ~$10
- API Gateway (WebSocket含む): ~$100
- DynamoDB (オンデマンド): ~$50
- RDS db.t3.small: ~$35
- ElastiCache: ~$25
- EventBridge: ~$5
- Step Functions (10万実行): ~$25
- S3 + CloudFront: ~$50
- OpenSearch (t3.small): ~$50
- **合計**: 約 $410/月

**セール時（トラフィック10倍）**
- Lambda/API Gateway/DynamoDB がスケール: 約 $800-1,200/月
- ECS/RDS等は固定コスト
- **合計**: 約 $1,000-1,500/月

## 🎯 適用場面

- ✅ トラフィックが変動する（スパイキー）
- ✅ 非同期処理が多い（注文、通知、レポート）
- ✅ イベント駆動が適している
- ✅ コスト最適化が重要
- ✅ マイクロサービスほど複雑にしたくない
- ✅ AWSエコシステムに精通している
- ❌ レイテンシが非常にシビア（コールドスタート問題）
- ❌ ベンダーロックイン回避が必須
- ❌ 複雑なトランザクション処理が多い

## 📚 学習ポイント

- **イベント駆動アーキテクチャ**: EventBridge、SQS、SNSを使った非同期通信
- **Lambda関数開発**: LocalStackでのローカル開発とテスト
- **Step Functions**: Sagaパターンによる分散トランザクション管理
- **DynamoDB設計**: NoSQLモデリング、GSI、TTL
- **ハイブリッド構成**: コンテナとサーバーレスの組み合わせ
- **WebSocket通信**: リアルタイム通知の実装
- **LocalStack活用**: 完全にローカルでAWSサービスをエミュレート
- **コスト最適化**: 使用量ベース課金の理解と最適化

## 🛠️ LocalStack使用時のヒント

### 1. エンドポイントURLの設定
すべてのAWS SDKクライアントで`endpoint`を指定：
```typescript
const client = new ServiceClient({
  endpoint: process.env.AWS_ENDPOINT_URL, // http://localstack:4566
  region: 'ap-northeast-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' }
})
```

### 2. S3のforcePathStyle
S3クライアントでは必須：
```typescript
const s3 = new S3Client({
  forcePathStyle: true, // LocalStackで必須
  // ...
})
```

### 3. Lambda関数のローカルテスト
```bash
# イベントをJSON形式で作成
echo '{"body":"test"}' > event.json

# LocalStackのLambda関数を直接呼び出し
awslocal lambda invoke \
  --function-name order-processor \
  --payload file://event.json \
  response.json

cat response.json
```

### 4. EventBridgeのデバッグ
```bash
# イベントバスのルールを確認
awslocal events list-rules --event-bus-name ecommerce-event-bus

# イベントの送信テスト
awslocal events put-events \
  --entries '[{"Source":"test","DetailType":"Test","Detail":"{}","EventBusName":"ecommerce-event-bus"}]'
```

### 5. DynamoDBのデータ確認
```bash
# テーブルスキャン
awslocal dynamodb scan --table-name ecommerce-orders

# 特定アイテムの取得
awslocal dynamodb get-item \
  --table-name ecommerce-orders \
  --key '{"user_id":{"S":"test-user"},"order_id":{"S":"order-123"}}'
```

