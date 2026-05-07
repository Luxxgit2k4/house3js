package devsecops.image

default allow := true

deny contains msg if {
  some i
  result := input.Results[i]
  some j
  vuln := result.Vulnerabilities[j]
  vuln.Severity == "CRITICAL"
  msg := sprintf("Image critical vulnerability found: %s in %s", [vuln.VulnerabilityID, result.Target])
}

deny contains msg if {
  some i
  result := input.Results[i]
  some j
  vuln := result.Vulnerabilities[j]
  vuln.Severity == "HIGH"
  msg := sprintf("Image high vulnerability found: %s in %s", [vuln.VulnerabilityID, result.Target])
}

allow := false if {
  count(deny) > 0
}
