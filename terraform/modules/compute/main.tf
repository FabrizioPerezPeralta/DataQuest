variable "environment"        { type = string }
variable "vpc_id"             { type = string }
variable "public_subnet_ids"  { type = list(string) }
variable "private_subnet_ids" { type = list(string) }
variable "ecs_sg_id"          { type = string }
variable "ecs_task_role_arn"  { type = string }
variable "ecs_exec_role_arn"  { type = string }
variable "instance_type"      { type = string }
variable "container_port"     { type = number }
variable "db_host"            { type = string }
variable "db_name"            { type = string }
variable "db_username"        { type = string }
variable "db_password"        { type = string }

locals {
  cpu    = split("/", var.instance_type)[0]
  memory = split("/", var.instance_type)[1]
}

data "aws_region" "current" {}

data "aws_security_group" "alb" {
  name = "dataquest-${var.environment}-alb-sg"
}

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/dataquest-${var.environment}"
  retention_in_days = 30
  tags              = { Name = "dataquest-${var.environment}-log-group" }
}

resource "aws_ecs_cluster" "this" {
  name = "dataquest-${var.environment}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = { Name = "dataquest-${var.environment}-ecs-cluster" }
}

resource "aws_ecs_task_definition" "app" {
  family                   = "dataquest-${var.environment}-app"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = local.cpu
  memory                   = local.memory
  execution_role_arn       = var.ecs_exec_role_arn
  task_role_arn            = var.ecs_task_role_arn

  container_definitions = jsonencode([
    {
      name      = "app"
      image     = "${var.environment}-app:latest"
      essential = true
      portMappings = [
        {
          containerPort = var.container_port
          protocol      = "tcp"
        }
      ]
      environment = [
        { name = "SPRING_DATASOURCE_URL", value = "jdbc:mysql://${var.db_host}/${var.db_name}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=utf8mb4" },
        { name = "SPRING_DATASOURCE_USERNAME", value = var.db_username },
        { name = "SPRING_DATASOURCE_PASSWORD", value = var.db_password },
        { name = "SPRING_PROFILES_ACTIVE", value = var.environment }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = { Name = "dataquest-${var.environment}-task-def" }
}

resource "aws_lb" "this" {
  name               = "dataquest-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [data.aws_security_group.alb.id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = var.environment == "prod"

  tags = { Name = "dataquest-${var.environment}-alb" }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.this.arn
  }
}

resource "aws_lb_target_group" "this" {
  name        = "dataquest-${var.environment}-tg"
  port        = var.container_port
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = var.vpc_id

  health_check {
    enabled             = true
    path                = "/api/v1/actuator/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 5
    interval            = 30
    timeout             = 5
  }

  tags = { Name = "dataquest-${var.environment}-tg" }
}

resource "aws_ecs_service" "this" {
  name             = "dataquest-${var.environment}-service"
  cluster          = aws_ecs_cluster.this.id
  task_definition  = aws_ecs_task_definition.app.arn
  desired_count    = 1
  launch_type      = "FARGATE"
  platform_version = "1.4.0"

  network_configuration {
    subnets         = var.private_subnet_ids
    security_groups = [var.ecs_sg_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.this.arn
    container_name   = "app"
    container_port   = var.container_port
  }

  depends_on = [aws_lb_listener.http]

  tags = { Name = "dataquest-${var.environment}-ecs-service" }
}

resource "aws_appautoscaling_target" "ecs" {
  max_capacity       = 3
  min_capacity       = 1
  resource_id        = "service/${aws_ecs_cluster.this.name}/${aws_ecs_service.this.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "cpu" {
  name               = "dataquest-${var.environment}-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}

output "alb_dns_name"     { value = aws_lb.this.dns_name }
output "ecs_cluster_name" { value = aws_ecs_cluster.this.name }
output "target_group_arn" { value = aws_lb_target_group.this.arn }
