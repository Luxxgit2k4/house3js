package devsecops.ci

default allow := true

deny[msg] {
  some i
  result := input.trivy.Results[i]
  some j
  vuln := result.Vulnerabilities[j]
  vuln.Severity == "CRITICAL"
  msg := sprintf("Trivy critical vulnerability found: %s in %s", [vuln.VulnerabilityID, result.Target])
}

deny[msg] {
  some i
  result := input.trivy.Results[i]
  some j
  vuln := result.Vulnerabilities[j]
  vuln.Severity == "HIGH"
  msg := sprintf("Trivy high vulnerability found: %s in %s", [vuln.VulnerabilityID, result.Target])
}

deny[msg] {
  some i
  finding := input.semgrep.results[i]
  finding.extra.severity == "ERROR"
  msg := sprintf("Semgrep ERROR finding: %s in %s", [finding.check_id, finding.path])
}

allow := false {
  count(deny) > 0
}
