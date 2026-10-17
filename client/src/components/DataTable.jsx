export function DataTable(props) {
  const { columns, rows, rowKey } = props;

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[920px] border-collapse text-left text-sm">
          <caption className="sr-only">Data table</caption>
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`whitespace-nowrap px-4 py-3 font-medium ${column.headerClassName || ''}`}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                {columns.map((column) => (
                  <td key={column.key} className={`px-4 py-3 align-middle text-slate-700 ${column.className || ''}`}>
                    <div className={column.wrap ? 'min-w-[8rem] break-words' : 'whitespace-nowrap'}>
                      {column.render ? column.render(row) : row[column.key]}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="divide-y divide-slate-100 md:hidden">
        {rows.map((row) => (
          <article key={rowKey(row)} className="space-y-2 p-4">
            {columns.filter((column) => !column.hideOnMobile).map((column) => (
              <div key={column.key} className="flex items-start justify-between gap-3">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{column.label || column.header}</span>
                <div className="min-w-0 text-right text-sm text-slate-800">
                  {column.render ? column.render(row) : row[column.key]}
                </div>
              </div>
            ))}
          </article>
        ))}
      </div>
    </>
  );
}