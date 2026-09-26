import { ExternalLink, Flame } from 'lucide-react';

const CATEGORY_STYLE = {
  Ransomware: 'bg-red-900/30 text-red-400 border-red-800',
  'Data Breach': 'bg-orange-900/30 text-orange-400 border-orange-800',
  Vulnerability: 'bg-amber-900/30 text-amber-400 border-amber-800',
  Phishing: 'bg-purple-900/30 text-purple-400 border-purple-800',
  Malware: 'bg-pink-900/30 text-pink-400 border-pink-800',
  'Nation-State': 'bg-indigo-900/30 text-indigo-400 border-indigo-800',
  General: 'bg-slate-800 text-slate-400 border-slate-700',
};

function formatDate(iso) {
  if (!iso) return 'Unknown date';
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? 'Unknown date'
    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function NewsCard({ article }) {
  return (
    <div className={`bg-slate-900 border rounded-lg p-5 ${article.notable ? 'border-amber-700' : 'border-slate-800'}`}>
      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className="font-bold text-slate-100 hover:text-emerald-400 transition-colors flex items-start gap-2"
      >
        {article.notable && <Flame size={16} className="text-amber-500 shrink-0 mt-1" />}
        <span>{article.title}</span>
      </a>

      <p className="text-xs text-slate-500 mt-1 mb-3">
        {article.source} {'\u00b7'} {formatDate(article.publishedAt)}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {(article.categories || []).map((cat) => (
          <span
            key={cat}
            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${CATEGORY_STYLE[cat] || CATEGORY_STYLE.General}`}
          >
            {cat}
          </span>
        ))}
      </div>

      {article.summary && <p className="text-sm text-slate-400">{article.summary}</p>}

      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-slate-500 hover:text-emerald-400 flex items-center gap-1 mt-3 w-fit transition-colors"
      >
        Read full article <ExternalLink size={11} />
      </a>
    </div>
  );
}