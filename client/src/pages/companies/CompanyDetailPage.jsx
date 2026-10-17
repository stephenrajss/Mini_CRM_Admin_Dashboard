import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { companiesApi } from '../../api/companies';
import { PageHeader } from '../../components/PageHeader';
import { DetailItem } from '../../components/DetailItem';
import { DataTable } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { useAuth } from '../../context/AuthContext';
import { useQueryList } from '../../hooks/useQueryList';
import { formatDate } from '../../utils/format';
import { getErrorMessage } from '../../utils/errors';

export function CompanyDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const leads = useQueryList(
    (params, config) => companiesApi.leads(id, params, config),
    { companyId: id, page, limit, sortBy: 'createdAt', sortOrder: 'desc' },
  );

  function loadCompany() {
    setLoading(true);
    companiesApi.get(id)
      .then((response) => {
        setCompany(response.data.data);
        setError('');
      })
      .catch((err) => setError(getErrorMessage(err) || 'Unable to load company'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCompany();
  }, [id]);

  const columns = [
    {
      key: 'name',
      header: 'Lead',
      render: (row) => <Link to={`/leads/${row.id}`} className="font-medium text-slate-900 hover:text-indigo-700">{row.name}</Link>,
    },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
    { key: 'assignedTo', header: 'Assigned', render: (row) => row.assignedTo?.name || '—' },
    { key: 'createdAt', header: 'Created', render: (row) => formatDate(row.createdAt) },
  ];

  if (loading) return <div className="card"><SkeletonLoader /></div>;
  if (error || !company) return <div className="card"><ErrorState message={error || 'Company not found'} onRetry={loadCompany} /></div>;

  return (
    <div>
      <PageHeader
        title={company.name}
        description={`${company.industry} · ${company.location}`}
        actions={(
          <>
            <Link to="/companies" className="btn-secondary">Back</Link>
            {isAdmin ? <Link to={`/companies/${company.id}/edit`} className="btn-primary">Edit</Link> : null}
          </>
        )}
      />
      <section className="card p-5">
        <dl className="grid gap-5 sm:grid-cols-2">
          <DetailItem label="Industry">{company.industry}</DetailItem>
          <DetailItem label="Location">{company.location}</DetailItem>
          <DetailItem label="Phone">{company.phone || '—'}</DetailItem>
          <DetailItem label="Website">
            {company.website ? <a className="text-indigo-700 hover:underline" href={company.website} target="_blank" rel="noreferrer">{company.website}</a> : '—'}
          </DetailItem>
          <div className="sm:col-span-2">
            <DetailItem label="Description">{company.description || '—'}</DetailItem>
          </div>
        </dl>
      </section>
      <section className="card mt-4">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Associated leads</h2>
          <p className="mt-1 text-sm text-slate-500">
            {isAdmin ? 'Active leads linked to this company.' : 'Your active leads linked to this company.'}
          </p>
        </div>
        {leads.loading ? <SkeletonLoader rows={3} /> : null}
        {!leads.loading && leads.error ? <ErrorState message={leads.error} onRetry={leads.reload} /> : null}
        {!leads.loading && !leads.error && leads.rows.length === 0 ? (
          <EmptyState title="No associated leads" description="Deleted leads are excluded." />
        ) : null}
        {!leads.loading && !leads.error && leads.rows.length > 0 ? (
          <DataTable columns={columns} rows={leads.rows} rowKey={(row) => row.id} />
        ) : null}
        {!leads.loading && !leads.error ? (
          <Pagination
            page={leads.pagination.page || page}
            total={leads.pagination.total || 0}
            totalPages={leads.pagination.totalPages || 0}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        ) : null}
      </section>
    </div>
  );
}
