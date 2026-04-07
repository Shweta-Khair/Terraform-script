module "network" {
  source = "./modules/network"

  vpc_cidr                      = var.vpc_cidr
  public_subnet_cidr            = var.public_subnet_cidr
  private_subnet_cidr           = var.private_subnet_cidr
  private_subnet_cidr_secondary = var.private_subnet_cidr_secondary
  availability_zone             = var.availability_zone
}

module "compute" {
  source = "./modules/compute"

  vpc_id                = module.network.vpc_id
  public_subnet_id      = module.network.public_subnet_id
  private_subnet_id     = module.network.private_subnet_id
  project               = var.project
  key_name              = var.key_name
  allowed_ssh_cidr      = var.allowed_ssh_cidr
  bastion_instance_type = var.bastion_instance_type
  private_instance_type = var.private_instance_type
}

module "database" {
  source = "./modules/rds"

  identifier                 = var.db_identifier
  vpc_id                     = module.network.vpc_id
  subnet_ids                 = module.network.private_subnet_ids
  allowed_security_group_ids = [module.compute.private_app_security_group_id]
  engine                     = var.db_engine
  engine_version             = var.db_engine_version
  instance_class             = var.db_instance_class
  allocated_storage          = var.db_allocated_storage
  max_allocated_storage      = var.db_max_allocated_storage
  db_name                    = var.db_name
  master_username            = var.db_master_username
  database_port              = var.db_port
  skip_final_snapshot        = var.db_skip_final_snapshot
  deletion_protection        = var.db_deletion_protection
  backup_retention_period    = var.db_backup_retention_period
}
