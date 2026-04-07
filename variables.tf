variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name used in default_tags."
  type        = string
  default     = "dev"
}

variable "project" {
  description = "Project name used in default_tags."
  type        = string
  default     = "vpc-private-stack"
}

variable "owner" {
  description = "Owner or team used in default_tags."
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR for the public subnet (NAT, bastion)."
  type        = string
  default     = "10.0.1.0/24"
}

variable "private_subnet_cidr" {
  description = "CIDR for the private subnet (application instance)."
  type        = string
  default     = "10.0.2.0/24"
}

variable "availability_zone" {
  description = "AZ for subnets and NAT Gateway. Leave null to use the first available AZ in the region."
  type        = string
  default     = null
}

variable "key_name" {
  description = "Name of an existing EC2 Key Pair for SSH (bastion and private instance)."
  type        = string
}

variable "allowed_ssh_cidr" {
  description = "IPv4 CIDR allowed to SSH to the bastion (full address + prefix, e.g. 203.0.113.10/32 for one public IP)."
  type        = string

  validation {
    condition     = can(cidrhost(var.allowed_ssh_cidr, 0))
    error_message = "allowed_ssh_cidr must be a valid IPv4 CIDR (e.g. 203.0.113.10/32). A suffix alone such as \"/32\" is invalid."
  }
}

variable "bastion_instance_type" {
  description = "Instance type for the bastion host."
  type        = string
  default     = "t3.micro"
}

variable "private_instance_type" {
  description = "Instance type for the private subnet workload."
  type        = string
  default     = "t3.micro"
}
