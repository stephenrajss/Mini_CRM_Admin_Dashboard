import { Search } from 'lucide-react';

export function SearchInput(props) {
  const { id = 'search', value, onChange, placeholder = 'Search' } = props;

  return (
    <div className="relative min-w-[220px] flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="input pl-9"
        aria-label={placeholder}
      />
    </div>
  );
}