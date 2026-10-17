export function Pagination(props) {
  const { page, total, totalPages, limit, onPageChange, onLimitChange } = props;

  const safePages = Math.max(totalPages || 0, total > 0 ? 1 : 0);
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-slate-600" htmlFor="page-size">
          Rows
          <select
            id="page-size"
            className="input w-auto"
            value={limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </label>
        <button type="button" className="btn-secondary" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          Previous
        </button>
        <span className="px-1 text-sm text-slate-600">
          Page {total === 0 ? 0 : page} of {safePages}
        </span>
        <button type="button" className="btn-secondary" onClick={() => onPageChange(page + 1)} disabled={page >= safePages || safePages === 0}>
          Next
        </button>
      </div>
    </div>
  );
}