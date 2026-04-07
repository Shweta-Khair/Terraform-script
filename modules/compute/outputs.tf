output "bastion_public_ip" {
  description = "Public IP of the bastion host."
  value       = aws_instance.bastion.public_ip
}

output "bastion_security_group_id" {
  description = "Security group ID for the bastion."
  value       = aws_security_group.bastion.id
}

output "private_instance_id" {
  description = "EC2 instance ID in the private subnet."
  value       = aws_instance.private.id
}

output "private_instance_private_ip" {
  description = "Private IP of the application instance."
  value       = aws_instance.private.private_ip
}

output "amazon_linux_ami_id" {
  description = "Resolved Amazon Linux 2023 AMI."
  value       = data.aws_ami.amazon_linux.id
}

output "private_app_security_group_id" {
  description = "Security group for the private EC2 instance (allow RDS ingress from here)."
  value       = aws_security_group.private_app.id
}
