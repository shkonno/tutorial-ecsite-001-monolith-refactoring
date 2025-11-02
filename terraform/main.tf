# Terraform Configuration for EC Site Monolith Architecture (Pattern 1)
# AWS Provider and Backend Configuration

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # S3 Backend for State Management (Uncomment after creating S3 bucket)
  # backend "s3" {
  #   bucket         = "ecommerce-terraform-state"
  #   key            = "pattern-1-monolith/terraform.tfstate"
  #   region         = "ap-northeast-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
      Pattern     = "Monolith"
    }
  }
}

# Data Sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Availability Zones
data "aws_availability_zones" "available" {
  state = "available"
}

