import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { AlertTriangle, Bug, Loader2, Search, X } from 'lucide-react';
import CveCard from '../components/raveneyes/CveCard';

const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function RavenEyes() {
  const [mode, setMode] = useState('feed');
  const [severity, setSeverity] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef(null);

  function cancelInFlight() {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    return controller;
  }

  async function loadFeed(sev) {
    const controller = cancelInFlight();
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/api/raven-eyes/feed`, { params: sev ? { severity: sev } : {}, signal: controller.signal, timeout: 15000 });
      setData(res.data);
    } catch (err) {
      if (axios.isCancel(err) || err.code === 'ERR_CANCELED') return;
      setError(err.response?.data?.error || 'Failed to load the CVE feed.');
    } finally { setLoading(false); }
  }

  async function handleSearch(e) {
    e.preventDefault();
    const trimmed = keyword.trim();
    if (!trimmed) return;
    const controller = cancelInFlight();
    setMode('search'); setLoading(true); setError('');
    try {
      const res = await axios.post(`${API_URL}/api/raven-eyes/search`, { keyword: trimmed }, { signal: controller.signal, timeout: 15000 });
      setData(res.data);
    } catch (err) {
      if (axios.isCancel(err) || err.code === 'ERR_CANCELED') return;
      setError(err.response?.data?.error || 'Failed to search CVEs.');
    } finally { setLoading(false); }
  }

  function backToFeed() { setMode('feed'); setKeyword(''); setError(''); loadFeed(severity); }
  function selectSeverity(sev) {
    const next = severity === sev ? null : sev;
    setSeverity(next);
    if (mode === 'feed') loadFeed(next);
  }

  useEffect(() => {
    const timer = setTimeout(() => loadFeed(null), 0);
    return () => { clearTimeout(timer); abortRef.current?.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page-wrap">
      <header className="page-heading">
        <div>
          <p className="page-kicker"><Bug size={13} /> Vulnerability intelligence / NVD</p>
          <h1 className="page-title">Raven Eyes</h1>
          <p className="page-description">A clear view of recent CVEs, with severity signals and plain-language risk summaries to guide review.</p>
        </div>
        <div className="page-aside">CVE CATALOGUE<br />FEED + KEYWORD SEARCH</div>
      </header>

      <form onSubmit={handleSearch} className="input-row" role="search">
        <input type="search" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Search by product, vendor or keyword" aria-label="Search CVEs" className="suite-input" />
        <button type="submit" disabled={loading} className="suite-button"><Search size={15} /> Search CVEs</button>
      </form>

      {mode === 'search' ? (
        <button onClick={backToFeed} className="mb-5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 transition-colors hover:text-[#b7d8a4]"><X size={14} /> Clear search and return to feed</button>
      ) : (
        <section className="filter-panel" aria-label="Filter CVEs by severity">
          <p className="filter-label">Severity</p>
          <div className="filter-row">
            {SEVERITIES.map((sev) => <button key={sev} aria-pressed={severity === sev} onClick={() => selectSeverity(sev)} className={`filter-chip${severity === sev ? ' is-selected' : ''}`}>{sev}</button>)}
            <span className="ml-auto self-center text-[10px] text-slate-500">Select an active severity again to clear</span>
          </div>
        </section>
      )}

      {loading && <div className="state-panel" role="status"><Loader2 className="animate-spin" size={17} /> Loading vulnerability records…</div>}
      {error && !loading && <div className="state-panel state-panel-error" role="alert"><AlertTriangle size={18} className="shrink-0" /><p>{error}</p></div>}
      {data && !loading && !error && (
        <>
          <div className="result-bar"><span className="result-count"><strong>{data.totalResults?.toLocaleString() ?? 0}</strong> matching records</span>{data.cached && <span className="meta-badge">Cached feed</span>}</div>
          {data.results?.length === 0 ? <div className="state-panel state-panel-empty">No CVEs found for this query. Try a broader product or vendor name.</div> : <div className="feed-list">{data.results.map((cve) => <CveCard key={cve.id} cve={cve} />)}</div>}
        </>
      )}
    </div>
  );
}
