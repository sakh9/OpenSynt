import test from 'node:test';
import assert from 'node:assert/strict';
import { buildInvestigationGraph } from './investigationGraph.js';
import { buildTimeline } from './timeline.js';

test('graph deduplicates entities and edges while preserving relationship evidence', () => {
  const evidence = [{ source: 'DNS', description: 'site.test resolves to 192.0.2.1', observedAt: '2026-09-27T00:00:00Z' }];
  const relationships = [
    { type: 'resolves_to', sourceEntity: 'site.test', targetEntity: '192.0.2.1', confidence: 0.95, evidence },
    { type: 'resolves_to', sourceEntity: 'site.test', targetEntity: '192.0.2.1', confidence: 0.95, evidence },
    { type: 'announced_by_asn', sourceEntity: '192.0.2.1', targetEntity: 'AS64500', confidence: 0.8, evidence },
  ];
  const graph = buildInvestigationGraph(relationships, 'site.test', 2);
  assert.equal(graph.entities.length, 3);
  assert.equal(graph.edges.length, 2);
  assert.deepEqual(graph.edges[0].evidence, evidence);
  assert.equal(graph.entities.find((entity) => entity.value === 'AS64500').type, 'asn');
});

test('graph pivot depth is bounded and graph edges only derive from evidenced relationships', () => {
  const relationships = [
    { type: 'resolves_to', sourceEntity: 'site.test', targetEntity: '192.0.2.1', confidence: 0.95, evidence: [{ source: 'DNS' }] },
    { type: 'announced_by_asn', sourceEntity: '192.0.2.1', targetEntity: 'AS64500', confidence: 0.8, evidence: [{ source: 'Geo' }] },
    { type: 'unsubstantiated', sourceEntity: 'site.test', targetEntity: 'bad.test', evidence: [] },
  ];
  assert.equal(buildInvestigationGraph(relationships, 'site.test', 1).edges.length, 1);
  assert.equal(buildInvestigationGraph(relationships, 'site.test', 2).edges.length, 2);
});

const observation = (created_at, dns_data, shodan_data = { ports: [] }) => ({ query: 'site.test', created_at, dns_data, shodan_data, geo_data: {}, abuse_data: {}, whois_data: {} });

test('timeline orders observations, deduplicates repeats, and preserves a single observation', () => {
  const row = observation('2026-09-27T00:00:00Z', { A: ['192.0.2.1'], NS: [] });
  const { events } = buildTimeline([row, row, observation('2026-09-20T00:00:00Z', { A: ['192.0.2.1'], NS: [] })]);
  assert.equal(events.length, 2);
  assert.equal(events[0].timestamp, '2026-09-20T00:00:00Z');
});

test('timeline reports actual DNS, nameserver, and new port changes between stored observations', () => {
  const before = observation('2026-09-20T00:00:00Z', { A: ['192.0.2.1'], NS: ['ns.old.test'] }, { ports: [80] });
  const after = observation('2026-09-27T00:00:00Z', { A: ['192.0.2.2'], NS: ['ns.new.test'] }, { ports: [80, 8080] });
  const { changes } = buildTimeline([before, after]);
  assert.deepEqual(changes.map((change) => change.type).sort(), ['dns_change', 'nameserver_change', 'new_service']);
  assert.equal(changes.find((change) => change.type === 'dns_change').previous[0], '192.0.2.1');
  assert.equal(changes.find((change) => change.type === 'new_service').current[0], '8080');
});

test('timeline keeps missing timestamps unknown and never invents them', () => {
  const { events } = buildTimeline([observation(null, { A: ['192.0.2.1'], NS: [] })]);
  assert.equal(events[0].timestamp, null);
  assert.equal(events[0].evidence[0].observedAt, null);
});
