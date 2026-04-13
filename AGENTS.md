# AGENTS.md

## Cursor Cloud specific instructions

This is an **AWS Terraform IaC project** (not a running application). It provisions a VPC with bastion/private-instance architecture.

### Tools and versions

- **Terraform** >= 1.5.0 (lock file pins AWS provider v6.39.0)
- **tflint** v0.53.0 with AWS ruleset v0.31.0

### Compliance commands (lint / validate)

Per the README:

```bash
terraform fmt -check -recursive
terraform init -backend=false
terraform validate
tflint --init && tflint --recursive
```

### Known issue: `.tflint.hcl` missing `enabled = true`

The repo's `.tflint.hcl` plugin block is missing the required `enabled = true` attribute. tflint will fail to load the config without it. Workaround: use a fixed config:

```bash
cat > /tmp/tflint_fixed.hcl << 'EOF'
config {
  module = true
}

plugin "aws" {
  enabled = true
  source  = "github.com/terraform-linters/tflint-ruleset-aws"
  version = "0.31.0"
}
EOF
tflint --config /tmp/tflint_fixed.hcl --init
tflint --config /tmp/tflint_fixed.hcl --recursive
```

### `terraform plan` / `apply`

Requires valid AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, or an AWS profile) and the variables `owner`, `key_name`, and `allowed_ssh_cidr`. Without AWS credentials, `terraform plan` will fail with an STS auth error — this is expected.
