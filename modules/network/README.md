# network

VPC, one **public** subnet, **two private** subnets (different AZs; shared private route table via NAT), Internet Gateway, NAT Gateway, and route tables. The second private subnet supports RDS DB subnet groups.

**Inputs / outputs:** `variables.tf`, `outputs.tf`. Consumed by the root stack as `module.network`.
