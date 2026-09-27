const valid = (value) => value && !value.error && !value.skipped;

export function buildTimeline(observations = []) {
  const events = [];
  const ordered = [...observations].sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
  const add = (observation, entity, type, source, description, evidence) => events.push({
    timestamp: observation.created_at || null, entity, type, source, description,
    evidence: [{ source, description: evidence, observedAt: observation.created_at || null }],
  });
  for (const row of ordered) {
    const dns = row.dns_data;
    if (valid(dns) && !Array.isArray(dns.ptr)) {
      for (const ip of [...(dns.A || []), ...(dns.AAAA || [])]) add(row, ip, 'ip_observation', 'DNS', `${row.query} → ${ip}`, `DNS address record for ${row.query}: ${ip}`);
      for (const ns of dns.NS || []) add(row, ns, 'nameserver_observation', 'DNS', `${row.query} uses ${ns}`, `DNS nameserver record for ${row.query}: ${ns}`);
    }
    const asn = row.geo_data?.asn;
    if (valid(row.geo_data) && asn) add(row, row.geo_data.resolvedIp || row.query, 'asn_observation', 'Geolocation provider', `Associated ASN: ${asn}`, `${row.geo_data.resolvedIp || row.query} associated with ${asn}`);
    if (valid(row.abuse_data) && row.abuse_data.abuseConfidenceScore != null) add(row, row.query, 'abuse_observation', 'AbuseIPDB', `Abuse confidence ${row.abuse_data.abuseConfidenceScore}%${row.abuse_data.totalReports != null ? `; ${row.abuse_data.totalReports} reports` : ''}`, `AbuseIPDB confidence score ${row.abuse_data.abuseConfidenceScore}`);
    if (valid(row.shodan_data) && row.shodan_data.ports?.length) add(row, row.shodan_data.ip || row.geo_data?.resolvedIp || row.query, 'port_observation', 'Shodan InternetDB', `Ports ${row.shodan_data.ports.join(', ')} observed`, `Shodan InternetDB listed ports ${row.shodan_data.ports.join(', ')}`);
    if (valid(row.whois_data) && (row.whois_data.name || row.whois_data.handle)) add(row, row.query, 'registration_observation', 'RDAP', 'Registration information observed', `RDAP returned registration fields for ${row.query}`);
  }
  const unique = new Map();
  for (const event of events) {
    const key = `${event.timestamp}|${event.entity}|${event.type}|${event.description}`;
    if (!unique.has(key)) unique.set(key, event);
  }
  const result = [...unique.values()].sort((a, b) => {
    if (!a.timestamp) return b.timestamp ? 1 : 0;
    if (!b.timestamp) return -1;
    return new Date(a.timestamp) - new Date(b.timestamp);
  });
  const changes = [];
  for (let index = 1; index < ordered.length; index += 1) {
    const previous = ordered[index - 1]; const current = ordered[index];
    const compare = (key, type, source, noun) => {
      if (!valid(previous.dns_data) || !valid(current.dns_data)) return;
      const before = [...(previous.dns_data?.[key] || [])].sort(); const after = [...(current.dns_data?.[key] || [])].sort();
      if (JSON.stringify(before) !== JSON.stringify(after) && (before.length || after.length)) changes.push({ timestamp: current.created_at || null, entity: current.query, type, source, description: `${noun} changed: ${before.join(', ') || 'none'} → ${after.join(', ') || 'none'}`, evidence: [
        { source, description: `Previous observation: ${before.join(', ') || 'none'}`, observedAt: previous.created_at || null },
        { source, description: `Current observation: ${after.join(', ') || 'none'}`, observedAt: current.created_at || null },
      ], previous: before, current: after });
    };
    compare('A', 'dns_change', 'DNS', 'DNS address records');
    compare('NS', 'nameserver_change', 'DNS', 'Nameservers');
    if (valid(previous.shodan_data) && valid(current.shodan_data)) {
      const beforePorts = [...(previous.shodan_data.ports || [])].map(String).sort(); const afterPorts = [...(current.shodan_data.ports || [])].map(String).sort();
      for (const port of afterPorts.filter((value) => !beforePorts.includes(value))) changes.push({ timestamp: current.created_at || null, entity: current.query, type: 'new_service', source: 'Shodan InternetDB', description: `New exposed port ${port} observed`, evidence: [{ source: 'Shodan InternetDB', description: `Port ${port} present in current observation`, observedAt: current.created_at || null }], previous: beforePorts, current: [port] });
    }
  }
  return { events: result, changes };
}
