output "vpc_id" {
  description = "ID of the VPC."
  value       = aws_vpc.main.id
}

output "public_subnet_id" {
  description = "Public subnet ID."
  value       = aws_subnet.public.id
}

output "private_subnet_id" {
  description = "Private subnet ID (first AZ; application instance)."
  value       = aws_subnet.private.id
}

output "private_subnet_ids" {
  description = "Both private subnet IDs (two AZs; use for RDS subnet group)."
  value       = [aws_subnet.private.id, aws_subnet.private_secondary.id]
}

output "nat_gateway_public_ip" {
  description = "Elastic IP for the NAT Gateway."
  value       = aws_eip.nat.public_ip
}
