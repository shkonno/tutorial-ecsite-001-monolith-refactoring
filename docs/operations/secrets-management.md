# シークレット管理ガイド

## 概要
このドキュメントでは、アプリケーションで使用するシークレット（機密情報）の管理方法について説明します。

## 環境変数の分類

### 1. 必須の環境変数
以下の環境変数は、アプリケーションの動作に必須です：

- `DATABASE_URL`: PostgreSQL接続文字列
- `REDIS_HOST`, `REDIS_PORT`: Redis接続情報
- `NEXTAUTH_URL`: NextAuthのベースURL
- `NEXTAUTH_SECRET`: NextAuthの秘密鍵（32文字以上推奨）

### 2. AWS/S3関連
- `AWS_REGION`: AWSリージョン
- `AWS_ACCESS_KEY_ID`: AWSアクセスキー
- `AWS_SECRET_ACCESS_KEY`: AWSシークレットキー
- `AWS_S3_BUCKET_NAME`: S3バケット名
- `AWS_S3_ENDPOINT`: S3エンドポイント（LocalStack使用時のみ）

### 3. オプションの環境変数
- ログレベル、レート制限、メール送信、決済システム等

## 開発環境でのシークレット管理

### 1. .envファイルの作成
```bash
cp .env.example .env
```

### 2. 必要な値を設定
`.env`ファイルを編集し、実際の値を設定します。

### 3. .envファイルをGit管理から除外
`.gitignore`に以下が含まれていることを確認：
```
.env
.env.local
.env*.local
```

## 本番環境でのシークレット管理

### オプション1: AWS Secrets Manager（推奨）

#### 1. シークレットの作成
```bash
aws secretsmanager create-secret \
  --name /ecommerce/prod/database \
  --secret-string '{"username":"dbuser","password":"dbpassword"}'
```

#### 2. アプリケーションからの取得
```typescript
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

async function getSecret(secretName: string) {
  const client = new SecretsManagerClient({ region: "ap-northeast-1" });
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: secretName })
  );
  return JSON.parse(response.SecretString!);
}
```

#### 3. ECS/Fargateでの環境変数設定
```json
{
  "secrets": [
    {
      "name": "DATABASE_URL",
      "valueFrom": "arn:aws:secretsmanager:region:account-id:secret:secret-name"
    }
  ]
}
```

### オプション2: AWS Systems Manager Parameter Store

#### 1. パラメータの作成
```bash
aws ssm put-parameter \
  --name /ecommerce/prod/nextauth-secret \
  --value "your-secret-value" \
  --type SecureString
```

#### 2. ECSでの環境変数設定
```json
{
  "secrets": [
    {
      "name": "NEXTAUTH_SECRET",
      "valueFrom": "arn:aws:ssm:region:account-id:parameter/ecommerce/prod/nextauth-secret"
    }
  ]
}
```

### オプション3: 環境変数直接設定（非推奨）
- ECSタスク定義で環境変数を直接設定
- ⚠️ 推奨されません。Secrets ManagerまたはParameter Storeを使用してください

## シークレットのローテーション

### 1. データベースパスワード
- 定期的なローテーション（90日ごと推奨）
- AWS Secrets Managerの自動ローテーション機能を使用

### 2. API キー
- 使用していないキーは無効化
- アクセスログを確認し、不審なアクセスがないか監視

### 3. NEXTAUTH_SECRET
- セキュリティインシデント発生時に即座にローテーション
- すべてのセッションが無効化されることに注意

## ローテーション手順

### 1. 新しいシークレットの生成
```bash
# ランダムな32文字の文字列を生成
openssl rand -base64 32
```

### 2. Secrets Managerでの更新
```bash
aws secretsmanager update-secret \
  --secret-id /ecommerce/prod/nextauth-secret \
  --secret-string "new-secret-value"
```

### 3. アプリケーションの再起動
```bash
# ECSサービスの強制デプロイ
aws ecs update-service \
  --cluster ecommerce-cluster \
  --service ecommerce-service \
  --force-new-deployment
```

### 4. 旧シークレットの無効化
- 新しいシークレットが正常に動作することを確認後、旧シークレットを削除

## セキュリティベストプラクティス

### 1. 絶対にやってはいけないこと
- ❌ シークレットをGitにコミット
- ❌ シークレットをログに出力
- ❌ シークレットをクライアントサイドコードに含める
- ❌ 本番環境のシークレットを開発環境で使用
- ❌ シークレットをSlackやメールで共有

### 2. 推奨事項
- ✅ Secrets Manager/Parameter Storeを使用
- ✅ IAMロールベースのアクセス制御
- ✅ シークレットの定期的なローテーション
- ✅ 最小権限の原則（必要な権限のみ付与）
- ✅ アクセスログの監視
- ✅ シークレットのバージョン管理
- ✅ 環境ごとに異なるシークレットを使用

### 3. 監査とモニタリング
```bash
# Secrets Managerのアクセスログ確認
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=ResourceType,AttributeValue=AWS::SecretsManager::Secret

# Parameter Storeのアクセスログ確認
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=ResourceType,AttributeValue=AWS::SSM::Parameter
```

## トラブルシューティング

### シークレットが取得できない
1. IAMロールの権限を確認
2. シークレット名が正しいか確認
3. リージョンが正しいか確認
4. ネットワーク接続を確認

### アプリケーションがシークレットを読み込まない
1. 環境変数が正しく設定されているか確認
2. アプリケーションの再起動
3. ECSタスク定義を確認
4. CloudWatch Logsでエラーを確認

## 参考資料
- [AWS Secrets Manager Best Practices](https://docs.aws.amazon.com/secretsmanager/latest/userguide/best-practices.html)
- [NextAuth.js Security](https://next-auth.js.org/configuration/options#security)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

