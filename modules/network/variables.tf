variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
}

variable "public_subnet_cidr" {
  description = "CIDR for the public subnet (NAT, bastion)."
  type        = string
}

variable "private_subnet_cidr" {
  description = "CIDR for the private subnet (application instance)."
  type        = string
}

variable "availability_zone" {
  description = "AZ for subnets and NAT Gateway. Null uses the first available AZ in the region."
  type        = string
  default     = null
}
