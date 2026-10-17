import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

export default function ForbiddenPage() {
  return (
    <div>
      <PageHeader title="Access denied" description="Your role does not include this part of the CRM." />
      <div className="card px-6 py-10">
        <p className="text-sm text-slate-600">Ask an administrator if you need access.</p>
        <Link to="/" className="btn-primary mt-4">Back to dashboard</Link>
      </div>
    </div>
  );
}
