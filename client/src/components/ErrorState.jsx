import { AlertTriangle } from 'lucide-react';

export function ErrorState(props) {
  const { title = 'Something went wrong', message, onRetry } = props;

  return (
    <div className="flex flex-col items-center px-6 py-16 text-center" role="alert">
      <div className="mb-4 rounded-full bg-rose-50 p-3 text-rose-600">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {message ? <p className="mt-1 max-w-md text-sm text-slate-500">{message}</p> : null}
      {onRetry ? (
        <button type="button" className="btn-secondary mt-4" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}