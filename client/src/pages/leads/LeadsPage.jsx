import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Plus, Trash2, UserRound } from 'lucide-react';

import { leadsApi } from '../../api/leads';
import { companiesApi } from '../../api/companies';
import { usersApi } from '../../api/user';
import { PageHeader } from '../../components/PageHeader';
import { SearchInput } from '../../components/SearchInput';
import { FilterSelect } from '../../components/FilterSelect';
import { DataTable } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDebounce } from '../../hooks/useDebounce';
import { useQueryList } from '../../hooks/useQueryList';
import { LEAD_STATUSES } from '../../utils/constants';
import { formatDate } from '../../utils/format';
import { getErrorMessage } from '../../utils/errors';

export function LeadsPage() {
  const { user } = useAuth();
  const notify = useToast();
  const isAdmin = user?.role === 'admin';

  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const [status, setStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [company, setCompany] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [debounced, status, assignedTo, company, limit, sortBy, sortOrder]);

  const { rows, pagination, loading, error, reload } = useQueryList(leadsApi.list, {
    page, limit, search: debounced, status, assignedTo, company, sortBy, sortOrder,
  });

  useEffect(() => {
    if (!isAdmin) {
      return undefined;
    }
    let active = true;
    Promise.all([usersApi.options(), companiesApi.options()])
      .then(([userResponse, companyResponse]) => {
        if (!active) {
          return;
        }
        setUsers(userResponse.data.data.map((item) => ({ value: item.id, label: item.name })));
        setCompanies(companyResponse.data.data.map((item) => ({ value: item.id, label: item.name })));
      })
      .catch(() => { });
    return () => {
      active = false;
    };
  }, [isAdmin]);

  function toggleSort(field) {
    if (sortBy === field) {
      setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) {
      return;
    }
    setDeleting(true);
    try {
      await leadsApi.remove(pendingDelete.id);
      notify('Lead deleted');
      setPendingDelete(null);
      reload();
    } catch (err) {
      notify(getErrorMessage(err, 'Unable to delete lead'), 'error');
    } finally {
      setDeleting(false);
    }
  }

  const filtersActive = Boolean(debounced || status || assignedTo || company);
  const columns = [
    {
      key: 'name',
      label: 'Name',
      wrap: true,
      width: '14%',
      header: <SortButton label="Name" field="name" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} />,
      render: (row) => <Link to={`/leads/${row.id}`} className="font-medium text-slate-900 hover:text-indigo-700">{row.name}</Link>,
    },
    { key: 'email', header: 'Email', wrap: true, width: '20%', render: (row) => row.email },
    { key: 'phone', header: 'Phone', width: '12%', render: (row) => row.phone },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
    { key: 'assignedTo', header: 'Assigned', render: (row) => row.assignedTo?.name || '—' },
    { key: 'company', header: 'Company', render: (row) => row.company?.name || '—' },
    { key: 'createdAt', header: 'Created', render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions',
      header: 'Actions',
      width: '12%',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Link to={`/leads/${row.id}`} className="btn-ghost px-2" aria-label={`View ${row.name}`}><Eye className="h-4 w-4" /></Link>
          <Link to={`/leads/${row.id}/edit`} className="btn-ghost px-2" aria-label={`Edit ${row.name}`}><Pencil className="h-4 w-4" /></Link>
          {isAdmin ? (
            <button type="button" className="btn-ghost px-2 text-rose-600" aria-label={`Delete ${row.name}`} onClick={() => setPendingDelete(row)}>
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Leads"
        description={isAdmin ? 'Search, filter, and manage the active pipeline.' : 'Leads assigned to you.'}
        actions={isAdmin ? <Link to="/leads/new" className="btn-primary"><Plus className="h-4 w-4" />New lead</Link> : null}
      />
      <div className="card">
        <div className="grid grid-cols-1 items-end gap-4 border-b border-slate-200 p-4 sm:grid-cols-2 xl:grid-cols-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search name, email, or phone" />
          <FilterSelect id="lead-status" label="Status" value={status} onChange={setStatus} options={LEAD_STATUSES} />
          {isAdmin ? <FilterSelect id="lead-assignee" label="Assigned user" value={assignedTo} onChange={setAssignedTo} options={users} /> : null}
          {isAdmin ? <FilterSelect id="lead-company" label="Company" value={company} onChange={setCompany} options={companies} /> : null}
        </div>
        {loading ? <SkeletonLoader /> : null}
        {!loading && error ? <ErrorState message={error} onRetry={reload} /> : null}
        {!loading && !error && rows.length === 0 ? (
          <EmptyState
            icon={UserRound}
            title={filtersActive ? 'No leads match your filters' : 'No leads yet'}
            description={filtersActive ? 'Try a different search or clear the filters.' : 'Create a lead to start tracking the pipeline.'}
            action={isAdmin && !filtersActive ? <Link to="/leads/new" className="btn-primary">New lead</Link> : null}
          />
        ) : null}
        {!loading && !error && rows.length > 0 ? <DataTable columns={columns} rows={rows} rowKey={(row) => row.id} /> : null}
        {!loading && !error ? (
          <Pagination
            page={pagination.page || page}
            total={pagination.total || 0}
            totalPages={pagination.totalPages || 0}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        ) : null}
      </div>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete lead"
        description={`Soft-delete ${pendingDelete?.name || 'this lead'}? It will disappear from lists, companies, and dashboard counts.`}
        confirmLabel="Delete lead"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}

function SortButton({ label, field, sortBy, sortOrder, onSort }) {
  const active = sortBy === field;
  return (
    <button type="button" className="inline-flex items-center gap-1 uppercase" onClick={() => onSort(field)}>
      {label}
      <span aria-hidden="true">{active ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</span>
    </button>
  );
}

export default LeadsPage;