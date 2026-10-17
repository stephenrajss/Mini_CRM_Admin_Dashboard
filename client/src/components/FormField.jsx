export function FormField(props) {
  const { label, htmlFor, error, hint, children } = props;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-sm text-rose-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function inputAria(id, error) {
  return {
    id,
    className: 'input',
    'aria-invalid': error ? 'true' : 'false',
    'aria-describedby': error ? `${id}-error` : undefined,
  };
}
