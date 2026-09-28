import { useMemo, useState } from 'react';
import { buildInvestigationGraph } from '../../lib/investigationGraph';

const WIDTH = 900; const HEIGHT = 360;

export default function InvestigationGraph({ relationships, rootValue, onPivot }) {
  const graph = useMemo(() => buildInvestigationGraph(relationships, rootValue), [relationships, rootValue]);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const [drag, setDrag] = useState(null);
  const positions = useMemo(() => {
    const centerX = WIDTH / 2; const centerY = HEIGHT / 2;
    return new Map(graph.entities.map((entity, index) => {
      const angle = (2 * Math.PI * index / Math.max(graph.entities.length, 1)) - Math.PI / 2;
      const radius = graph.entities.length <= 2 ? 0 : Math.min(140, 55 + graph.entities.length * 13);
      return [entity.id, { x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius }];
    }));
  }, [graph.entities]);
  const connected = new Set(selectedEntity ? graph.edges.filter((edge) => edge.source === selectedEntity.id || edge.target === selectedEntity.id).flatMap((edge) => [edge.source, edge.target]) : []);
  const onWheel = (event) => { event.preventDefault(); setView((current) => ({ ...current, scale: Math.max(0.65, Math.min(2.2, current.scale * (event.deltaY < 0 ? 1.1 : 0.9))) })); };
  const onPointerDown = (event) => { if (event.target.tagName === 'svg' || event.target.tagName === 'rect') setDrag({ x: event.clientX - view.x, y: event.clientY - view.y }); };
  const onPointerMove = (event) => { if (drag) setView((current) => ({ ...current, x: event.clientX - drag.x, y: event.clientY - drag.y })); };
  const selectEntity = (entity) => { setSelectedEntity(entity); setSelectedEdge(null); };

  return <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_260px] gap-4">
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40" onWheel={onWheel} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={() => setDrag(null)} onPointerLeave={() => setDrag(null)}>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full min-h-[280px] touch-none cursor-grab" role="img" aria-label="Investigation graph. Use the mouse wheel to zoom and drag the background to pan.">
        <g transform={`translate(${view.x} ${view.y}) scale(${view.scale})`}>
          {graph.edges.map((edge, index) => { const a = positions.get(edge.source); const b = positions.get(edge.target); const active = selectedEdge === edge; return <g key={`${edge.type}-${index}`} onClick={() => { setSelectedEdge(edge); setSelectedEntity(null); }} className="cursor-pointer">
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={active ? '#b7d8a4' : '#59645c'} strokeWidth={active ? 3 : 1.5} />
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth="14" />
            <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 7} textAnchor="middle" fill="#94a3b8" fontSize="10">{edge.type.replaceAll('_', ' ')}</text>
          </g>; })}
          {graph.entities.map((entity) => { const p = positions.get(entity.id); const isRoot = entity.value.toLowerCase() === rootValue?.toLowerCase(); const active = selectedEntity?.id === entity.id; return <g key={entity.id} transform={`translate(${p.x} ${p.y})`} onClick={() => selectEntity(entity)} className="cursor-pointer">
            <circle r="25" fill={active || isRoot ? '#344432' : '#0f172a'} stroke={active ? '#b7d8a4' : connected.has(entity.id) ? '#91b67c' : '#334155'} strokeWidth="2" />
            <text y="4" textAnchor="middle" fill="#c3d5b9" fontSize="9" fontWeight="700">{entity.type.toUpperCase()}</text>
            <text y="43" textAnchor="middle" fill="#e2e8f0" fontSize="11">{entity.value.length > 26 ? `${entity.value.slice(0, 23)}…` : entity.value}</text>
          </g>; })}
        </g>
      </svg>
      <div className="flex justify-end gap-2 p-2 border-t border-slate-800"><button type="button" onClick={() => setView({ x: 0, y: 0, scale: 1 })} className="text-xs text-slate-400 hover:text-cyan-300">Reset view</button><button type="button" onClick={() => setView((v) => ({ ...v, scale: Math.min(2.2, v.scale * 1.2) }))} className="text-xs text-slate-400 hover:text-cyan-300">Zoom +</button><button type="button" onClick={() => setView((v) => ({ ...v, scale: Math.max(0.65, v.scale / 1.2) }))} className="text-xs text-slate-400 hover:text-cyan-300">Zoom −</button></div>
    </div>
    <aside className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-sm">
      {selectedEdge ? <><p className="text-xs uppercase tracking-wider text-cyan-300">Relationship</p><p className="font-mono text-slate-100 mt-2 break-all">{graph.entities.find((e) => e.id === selectedEdge.source)?.value} → {graph.entities.find((e) => e.id === selectedEdge.target)?.value}</p><p className="text-slate-400 mt-2">Type: {selectedEdge.type}</p><p className="text-slate-400">Confidence: {(selectedEdge.confidence * 100).toFixed(0)}%</p><h3 className="text-xs text-slate-300 mt-4 mb-2">Evidence</h3>{selectedEdge.evidence.map((item, index) => <p key={index} className="text-xs text-slate-400 mb-2">{item.source}: {item.description}<br />Observed: {item.observedAt ? new Date(item.observedAt).toLocaleString() : 'Timestamp unavailable'}</p>)}</>
        : selectedEntity ? <><p className="text-xs uppercase tracking-wider text-cyan-300">{selectedEntity.type}</p><p className="font-mono text-slate-100 mt-2 break-all">{selectedEntity.value}</p><p className="text-xs text-slate-400 mt-3">Related entities</p><ul className="text-xs text-slate-300 mt-1">{graph.edges.filter((edge) => edge.source === selectedEntity.id || edge.target === selectedEntity.id).map((edge, index) => <li key={index}>• {graph.entities.find((e) => e.id === (edge.source === selectedEntity.id ? edge.target : edge.source))?.value}</li>)}</ul>{/^(?:[\da-f:.]+|[a-z\d-]+(?:\.[a-z\d-]+)+)$/i.test(selectedEntity.value) && <button type="button" onClick={() => onPivot?.(selectedEntity.value)} className="mt-4 px-3 py-2 rounded-lg bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-xs hover:bg-cyan-900">Investigate this entity</button>}</>
        : <p className="text-xs text-slate-400">Select a node or edge to inspect its relationships and evidence.</p>}
      <p className="text-[10px] text-slate-600 mt-4">Connections show observed infrastructure relationships and do not establish ownership.</p>
    </aside>
  </div>;
}
