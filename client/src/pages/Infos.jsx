import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { AlertTriangle, Flame, Loader2, Radio } from 'lucide-react';
import NewsCard from '../components/infos/NewsCard';
import { filterArticles } from '../utils/filterArticles';

const CATEGORIES = ['Ransomware', 'Data Breach', 'Vulnerability', 'Phishing', 'Malware', 'Nation-State', 'General'];
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Infos() {
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
    axios.get(`${API_URL}/api/infos/feed`, { signal: controller.signal, timeout: 15000 })
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
    <div className="page-wrap">
      <header className="page-heading">
        <div>
          <p className="page-kicker"><Radio size={13} /> Threat intelligence / Briefing</p>
          <h1 className="page-title">Infos</h1>
          <p className="page-description">Cybersecurity reporting gathered from trusted sources and organized around the stories that matter.</p>
        </div>
        <div className="page-aside">MULTI-SOURCE FEED<br />CATEGORIZED FOR REVIEW</div>
      </header>

      {!loading && articles && (
        <section className="filter-panel" aria-label="Filter news articles">
          <p className="filter-label">Filter by topic</p>
          <div className="filter-row">
            <button aria-pressed={!category} onClick={() => setCategory(null)} className={`filter-chip${!category ? ' is-selected' : ''}`}>All topics</button>
            {CATEGORIES.map((cat) => (
              <button key={cat} aria-pressed={category === cat} onClick={() => setCategory(category === cat ? null : cat)} className={`filter-chip${category === cat ? ' is-selected' : ''}`}>{cat}</button>
            ))}
            <button aria-pressed={notableOnly} onClick={() => setNotableOnly((v) => !v)} className={`filter-chip filter-chip-notable${notableOnly ? ' is-selected' : ''}`}>
              <Flame size={12} /> Notable only
            </button>
          </div>
        </section>
      )}

      {loading && <div className="state-panel" role="status"><Loader2 className="animate-spin" size={17} /> Gathering the latest reports…</div>}
      {error && !loading && <div className="state-panel state-panel-error" role="alert"><AlertTriangle size={18} className="shrink-0" /><p>{error}</p></div>}

      {articles && !loading && !error && (
        <>
          <div className="result-bar">
            <span className="result-count"><strong>{filtered.length}</strong> {filtered.length === 1 ? 'story' : 'stories'} in this view</span>
            {cached && <span className="meta-badge">Cached feed</span>}
          </div>
          {failedSources.length > 0 && <p className="mb-4 text-[11px] leading-relaxed text-slate-500">Some sources could not be reached: {failedSources.map((f) => f.source).join(', ')}.</p>}
          {filtered.length === 0 ? (
            <div className="state-panel state-panel-empty">No stories match these filters. Adjust the topic or notable-only selection.</div>
          ) : (
            <div className="feed-list">{filtered.map((article, i) => <NewsCard key={article.link || i} article={article} />)}</div>
          )}
        </>
      )}
    </div>
  );
}
