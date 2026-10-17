import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { leadsApi } from '../../api/leads';
import { tasksApi } from '../../api/tasks';
import { PageHeader } from '../../components/PageHeader';
import { DetailItem } from '../../components/DetailItem';
import { StatusBadge } from '../../components/StatusBadge';
import { ErrorState } from '../../components/ErrorState';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LEAD_STATUSES } from '../../utils/constants';
import { formatDate } from '../../utils/format';
import { getErrorMessage } from '../../utils/errors';

export function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [lead, setLead] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([leadsApi.get(id), tasksApi.list({ lead: id, limit: 10, sortBy: 'dueDate', sortOrder: 'asc' })])
      .then(([leadResponse, taskResponse]) => {
        setLead(leadResponse.data.data);
        setTasks(taskResponse.data.data);
        setError('');
      })
      .catch((err) => setError(getErrorMessage(err) || 'Unable to load lead'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [id]);

  async function changeStatus(status) {
    setSavingStatus(true);
    try {
      const response = await leadsApi.updateStatus(id, status);
      setLead(response.data.data);
      notify('Lead status updated');
    } catch (err) {
      notify(getErrorMessage(err, 'Unable to update status'), 'error');
    } finally {
      setSavingStatus(false);
    }
  }

  async function remove() {
    setDeleting(true);
    try {
      await leadsApi.remove(id);
      notify('Lead deleted');
      navigate('/leads');
    } catch (err) {
      notify(getErrorMessage(err, 'Unable to delete lead'), 'error');
      setDeleting(false);
    }
  }

  if (loading) {
    return <div className="card"><SkeletonLoader /></div>;
  }
  if (error || !lead) {
    return <div className="card"><ErrorState message={error || 'Lead not found'} onRetry={load} /></div>;
  }

  return (
    <div>
      <PageHeader
        title={lead.name}
        description="Lead details, assignment, and related tasks."
        actions={(
          <>
            <Link to="/leads" className="btn-secondary">Back</Link>
            <Link to={`/leads/${lead.id}/edit`} className="btn-primary">Edit</Link>
            {isAdmin ? <button type="button" className="btn-danger" onClick={() => setConfirming(true)}>Delete</button> : null}
          </>
        )}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <dl className="grid gap-5 sm:grid-cols-2">
            <DetailItem label="Email">{lead.email}</DetailItem>
            <DetailItem label="Phone">{lead.phone}</DetailItem>
            <DetailItem label="Status"><StatusBadge value={lead.status} /></DetailItem>
            <DetailItem label="Assigned">{lead.assignedTo?.name}</DetailItem>
            <DetailItem label="Company">
              {lead.company ? <Link className="text-indigo-700 hover:underline" to={`/companies/${lead.company.id}`}>{lead.company.name}</Link> : '—'}
            </DetailItem>
            <DetailItem label="Created">{formatDate(lead.createdAt)}</DetailItem>
            <div className="sm:col-span-2">
              <DetailItem label="Notes">{lead.notes || '—'}</DetailItem>
            </div>
          </dl>
        </section>
        <section className="card p-5">
          <h2 className="text-sm font-semibold text-slate-900">Update status</h2>
          <div className="mt-3 grid gap-2">
            {LEAD_STATUSES.map((item) => (
              <button
                key={item.value}
                type="button"
                className={item.value === lead.status ? 'btn-primary justify-start' : 'btn-secondary justify-start'}
                disabled={savingStatus}
                onClick={() => changeStatus(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>
      </div>
      <section className="card mt-4 p-5">
        <h2 className="text-sm font-semibold text-slate-900">Related tasks</h2>
        {tasks.length === 0 ? <p className="mt-3 text-sm text-slate-500">No tasks for this lead.</p> : (
          <ul className="mt-3 divide-y divide-slate-100">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center justify-between gap-3 py-3">
                <Link to={`/tasks/${task.id}`} className="text-sm font-medium text-slate-900 hover:text-indigo-700">{task.title}</Link>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">{formatDate(task.dueDate)}</span>
                  <StatusBadge value={task.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <ConfirmDialog
        open={confirming}
        title="Delete lead"
        description="This soft-deletes the lead. It will be excluded from lists and dashboard counts."
        confirmLabel="Delete lead"
        loading={deleting}
        onConfirm={remove}
        onClose={() => setConfirming(false)}
      />
    </div>
  );
}

export default LeadDetailPage;