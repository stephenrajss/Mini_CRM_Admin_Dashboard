export function DetailItem(props) {
  const { label, children } = props;

  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900 break-words">{children || '—'}</dd>
    </div>
  );
}