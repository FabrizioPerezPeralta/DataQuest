terraform {
  required_version = ">= 1.3"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "dataquest-terraform-state"
    key            = "spring-boot-dataquest/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "dataquest-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "dataquest"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

module "network" {
  source      = "./modules/network"
  environment = var.environment
  vpc_cidr    = var.vpc_cidr
  azs         = var.availability_zones
}

module "security" {
  source      = "./modules/security"
  environment = var.environment
  vpc_id      = module.network.vpc_id
}

module "database" {
  source             = "./modules/database"
  environment        = var.environment
  vpc_id             = module.network.vpc_id
  private_subnet_ids = module.network.private_subnet_ids
  ecs_sg_id          = module.security.ecs_sg_id
  db_instance_class  = var.db_instance_class
  multi_az           = var.db_multi_az
  db_name            = var.db_name
  db_username        = var.db_username
  db_password        = var.db_password
}

module "compute" {
  source             = "./modules/compute"
  environment        = var.environment
  vpc_id             = module.network.vpc_id
  public_subnet_ids  = module.network.public_subnet_ids
  private_subnet_ids = module.network.private_subnet_ids
  ecs_sg_id          = module.security.ecs_sg_id
  ecs_task_role_arn  = module.security.ecs_task_role_arn
  ecs_exec_role_arn  = module.security.ecs_exec_role_arn
  instance_type      = var.instance_type
  container_port     = 8080
  db_host            = module.database.db_endpoint
  db_name            = var.db_name
  db_username        = var.db_username
  db_password        = var.db_password
}
