function buildRelationships(data, otherDomains = []) {
  const relationships = [];
  const observedAt = data.created_at || new Date().toISOString();
  const query = data.query;
  const dns = data.dns_data;
  if (data.query_type === 'domain' && dns && !dns.error && !dns.skipped && !Array.isArray(dns.ptr)) {
    for (const ip of [...(dns.A || []), ...(dns.AAAA || [])]) {
      relationships.push({ type: 'resolves_to', sourceEntity: query, targetEntity: ip, confidence: 0.95, evidence: [{ source: 'DNS', description: `${query} resolves to ${ip}`, observedAt }] });
      for (const other of otherDomains) {
        if (other.query !== query && [...(other.dns_data?.A || []), ...(other.dns_data?.AAAA || [])].includes(ip)) {
          relationships.push({ type: 'shared_ip', sourceEntity: query, targetEntity: other.query, confidence: 0.85, evidence: [{ source: 'DNS', description: `Both ${query} and ${other.query} resolve to ${ip}`, observedAt: other.created_at || observedAt }] });
        }
      }
    }
    for (const nameserver of dns.NS || []) {
      relationships.push({ type: 'uses_nameserver', sourceEntity: query, targetEntity: nameserver, confidence: 0.95, evidence: [{ source: 'DNS', description: `${query} delegates to nameserver ${nameserver}`, observedAt }] });
      for (const other of otherDomains) {
        if (other.query !== query && (other.dns_data?.NS || []).some((ns) => ns.toLowerCase() === nameserver.toLowerCase())) {
          relationships.push({ type: 'shared_nameserver', sourceEntity: query, targetEntity: other.query, confidence: 0.75, evidence: [{ source: 'DNS', description: `Both ${query} and ${other.query} use nameserver ${nameserver}`, observedAt: other.created_at || observedAt }] });
        }
      }
    }
  }
  const ip = data.query_type === 'ip' ? query : data.geo_data?.resolvedIp;
  const asn = data.geo_data?.asn || data.geo_data?.as;
  if (ip && asn) relationships.push({ type: 'announced_by_asn', sourceEntity: ip, targetEntity: String(asn).startsWith('AS') ? String(asn) : `AS${asn}`, confidence: 0.8, evidence: [{ source: 'Geolocation provider', description: `${ip} is associated with ASN ${asn} in the geolocation response`, observedAt }] });
  return relationships;
}

module.exports = { buildRelationships };
