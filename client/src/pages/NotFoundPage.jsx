import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';

export function NotFoundPage({ standalone = false }) {
  const body = (
    <div className="card px-6 py-12 text-center">
      <p className="text-sm font-medium text-indigo-600">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500">That address is not part of Mini CRM.</p>
      <Link to="/" className="btn-primary mt-6">Go to dashboard</Link>
    </div>
  );

  if (standalone) {
    return <div className="mx-auto flex min-h-screen max-w-lg items-center px-4">{body}</div>;
  }

  return (
    <div>
      <PageHeader title="Not found" />
      {body}
    </div>
  );
}
