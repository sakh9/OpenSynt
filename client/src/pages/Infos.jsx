import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Loader2, AlertTriangle, Flame } from 'lucide-react';
import NewsCard from '../components/infos/NewsCard';
import { filterArticles } from '../utils/filterArticles';

const CATEGORIES = ['Ransomware', 'Data Breach', 'Vulnerability', 'Phishing', 'Malware', 'Nation-State', 'General'];
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function InfoS() {
  const [articles, setArticles] = useState(null);
  const [failedSources, setFailedSources] = useState([]);
  const [cached, setCached] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState(null);
  const [notableOnly, setNotableOnly] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    axios
      .get(`${API_URL}/api/infos/feed`, { signal: controller.signal, timeout: 15000 })
      .then((res) => {
        setArticles(res.data.results);
        setFailedSources(res.data.failedSources || []);
        setCached(res.data.cached);
      })
      .catch((err) => {
        if (axios.isCancel(err) || err.code === 'ERR_CANCELED') return;
        setError(err.response?.data?.error || 'Failed to load the news feed.');
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const filtered = filterArticles(articles, { category, notableOnly });

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-emerald-400">InfoS</h1>
        <p className="text-slate-400">Cybersecurity news, aggregated and auto-categorized from 5 trusted sources</p>
      </header>

      {!loading && articles && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={() => setCategory(null)}
            className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
              !category ? 'bg-emerald-700 border-emerald-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(category === cat ? null : cat)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                category === cat ? 'bg-emerald-700 border-emerald-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {cat}
            </button>
          ))}
          <button
            onClick={() => setNotableOnly((v) => !v)}
            className={`text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-1 transition-colors ${
              notableOnly ? 'bg-amber-700 border-amber-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            <Flame size={12} /> Notable only
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 py-8 justify-center">
          <Loader2 className="animate-spin" size={18} /> Loading...
        </div>
      )}

      {error && !loading && (
        <div className="flex items-start gap-3 text-red-400 bg-red-900/20 p-4 border border-red-900 rounded mb-6">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {articles && !loading && !error && (
        <>
          <div className="flex items-center justify-between mb-4 text-sm text-slate-500">
            <span>{filtered.length} article{filtered.length === 1 ? '' : 's'}</span>
            {cached && <span className="text-xs border border-slate-700 rounded px-2 py-0.5">from cache</span>}
          </div>

          {failedSources.length > 0 && (
            <p className="text-xs text-slate-600 mb-4">
              Note: {failedSources.map((f) => f.source).join(', ')} {failedSources.length === 1 ? 'was' : 'were'} unavailable this refresh.
            </p>
          )}

          {filtered.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No articles match this filter.</p>
          ) : (
            <div className="space-y-4">
              {filtered.map((article, i) => (
                <NewsCard key={article.link || i} article={article} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}