module "network" {
  source = "./modules/network"

  vpc_cidr            = var.vpc_cidr
  public_subnet_cidr  = var.public_subnet_cidr
  private_subnet_cidr = var.private_subnet_cidr
  availability_zone   = var.availability_zone
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
