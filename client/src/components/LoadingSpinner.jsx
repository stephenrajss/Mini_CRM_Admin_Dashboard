import { LoaderCircle } from 'lucide-react';

export function LoadingSpinner(props) {
  const { label = 'Loading', className = 'h-5 w-5' } = props;

  return <LoaderCircle className={`animate-spin ${className}`} aria-hidden="true" />;
}

export function FullPageSpinner(props) {
  const { label = 'Loading Mini CRM' } = props;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50" role="status">
      <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
        <LoadingSpinner />
        <span>{label}</span>
      </div>
    </div>
  );
}
