import { ExternalLink } from 'lucide-react';
import { buildCveSummary } from '../../utils/cveRiskSummary';

const SEVERITY_STYLE = {
  CRITICAL: 'border-rose-800/70 bg-rose-950/40 text-rose-300',
  HIGH: 'border-orange-800/70 bg-orange-950/40 text-orange-300',
  MEDIUM: 'border-amber-800/70 bg-amber-950/40 text-amber-300',
  LOW: 'border-emerald-800/70 bg-emerald-950/40 text-emerald-300',
  UNKNOWN: 'border-slate-700 bg-slate-800/60 text-slate-300',
};
const SUMMARY_STYLE = {
  danger: 'border-rose-900/60 bg-rose-950/20 text-rose-200',
  warn: 'border-amber-900/60 bg-amber-950/20 text-amber-200',
  good: 'border-emerald-900/60 bg-emerald-950/20 text-emerald-200',
  info: 'border-slate-700/70 bg-slate-800/30 text-slate-300',
};

function safeHostname(url) {
  try { return new URL(url).hostname; } catch { return url; }
}

export default function CveCard({ cve }) {
  const summary = buildCveSummary(cve);
  const publishedDate = cve.published ? new Date(cve.published).toLocaleDateString() : 'Unknown';
  return (
    <article className="feed-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="m-0 font-mono text-[15px] font-bold tracking-tight text-[#b7d8a4]">{cve.id}</h2>
          <p className="mt-1 text-[10px] text-slate-500">Published {publishedDate}</p>
        </div>
        <span className={`rounded border px-2 py-1 font-mono text-[10px] font-bold tracking-wide ${SEVERITY_STYLE[cve.severity] || SEVERITY_STYLE.UNKNOWN}`}>
          {cve.severity}{cve.baseScore != null ? ` · ${cve.baseScore}` : ''}
        </span>
      </div>
      <div className={`mt-4 rounded-md border px-3.5 py-3 text-[11px] leading-relaxed ${SUMMARY_STYLE[summary.severity]}`}>{summary.text}</div>
      <p className="mb-0 mt-4 text-[12px] leading-[1.75] text-slate-300">{cve.description}</p>
      {cve.references?.length > 0 && <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/[.06] pt-3">{cve.references.slice(0, 3).map((url) => <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[10px] text-slate-500 transition-colors hover:text-[#b7d8a4]"><ExternalLink size={11} />{safeHostname(url)}</a>)}</div>}
    </article>
  );
}
