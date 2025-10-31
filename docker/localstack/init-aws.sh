#!/bin/bash

# LocalStack Initialization Script
# This script initializes AWS services (S3, Secrets Manager) in LocalStack

set -e

echo "🚀 Initializing LocalStack AWS services..."

# Wait for LocalStack to be ready
echo "⏳ Waiting for LocalStack to be ready..."
until curl -s http://localhost:4566/_localstack/health | grep -q '"s3": "available"'; do
  sleep 2
done

echo "✅ LocalStack is ready!"

# Set AWS endpoint and region
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_DEFAULT_REGION=ap-northeast-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

# Create S3 bucket for images
echo "📦 Creating S3 bucket..."
awslocal s3 mb s3://ecommerce-images 2>/dev/null || echo "S3 bucket already exists"
awslocal s3api put-bucket-cors --bucket ecommerce-images --cors-configuration '{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}'

echo "✅ S3 bucket created: ecommerce-images"

# Create Secrets Manager secret for database credentials
echo "🔐 Creating Secrets Manager secret..."
awslocal secretsmanager create-secret \
  --name ecommerce-production-db-credentials \
  --description "Database credentials for ecommerce app" \
  --secret-string '{
    "username": "postgres",
    "password": "password",
    "engine": "postgres",
    "host": "db",
    "port": 5432,
    "dbname": "ecommerce",
    "url": "postgresql://postgres:password@db:5432/ecommerce"
  }' 2>/dev/null || echo "Secret already exists"

echo "✅ Secrets Manager secret created"

# Create CloudWatch Log Group
echo "📊 Creating CloudWatch log group..."
awslocal logs create-log-group --log-group-name /ecs/ecommerce-production-app 2>/dev/null || echo "Log group already exists"

echo "✅ CloudWatch log group created"

# List created resources
echo ""
echo "📋 LocalStack Resources Summary:"
echo "================================"
echo "S3 Buckets:"
awslocal s3 ls
echo ""
echo "Secrets Manager Secrets:"
awslocal secretsmanager list-secrets --query 'SecretList[*].[Name,ARN]' --output table
echo ""
echo "CloudWatch Log Groups:"
awslocal logs describe-log-groups --query 'logGroups[*].logGroupName' --output table
echo ""
echo "✨ LocalStack initialization complete!"
