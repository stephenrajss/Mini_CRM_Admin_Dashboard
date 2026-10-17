export function FilterSelect(props) {
  const { id, label, value, onChange, options, allLabel = 'All' } = props;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-slate-500">
        {label}
      </label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className="input w-full">
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}