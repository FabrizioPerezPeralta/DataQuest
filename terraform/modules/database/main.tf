variable "environment"        { type = string }
variable "vpc_id"             { type = string }
variable "private_subnet_ids" { type = list(string) }
variable "ecs_sg_id"          { type = string }
variable "db_instance_class"  { type = string }
variable "multi_az"           { type = bool }
variable "db_name"            { type = string }
variable "db_username"        { type = string }
variable "db_password"        { type = string }

resource "aws_db_subnet_group" "this" {
  name       = "dataquest-${var.environment}-db-subnet-group"
  subnet_ids = var.private_subnet_ids
  tags       = { Name = "dataquest-${var.environment}-db-subnet-group" }
}

resource "aws_db_parameter_group" "this" {
  name        = "dataquest-${var.environment}-mysql8-params"
  family      = "mysql8.0"
  description = "MySQL 8.0 parameter group with utf8mb4 charset"

  parameter {
    name  = "character_set_server"
    value = "utf8mb4"
  }
  parameter {
    name  = "collation_server"
    value = "utf8mb4_unicode_ci"
  }
}

resource "aws_security_group" "rds" {
  name        = "dataquest-${var.environment}-rds-sg"
  description = "RDS MySQL security group"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [var.ecs_sg_id]
  }

  tags = { Name = "dataquest-${var.environment}-rds-sg" }
}

locals {
  backup_retention = var.environment == "prod" ? 30 : 7
}

resource "aws_db_instance" "this" {
  identifier             = "dataquest-${var.environment}"
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = var.db_instance_class
  allocated_storage      = 20
  storage_type           = "gp3"
  db_name                = var.db_name
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.this.name

  backup_retention_period = local.backup_retention
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"
  multi_az                = var.multi_az

  skip_final_snapshot       = var.environment != "prod"
  final_snapshot_identifier = "dataquest-${var.environment}-final-snapshot"
  deletion_protection       = var.environment == "prod"

  tags = { Name = "dataquest-${var.environment}-rds" }
}

output "db_endpoint" { value = aws_db_instance.this.endpoint }
output "db_address"  { value = aws_db_instance.this.address }
output "db_port"     { value = aws_db_instance.this.port }
