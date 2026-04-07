# rds

Amazon RDS in private subnets: DB subnet group (two AZs), security group allowing ingress only from listed client security groups, and a single `aws_db_instance` with **RDS-managed master password** (Secrets Manager).

**Engines:** Defaults to PostgreSQL; set `engine` / `engine_version` / `database_port` for MySQL if needed.

**Inputs / outputs:** `variables.tf`, `outputs.tf`. Root passes `subnet_ids` from `module.network.private_subnet_ids` and `allowed_security_group_ids` from `module.compute.private_app_security_group_id`.
