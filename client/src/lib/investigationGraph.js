export const DEFAULT_PIVOT_DEPTH = 1;

function entityType(value, relationshipType, endpoint) {
  if (/^AS\d+$/i.test(value)) return 'asn';
  if (/^[\da-f:.]+$/i.test(value) && (value.includes('.') || value.includes(':'))) return 'ip';
  if (endpoint === 'target' && relationshipType.includes('nameserver')) return 'nameserver';
  return 'domain';
}

export function buildInvestigationGraph(relationships = [], rootValue, maxDepth = DEFAULT_PIVOT_DEPTH) {
  const entities = new Map();
  const edges = new Map();
  const addEntity = (value, rel, endpoint) => {
    const type = entityType(value, rel.type, endpoint);
    const id = `${type}:${value.toLowerCase()}`;
    if (!entities.has(id)) entities.set(id, { id, type, value });
    return id;
  };
  const root = rootValue ? [...relationships].flatMap((rel) => [rel.sourceEntity, rel.targetEntity]).find((value) => value?.toLowerCase() === rootValue.toLowerCase()) : null;
  const allowed = new Set(root ? [root.toLowerCase()] : []);
  if (root) {
    let frontier = [root.toLowerCase()];
    for (let depth = 0; depth < maxDepth; depth += 1) {
      const next = [];
      for (const rel of relationships) {
        const a = rel.sourceEntity?.toLowerCase(); const b = rel.targetEntity?.toLowerCase();
        if (frontier.includes(a) && !allowed.has(b)) { allowed.add(b); next.push(b); }
        if (frontier.includes(b) && !allowed.has(a)) { allowed.add(a); next.push(a); }
      }
      frontier = next;
    }
  }
  for (const rel of relationships) {
    if (!rel.sourceEntity || !rel.targetEntity || !rel.evidence?.length) continue;
    if (root && (!allowed.has(rel.sourceEntity.toLowerCase()) || !allowed.has(rel.targetEntity.toLowerCase()))) continue;
    const source = addEntity(rel.sourceEntity, rel, 'source');
    const target = addEntity(rel.targetEntity, rel, 'target');
    const key = `${rel.type}:${source}:${target}`;
    if (!edges.has(key)) edges.set(key, { source, target, type: rel.type, confidence: rel.confidence, evidence: rel.evidence });
  }
  return { entities: [...entities.values()], edges: [...edges.values()] };
}
