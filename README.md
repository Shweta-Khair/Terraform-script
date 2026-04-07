# vpc-private-stack

Root stack that composes **`module.network`** (VPC, subnets, IGW, NAT, routes) and **`module.compute`** (security groups, bastion, private EC2). Provider and variables live at the root; child modules declare `required_providers` only.

## Layout (module structure)

| Path | Contents |
|------|----------|
| Root | `versions.tf`, `providers.tf`, `variables.tf`, `outputs.tf`, `main.tf` |
| `modules/network` | `versions.tf`, `variables.tf`, `data.tf`, `main.tf`, `outputs.tf`, `README.md` |
| `modules/compute` | `versions.tf`, `variables.tf`, `data.tf`, `main.tf`, `outputs.tf`, `README.md` |

## Quick start

```bash
cd vpc-private-stack
cp terraform.tfvars.example terraform.tfvars
# Set owner, key_name, allowed_ssh_cidr (full IPv4 CIDR, e.g. 203.0.113.10/32)

terraform init
terraform plan
```

SSH via bastion to the private instance:

```bash
ssh -J ec2-user@<bastion_public_ip> ec2-user@<private_instance_private_ip>
```

## State

Default is **local** `terraform.tfstate`. Do not commit state. For teams, add a remote backend (e.g. S3 + DynamoDB lock) in `backend.tf` or the root `terraform` block.

## Refactor / state migration

If you applied an older **flat** layout, resource addresses changed to `module.network.*` / `module.compute.*`. Either destroy and re-apply, or use `terraform state mv` for each resource.

## Compliance (fmt / validate / lint)

```bash
terraform fmt -check -recursive
terraform init -backend=false
terraform validate
tflint --init && tflint --recursive
```

See root `terraform.tfvars.example` for variables; outputs are defined in `outputs.tf`.
