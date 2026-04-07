config {
  module = true
}

plugin "aws" {
  source  = "terraform-linters/tflint-ruleset-aws"
  version = "0.31.0"
}
