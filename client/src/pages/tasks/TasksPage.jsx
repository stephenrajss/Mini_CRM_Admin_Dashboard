import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Eye, Pencil, Plus } from 'lucide-react';

import { tasksApi } from '../../api/tasks';
import { usersApi } from '../../api/user';
import { PageHeader } from '../../components/PageHeader';
import { SearchInput } from '../../components/SearchInput';
import { FilterSelect } from '../../components/FilterSelect';
import { DataTable } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDebounce } from '../../hooks/useDebounce';
import { useQueryList } from '../../hooks/useQueryList';
import { DUE_FILTERS, TASK_STATUSES } from '../../utils/constants';
import { formatDate, isOverdue } from '../../utils/format';
import { getErrorMessage } from '../../utils/errors';

export function TasksPage() {
  const { user } = useAuth();
  const notify = useToast();
  const isAdmin = user?.role === 'admin';

  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const [status, setStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [due, setDue] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [users, setUsers] = useState([]);
  const [savingId, setSavingId] = useState('');

  useEffect(() => {
    setPage(1);
  }, [debounced, status, assignedTo, due, limit]);

  const { rows, pagination, loading, error, reload } = useQueryList(tasksApi.list, {
    page, limit, search: debounced, status, assignedTo, due, sortBy: 'dueDate', sortOrder: 'asc',
  });

  useEffect(() => {
    if (!isAdmin) {
      return undefined;
    }
    let active = true;
    usersApi.options()
      .then((response) => {
        if (active) {
          setUsers(response.data.data.map((item) => ({ value: item.id, label: item.name })));
        }
      })
      .catch(() => { });
    return () => {
      active = false;
    }
  }, [isAdmin]);

  async function changeStatus(task, nextStatus) {
    setSavingId(task.id);
    try {
      await tasksApi.updateStatus(task.id, nextStatus);
      notify(nextStatus === 'completed' ? 'Task completed' : 'Task status updated');
      reload();
    } catch (err) {
      notify(getErrorMessage(err, 'Unable to update task'), 'error');
    } finally {
      setSavingId('');
    }
  }

  const columns = [
    {
      key: 'title',
      header: 'Task',
      wrap: true,
      width: '22%',
      render: (row) => <Link to={`/tasks/${row.id}`} className="font-medium text-slate-900 hover:text-indigo-700">{row.title}</Link>,
    },
    {
      key: 'lead',
      header: 'Lead',
      render: (row) => row.lead ? <Link to={`/leads/${row.lead.id}`} className="hover:text-indigo-700">{row.lead.name}</Link> : '—',
    },
    { key: 'assignedTo', header: 'Assigned', render: (row) => row.assignedTo?.name || '—' },
    {
      key: 'dueDate',
      header: 'Due',
      render: (row) => (
        <span className={isOverdue(row.dueDate, row.status) ? 'font-medium text-rose-600' : ''}>
          {formatDate(row.dueDate)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <select
          className="input w-36"
          aria-label={`Status for ${row.title}`}
          value={row.status}
          disabled={savingId === row.id}
          onChange={(event) => changeStatus(row, event.target.value)}
        >
          {TASK_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      ),
    },
    { key: 'createdAt', header: 'Created', render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions',
      header: 'Actions',
      width: '8%',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Link to={`/tasks/${row.id}`} className="btn-ghost px-2" aria-label={`View ${row.title}`}><Eye className="h-4 w-4" /></Link>
          {isAdmin ? <Link to={`/tasks/${row.id}/edit`} className="btn-ghost px-2" aria-label={`Edit ${row.title}`}><Pencil className="h-4 w-4" /></Link> : null}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Tasks"
        description={isAdmin ? 'Assign follow-ups and track due dates.' : 'Tasks assigned to you. You can update their status.'}
        actions={isAdmin ? <Link to="/tasks/new" className="btn-primary"><Plus className="h-4 w-4" />New task</Link> : null}
      />
      <div className="card">
        <div className="grid grid-cols-1 items-end gap-4 border-b border-slate-200 p-4 sm:grid-cols-2 xl:grid-cols-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search title or lead name" />
          <FilterSelect id="task-status" label="Status" value={status} onChange={setStatus} options={TASK_STATUSES} />
          <FilterSelect id="task-due" label="Due" value={due} onChange={setDue} options={DUE_FILTERS} allLabel="Any date" />
          {isAdmin ? <FilterSelect id="task-assignee" label="Assigned user" value={assignedTo} onChange={setAssignedTo} options={users} /> : null}
        </div>
        {loading ? <SkeletonLoader /> : null}
        {!loading && error ? <ErrorState message={error} onRetry={reload} /> : null}
        {!loading && !error && rows.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No tasks found"
            description={isAdmin ? 'Create a task and assign it to an active user.' : 'You have no tasks for this filter.'}
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

export default TasksPage;