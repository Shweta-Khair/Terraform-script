output "db_instance_id" {
  description = "RDS instance ID."
  value       = aws_db_instance.main.id
}

output "db_instance_endpoint" {
  description = "Connection endpoint (hostname:port)."
  value       = aws_db_instance.main.endpoint
}

output "db_instance_address" {
  description = "Hostname of the RDS instance."
  value       = aws_db_instance.main.address
}

output "db_instance_port" {
  description = "Database port."
  value       = aws_db_instance.main.port
}

output "db_security_group_id" {
  description = "Security group attached to RDS."
  value       = aws_security_group.rds.id
}

output "master_user_secret_arn" {
  description = "Secrets Manager secret ARN for the master password (when manage_master_user_password is true)."
  value       = try(aws_db_instance.main.master_user_secret[0].secret_arn, null)
  sensitive   = true
}
