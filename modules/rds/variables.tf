variable "identifier" {
  description = "RDS instance identifier (lowercase, unique in region)."
  type        = string

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{0,62}$", var.identifier))
    error_message = "identifier must start with a letter, contain only lowercase letters, numbers, hyphens, and be at most 63 characters."
  }
}

variable "vpc_id" {
  description = "VPC for the RDS security group."
  type        = string
}

variable "subnet_ids" {
  description = "Private subnet IDs for the DB subnet group (at least two AZs)."
  type        = list(string)

  validation {
    condition     = length(var.subnet_ids) >= 2
    error_message = "Provide at least two subnet IDs in different AZs for the DB subnet group."
  }
}

variable "allowed_security_group_ids" {
  description = "Security groups allowed to connect to the database (e.g. private app SG)."
  type        = list(string)
}

variable "engine" {
  description = "Database engine (e.g. postgres, mysql)."
  type        = string
  default     = "postgres"
}

variable "engine_version" {
  description = "Engine version (e.g. 16 for PostgreSQL)."
  type        = string
  default     = "16"
}

variable "instance_class" {
  description = "RDS instance class."
  type        = string
  default     = "db.t4g.micro"
}

variable "allocated_storage" {
  description = "Allocated storage in GB."
  type        = number
  default     = 20
}

variable "max_allocated_storage" {
  description = "Max storage for autoscaling (0 disables autoscaling)."
  type        = number
  default     = 0
}

variable "db_name" {
  description = "Initial database name (PostgreSQL)."
  type        = string
  default     = "appdb"
}

variable "master_username" {
  description = "Master username. Password is managed by RDS in Secrets Manager when manage_master_user_password is true."
  type        = string
  default     = "dbadmin"
}

variable "database_port" {
  description = "Database port (5432 PostgreSQL, 3306 MySQL)."
  type        = number
  default     = 5432
}

variable "skip_final_snapshot" {
  description = "If true, no final snapshot on destroy (use for dev only)."
  type        = bool
  default     = true
}

variable "deletion_protection" {
  description = "Enable deletion protection on the instance."
  type        = bool
  default     = false
}

variable "backup_retention_period" {
  description = "Backup retention in days (0 disables automated backups)."
  type        = number
  default     = 1
}
