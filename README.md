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

## CI/CD Pipeline

This project includes GitHub Actions workflows for automated Terraform operations.

### Workflows

| Workflow | Trigger | Description |
|----------|---------|-------------|
| `terraform-ci.yml` | PR / Push to main/master | Format, validate, lint, security scan, and plan |
| `terraform-deploy.yml` | Manual dispatch | Deploy infrastructure to specific environments |
| `terraform-drift.yml` | Daily schedule / Manual | Detect infrastructure drift |

### Required Secrets

Configure the following secrets in your GitHub repository settings:

| Secret | Description | Required |
|--------|-------------|----------|
| `AWS_ACCESS_KEY_ID` | AWS access key for authentication | Yes |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for authentication | Yes |
| `TF_VAR_KEY_NAME` | EC2 key pair name | Yes |
| `TF_VAR_ALLOWED_SSH_CIDR` | CIDR for SSH access (e.g., `203.0.113.10/32`) | Yes |

### CI Pipeline Flow

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│   Format    │───▶│   Validate   │───▶│    Lint     │───▶│   Security   │
│   Check     │    │              │    │   (TFLint)  │    │   (Checkov)  │
└─────────────┘    └──────────────┘    └─────────────┘    └──────────────┘
                                                                  │
                                                                  ▼
                                                          ┌──────────────┐
                                                          │    Plan      │
                                                          │  (PR only)   │
                                                          └──────────────┘
```

### Manual Deployment

1. Go to **Actions** → **Terraform Deploy**
2. Click **Run workflow**
3. Select environment (`dev`, `staging`, `prod`)
4. Choose action (`plan`, `apply`, `destroy`)
5. Enable auto-approve if needed (required for apply/destroy)

### Drift Detection

The drift detection workflow:
- Runs daily at 6 AM UTC
- Can be triggered manually for any environment
- Creates GitHub issues when drift is detected
- Updates existing issues if drift persists
