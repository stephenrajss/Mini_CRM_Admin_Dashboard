export function FilterSelect(props) {
  const { id, label, value, onChange, options, allLabel = 'All' } = props;

  return (
    <label htmlFor={id} className="flex min-w-[160px] flex-col gap-1 text-xs font-medium text-slate-500">
      {label}
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className="input">
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}