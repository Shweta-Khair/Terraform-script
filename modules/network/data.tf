data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  az = coalesce(var.availability_zone, data.aws_availability_zones.available.names[0])
  # Second AZ for RDS subnet group (AWS requires subnets in two AZs).
  az_secondary = [
    for z in data.aws_availability_zones.available.names : z if z != local.az
  ][0]
}
