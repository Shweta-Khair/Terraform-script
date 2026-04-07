output "vpc_id" {
  description = "ID of the custom VPC."
  value       = module.network.vpc_id
}

output "public_subnet_id" {
  description = "Public subnet ID (bastion, NAT Gateway)."
  value       = module.network.public_subnet_id
}

output "private_subnet_id" {
  description = "Private subnet ID (application instance)."
  value       = module.network.private_subnet_id
}

output "private_subnet_ids" {
  description = "Private subnet IDs (two AZs; RDS subnet group)."
  value       = module.network.private_subnet_ids
}

output "nat_gateway_public_ip" {
  description = "Elastic IP associated with the NAT Gateway (egress IP for private subnet)."
  value       = module.network.nat_gateway_public_ip
}

output "bastion_public_ip" {
  description = "Public IP of the bastion — SSH here first, then hop to the private instance."
  value       = module.compute.bastion_public_ip
}

output "bastion_security_group_id" {
  description = "Security group ID for the bastion."
  value       = module.compute.bastion_security_group_id
}

output "private_instance_id" {
  description = "EC2 instance ID in the private subnet."
  value       = module.compute.private_instance_id
}

output "private_instance_private_ip" {
  description = "Private IP of the application instance — use from bastion via SSH."
  value       = module.compute.private_instance_private_ip
}

output "amazon_linux_ami_id" {
  description = "Resolved Amazon Linux 2023 AMI used for both instances."
  value       = module.compute.amazon_linux_ami_id
}

output "private_app_security_group_id" {
  description = "Security group on the private EC2 (allowed to reach RDS)."
  value       = module.compute.private_app_security_group_id
}

output "db_instance_endpoint" {
  description = "RDS endpoint (host:port)."
  value       = module.database.db_instance_endpoint
}

output "db_instance_address" {
  description = "RDS hostname."
  value       = module.database.db_instance_address
}

output "db_instance_port" {
  description = "RDS port."
  value       = module.database.db_instance_port
}

output "db_security_group_id" {
  description = "Security group for RDS."
  value       = module.database.db_security_group_id
}

output "db_master_user_secret_arn" {
  description = "Secrets Manager ARN for the RDS master password."
  value       = module.database.master_user_secret_arn
  sensitive   = true
}
