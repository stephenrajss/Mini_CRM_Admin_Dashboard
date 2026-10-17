import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Users } from 'lucide-react';

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
import { USER_ROLES } from '../../utils/constants';
import { getErrorMessage } from '../../utils/errors';

export function UsersPage() {
  const { user } = useAuth();
  const notify = useToast();
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);

  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pending, setPending] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [debounced, role, limit]);

  const { rows, pagination, loading, error, reload } = useQueryList(usersApi.list, {
    page, limit, search: debounced, role, sortBy: 'name', sortOrder: 'asc',
  });

  async function toggleActive() {
    if (!pending) {
      return;
    }
    setSaving(true);
    try {
      await usersApi.setActive(pending.id, !pending.isActive);
      notify(pending.isActive ? 'User deactivated' : 'User activated');
      setPending(null);
      reload();
    } catch (err) {
      notify(getErrorMessage(err, 'Unable to update user'), 'error');
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: 'name', header: 'Name', wrap: true, width: '22%', render: (row) => <span className="font-medium text-slate-900">{row.name}</span> },
    { key: 'email', header: 'Email', wrap: true, width: '28%', render: (row) => row.email },
    { key: 'role', header: 'Role', render: (row) => <StatusBadge value={row.role} /> },
    {
      key: 'isActive',
      header: 'Status',
      render: (row) => <StatusBadge value={row.isActive ? 'active' : 'inactive'} label={row.isActive ? 'Active' : 'Inactive'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '22%',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Link to={`/users/${row.id}/edit`} className="btn-ghost px-2" aria-label={`Edit ${row.name}`}><Pencil className="h-4 w-4" /></Link>
          <button
            type="button"
            className="btn-secondary"
            disabled={row.id === user?.id}
            onClick={() => setPending(row)}
          >
            {row.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users"
        description="Create accounts, change roles, and deactivate access."
        actions={<Link to="/users/new" className="btn-primary"><Plus className="h-4 w-4" />New user</Link>}
      />
      <div className="card">
        <div className="grid grid-cols-1 gap-4 border-b border-slate-200 p-4 md:grid-cols-[minmax(16rem,1fr)_14rem] md:items-end">
          <SearchInput value={search} onChange={setSearch} placeholder="Search name or email" />
          <FilterSelect id="user-role" label="Role" value={role} onChange={setRole} options={USER_ROLES} />
        </div>
        {loading ? <SkeletonLoader /> : null}
        {!loading && error ? <ErrorState message={error} onRetry={reload} /> : null}
        {!loading && !error && rows.length === 0 ? <EmptyState icon={Users} title="No users found" /> : null}
        {!loading && !error && rows.length > 0 ? <DataTable columns={columns} rows={rows} rowKey={(row) => row.id} /> : null}
        {!loading && !error ? (
          <Pagination page={pagination.page || page} total={pagination.total || 0} totalPages={pagination.totalPages || 0} limit={limit} onPageChange={setPage} onLimitChange={setLimit} />
        ) : null}
      </div>
      <ConfirmDialog
        open={Boolean(pending)}
        title={pending?.isActive ? 'Deactivate user' : 'Activate user'}
        description={pending?.isActive
          ? `${pending.name} will no longer be able to sign in or receive new assignments.`
          : `${pending?.name} will be able to sign in again.`}
        confirmLabel={pending?.isActive ? 'Deactivate' : 'Activate'}
        tone={pending?.isActive ? 'danger' : 'primary'}
        loading={saving}
        onConfirm={toggleActive}
        onClose={() => setPending(null)}
      />
    </div>
  );
}

export default UsersPage;