export function EmptyState(props) {
  const { icon: Icon, title, description, action } = props;

  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      {Icon ? (
        <div className="mb-4 rounded-full bg-slate-100 p-3 text-slate-500">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      ) : null}
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {description ? <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}