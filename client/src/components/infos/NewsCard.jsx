import { ExternalLink, Flame } from 'lucide-react';

function formatDate(iso) {
  if (!iso) return 'Unknown date';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function NewsCard({ article }) {
  return (
    <article className={`feed-card${article.notable ? ' is-notable' : ''}`}>
      <a href={article.link} target="_blank" rel="noopener noreferrer" className="feed-card-title">
        {article.notable && <Flame size={15} className="mt-0.5 shrink-0 text-[#c39861]" aria-label="Notable story" />}
        <span>{article.title}</span>
      </a>
      <div className="feed-card-meta"><span>{article.source}</span><span aria-hidden="true">/</span><time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time></div>
      {article.categories?.length > 0 && <div className="feed-card-categories">{article.categories.map((cat) => <span key={cat} className="feed-card-category">{cat}</span>)}</div>}
      {article.summary && <p className="feed-card-summary">{article.summary}</p>}
      <a href={article.link} target="_blank" rel="noopener noreferrer" className="feed-card-link">Read source report <ExternalLink size={12} /></a>
    </article>
  );
}
