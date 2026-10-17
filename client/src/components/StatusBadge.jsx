import { statusLabel } from '../utils/constants';

const STYLES = {
  new: 'bg-slate-100 text-slate-700',
  contacted: 'bg-sky-100 text-sky-800',
  qualified: 'bg-emerald-100 text-emerald-800',
  lost: 'bg-rose-100 text-rose-800',
  pending: 'bg-amber-100 text-amber-900',
  in_progress: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-emerald-100 text-emerald-800',
  admin: 'bg-indigo-100 text-indigo-800',
  user: 'bg-slate-100 text-slate-700',
  active: 'bg-emerald-100 text-emerald-800',
  inactive: 'bg-slate-100 text-slate-600',
};

export function StatusBadge({ value, label }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[value] || STYLES.new}`}>
      {label || statusLabel(value)}
    </span>
  );
}
