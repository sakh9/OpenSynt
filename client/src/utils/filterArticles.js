// Client-side filtering, deliberately - the backend already caches the
// FULL article set (category doesn't change what's fetched from RSS,
// unlike Raven Eyes' severity filter which changes the actual NVD query).
// So filtering here is just an array operation, not worth a network
// round-trip on every chip click.
export function filterArticles(articles, { category = null, notableOnly = false } = {}) {
  return (articles || [])
    .filter((a) => !category || a.categories?.includes(category))
    .filter((a) => !notableOnly || a.notable);
}