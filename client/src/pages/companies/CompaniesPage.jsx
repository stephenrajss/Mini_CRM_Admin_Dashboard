import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Eye, Pencil, Plus } from 'lucide-react';

import { companiesApi } from '../../api/companies';
import { PageHeader } from '../../components/PageHeader';
import { SearchInput } from '../../components/SearchInput';
import { DataTable } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { useAuth } from '../../context/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import { useQueryList } from '../../hooks/useQueryList';

export function CompaniesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    setPage(1);
  }, [debounced, limit]);

  const { rows, pagination, loading, error, reload } = useQueryList(companiesApi.list, {
    page, limit, search: debounced, sortBy: 'name', sortOrder: 'asc',
  });

  const columns = [
    {
      key: 'name',
      header: 'Company',
      render: (row) => <Link to={`/companies/${row.id}`} className="font-medium text-slate-900 hover:text-indigo-700">{row.name}</Link>,
    },
    { key: 'industry', header: 'Industry', render: (row) => row.industry },
    { key: 'location', header: 'Location', render: (row) => row.location },
    { key: 'phone', header: 'Phone', render: (row) => row.phone || '—' },
    {
      key: 'website',
      header: 'Website',
      render: (row) => row.website ? (
        <a href={row.website} target="_blank" rel="noreferrer" className="text-indigo-700 hover:underline">Website</a>
      ) : '—',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Link to={`/companies/${row.id}`} className="btn-ghost px-2" aria-label={`View ${row.name}`}><Eye className="h-4 w-4" /></Link>
          {isAdmin ? <Link to={`/companies/${row.id}/edit`} className="btn-ghost px-2" aria-label={`Edit ${row.name}`}><Pencil className="h-4 w-4" /></Link> : null}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Companies"
        description="Organizations connected to your leads."
        actions={isAdmin ? <Link to="/companies/new" className="btn-primary"><Plus className="h-4 w-4" />New company</Link> : null}
      />
      <div className="card">
        <div className="border-b border-slate-200 p-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search name, industry, or location" />
        </div>
        {loading ? <SkeletonLoader /> : null}
        {!loading && error ? <ErrorState message={error} onRetry={reload} /> : null}
        {!loading && !error && rows.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={debounced ? 'No companies match your search' : 'No companies yet'}
            description={debounced ? 'Try a different name, industry, or location.' : 'Add a company before linking leads to it.'}
            action={isAdmin && !debounced ? <Link to="/companies/new" className="btn-primary">New company</Link> : null}
          />
        ) : null}
        {!loading && !error && rows.length > 0 ? <DataTable columns={columns} rows={rows} rowKey={(row) => row.id} /> : null}
        {!loading && !error ? (
          <Pagination page={pagination.page || page} total={pagination.total || 0} totalPages={pagination.totalPages || 0} limit={limit} onPageChange={setPage} onLimitChange={setLimit} />
        ) : null}
      </div>
    </div>
  );
}
