const usable = (value) => value && !value.error && !value.skipped;

function evidence(source, type, value, description, observedAt) {
  return { source, type, value, description, observedAt };
}

export function buildFindings(data) {
  if (!data) return [];
  const observedAt = data.created_at || new Date().toISOString();
  const findings = [];
  const add = (finding) => findings.push({
    id: `${finding.category}-${findings.length + 1}`,
    confidence: 0.9,
    ...finding,
    evidence: finding.evidence.map((item) => ({ ...item, observedAt: item.observedAt || observedAt })),
  });
  const abuse = data.abuse_data;
  if (usable(abuse) && Number.isFinite(Number(abuse.abuseConfidenceScore)) && abuse.abuseConfidenceScore != null) {
    const score = Number(abuse.abuseConfidenceScore);
    const reports = Number(abuse.totalReports);
    const severity = score >= 75 ? 'HIGH' : score >= 25 ? 'MEDIUM' : 'INFO';
    add({
      title: score >= 75 ? 'High abuse reputation' : score >= 25 ? 'Abuse reports recorded' : 'Low AbuseIPDB confidence score',
      category: 'reputation', severity, confidence: 0.95,
      summary: `AbuseIPDB reports an abuse confidence score of ${score}. This is an assessment from AbuseIPDB, not an independent determination of activity.`,
      evidence: [
        evidence('AbuseIPDB', 'score', score, 'Abuse confidence score'),
        ...(Number.isFinite(reports) ? [evidence('AbuseIPDB', 'count', reports, 'Total reports')] : []),
        ...(abuse.lastReportedAt ? [evidence('AbuseIPDB', 'date', abuse.lastReportedAt, 'Last reported date', abuse.lastReportedAt)] : []),
      ],
      limitations: 'This score does not independently prove malicious activity. AbuseIPDB data may be incomplete or reflect reports of varying quality.',
    });
  }

  const dns = data.dns_data;
  if (usable(dns) && !Array.isArray(dns.ptr)) {
    const addresses = [...(dns.A || []), ...(dns.AAAA || [])];
    if (addresses.length) add({ title: 'DNS address records observed', category: 'dns', severity: 'INFO', summary: `${data.query} has ${addresses.length} address record${addresses.length === 1 ? '' : 's'} in the DNS response.`, evidence: addresses.map((value) => evidence('DNS', 'address', value, 'Resolved address')), limitations: 'DNS records can change and do not establish who controls or operates the resolved address.' });
    if (dns.NS?.length) add({ title: 'Nameservers observed', category: 'dns', severity: 'INFO', summary: `DNS returned ${dns.NS.length} nameserver record${dns.NS.length === 1 ? '' : 's'}.`, evidence: dns.NS.map((value) => evidence('DNS', 'nameserver', value, 'Nameserver record')), limitations: 'Nameserver records describe DNS delegation and do not establish ownership or malicious activity.' });
  }
  if (usable(data.whois_data)) {
    const whois = data.whois_data;
    const facts = [['name', whois.name, 'Registered name'], ['registrar', whois.registrar, 'Registrar'], ['handle', whois.handle, 'RDAP handle']].filter(([, value]) => value);
    if (facts.length) add({ title: 'Registration information observed', category: 'registration', severity: 'INFO', summary: 'RDAP/registration data contains the following fields.', evidence: facts.map(([type, value, description]) => evidence('RDAP', type, value, description)), limitations: 'Registration fields may be redacted, stale, or refer to a registry object; they do not by themselves prove domain ownership or control.' });
  }
  const shodan = data.shodan_data;
  if (usable(shodan) && shodan.ports?.length) add({ title: 'Internet-exposed ports observed', category: 'exposure', severity: 'INFO', summary: `Shodan InternetDB lists ${shodan.ports.length} exposed port${shodan.ports.length === 1 ? '' : 's'}. Open ports indicate reachable services, not vulnerabilities.`, evidence: shodan.ports.map((value) => evidence('Shodan InternetDB', 'port', value, 'Port listed as open')), limitations: 'InternetDB observations may be stale or incomplete. An open port is not evidence of a vulnerability.' });
  return findings;
}
