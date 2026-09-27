import { useMemo } from 'react';
import { buildTimeline } from '../../lib/timeline';

export default function InfrastructureTimeline({ observations }) {
  const { events, changes } = useMemo(() => buildTimeline(observations), [observations]);
  const all = [...events, ...changes].sort((a, b) => {
    if (!a.timestamp) return b.timestamp ? 1 : 0;
    if (!b.timestamp) return -1;
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
  const dated = events.filter((event) => event.timestamp);
  const first = dated[0]?.timestamp; const last = dated[dated.length - 1]?.timestamp;
  const format = (value) => value ? new Date(value).toLocaleString() : 'Timestamp unavailable';
  return <div className="space-y-4">
    {first && <p className="text-xs text-slate-400">First observed by OpenSynt: {format(first)} <span className="mx-2 text-slate-700">·</span> Last observed by OpenSynt: {format(last)}</p>}
    {all.length ? <ol className="border-l border-slate-700 ml-2 space-y-4">{all.map((event, index) => <li key={`${event.type}-${event.timestamp}-${event.description}-${index}`} className="relative pl-5">
      <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-cyan-400" />
      <p className="text-xs text-slate-500">{format(event.timestamp)}</p>
      <p className="text-xs font-bold text-cyan-300 mt-1">{event.source} · {event.type.replaceAll('_', ' ')}</p>
      <p className="text-sm text-slate-200 mt-1">{event.description}</p>
      {event.evidence?.map((item, itemIndex) => <p key={itemIndex} className="text-[11px] text-slate-500 mt-1">Evidence: {item.description}</p>)}
      {event.type.endsWith('_change') || event.type === 'new_service' ? <p className="text-[11px] text-slate-500 mt-1">This compares stored OpenSynt observations; it does not explain why the change occurred.</p> : null}
    </li>)}</ol> : <p className="text-sm text-slate-500">No timestamped source observations are available for this lookup.</p>}
  </div>;
}
