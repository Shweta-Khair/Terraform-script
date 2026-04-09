config {
  module = true
}

plugin "aws" {
  enabled = true
  source  = "terraform-linters/tflint-ruleset-aws"
  version = "0.31.0"
}
