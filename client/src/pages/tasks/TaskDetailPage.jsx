import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { tasksApi } from '../../api/tasks';
import { PageHeader } from '../../components/PageHeader';
import { DetailItem } from '../../components/DetailItem';
import { StatusBadge } from '../../components/StatusBadge';
import { ErrorState } from '../../components/ErrorState';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { TASK_STATUSES } from '../../utils/constants';
import { formatDate } from '../../utils/format';
import { getErrorMessage } from '../../utils/errors';

export function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    tasksApi.get(id)
      .then((response) => {
        setTask(response.data.data);
        setError('');
      })
      .catch((err) => setError(getErrorMessage(err) || 'Unable to load task'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [id]);

  const canUpdate = isAdmin || task?.assignedTo?.id === user?.id;

  async function changeStatus(status) {
    setSaving(true);
    try {
      const response = await tasksApi.updateStatus(id, status);
      setTask(response.data.data);
      notify(status === 'completed' ? 'Task completed' : 'Task status updated');
    } catch (err) {
      notify(getErrorMessage(err, 'Unable to update task'), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setDeleting(true);
    try {
      await tasksApi.remove(id);
      notify('Task deleted');
      navigate('/tasks');
    } catch (err) {
      notify(getErrorMessage(err, 'Unable to delete task'), 'error');
      setDeleting(false);
    }
  }

  if (loading) {
    return <div className="card"><SkeletonLoader /></div>;
  }
  if (error || !task) {
    return <div className="card"><ErrorState message={error || 'Task not found'} onRetry={load} /></div>;
  }

  return (
    <div>
      <PageHeader
        title={task.title}
        description={task.lead ? `Linked to ${task.lead.name}` : 'Task details'}
        actions={(
          <>
            <Link to="/tasks" className="btn-secondary">Back</Link>
            {isAdmin ? <Link to={`/tasks/${task.id}/edit`} className="btn-primary">Edit</Link> : null}
            {isAdmin ? <button type="button" className="btn-danger" onClick={() => setConfirming(true)}>Delete</button> : null}
          </>
        )}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <dl className="grid gap-5 sm:grid-cols-2">
            <DetailItem label="Lead">
              {task.lead ? <Link className="text-indigo-700 hover:underline" to={`/leads/${task.lead.id}`}>{task.lead.name}</Link> : '—'}
            </DetailItem>
            <DetailItem label="Assigned">{task.assignedTo?.name}</DetailItem>
            <DetailItem label="Due">{formatDate(task.dueDate)}</DetailItem>
            <DetailItem label="Status"><StatusBadge value={task.status} /></DetailItem>
            <DetailItem label="Completed">{formatDate(task.completedAt)}</DetailItem>
            <DetailItem label="Created">{formatDate(task.createdAt)}</DetailItem>
            <div className="sm:col-span-2">
              <DetailItem label="Description">{task.description || '—'}</DetailItem>
            </div>
          </dl>
        </section>
        <section className="card p-5">
          <h2 className="text-sm font-semibold text-slate-900">Update status</h2>
          {canUpdate ? (
            <div className="mt-3 grid gap-2">
              {TASK_STATUSES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={item.value === task.status ? 'btn-primary justify-start' : 'btn-secondary justify-start'}
                  disabled={saving}
                  onClick={() => changeStatus(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Only the assigned user or an administrator can change this status.</p>
          )}
        </section>
      </div>
      <ConfirmDialog
        open={confirming}
        title="Delete task"
        description="This permanently deletes the task. Lead history is not removed."
        confirmLabel="Delete task"
        loading={deleting}
        onConfirm={remove}
        onClose={() => setConfirming(false)}
      />
    </div>
  );
}

export default TaskDetailPage;