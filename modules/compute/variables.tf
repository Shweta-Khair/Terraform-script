variable "vpc_id" {
  description = "VPC ID for security groups and instances."
  type        = string
}

variable "public_subnet_id" {
  description = "Public subnet for the bastion."
  type        = string
}

variable "private_subnet_id" {
  description = "Private subnet for the application instance."
  type        = string
}

variable "project" {
  description = "Prefix for security group names (unique per account/region)."
  type        = string
}

variable "key_name" {
  description = "EC2 Key Pair name for SSH."
  type        = string
}

variable "allowed_ssh_cidr" {
  description = "IPv4 CIDR allowed to SSH to the bastion."
  type        = string
}

variable "bastion_instance_type" {
  description = "Instance type for the bastion."
  type        = string
}

variable "private_instance_type" {
  description = "Instance type for the private workload."
  type        = string
}
