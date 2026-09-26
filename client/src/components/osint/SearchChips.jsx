export default function SearchChips({ title, icon: Icon, items, onSelect }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="search-chip-group">
      <div className="search-chip-heading">
        {Icon && <Icon size={12} />}
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            className="search-chip"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
