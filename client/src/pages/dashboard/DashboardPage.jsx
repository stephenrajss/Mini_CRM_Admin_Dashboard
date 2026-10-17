import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CheckCircle2, Clock3, Target, Users } from 'lucide-react';

import { dashboardApi } from '../../api/dashboard';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { ErrorState } from '../../components/ErrorState';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { useAuth } from '../../context/AuthContext';
import { statusLabel } from '../../utils/constants';
import { formatDate, isOverdue } from '../../utils/format';
import { getErrorMessage } from '../../utils/errors';

export function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    dashboardApi.summary()
      .then((response) => {
        setSummary(response.data.data);
        setError('');
      })
      .catch((err) => setError(getErrorMessage(err) || 'Unable to load the dashboard'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const chartData = (summary?.leadsByStatus || []).map((row) => ({
    label: statusLabel(row.status),
    count: row.count,
  }));

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={user?.role === 'admin'
          ? 'Pipeline and task totals across the workspace.'
          : 'Your assigned leads and tasks.'}
      />
      {loading ? <div className="card"><SkeletonLoader rows={4} /></div> : null}
      {error ? <div className="card"><ErrorState message={error} onRetry={load} /></div> : null}
      {summary ? (
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Active leads" value={summary.totalActiveLeads} hint="Excludes deleted leads" icon={Users} />
            <StatCard label="Qualified leads" value={summary.qualifiedLeads} hint="Status is qualified" icon={Target} />
            <StatCard label="Tasks due today" value={summary.tasksDueToday} hint="Any status, current UTC day" icon={Clock3} />
            <StatCard label="Completed tasks" value={summary.completedTasks} hint="Status is completed" icon={CheckCircle2} />
          </section>
          <section className="grid gap-4 xl:grid-cols-5">
            <article className="card min-w-0 p-5 xl:col-span-3">
              <h2 className="text-sm font-semibold text-slate-900">Leads by status</h2>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
            <article className="card p-5 xl:col-span-2">
              <h2 className="text-sm font-semibold text-slate-900">Recent leads</h2>
              <ul className="mt-3 divide-y divide-slate-100">
                {summary.recentLeads.length === 0 ? <li className="py-6 text-sm text-slate-500">No leads yet.</li> : null}
                {summary.recentLeads.map((lead) => (
                  <li key={lead.id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <Link to={`/leads/${lead.id}`} className="text-sm font-medium text-slate-900 hover:text-indigo-700">{lead.name}</Link>
                      <p className="text-xs text-slate-500">{lead.company?.name || 'No company'}</p>
                    </div>
                    <StatusBadge value={lead.status} />
                  </li>
                ))}
              </ul>
            </article>
          </section>
          <section className="grid gap-4 lg:grid-cols-3">
            <TaskList title="Upcoming tasks" tasks={summary.upcomingTasks} empty="No upcoming tasks." />
            <TaskList title="Overdue tasks" tasks={summary.overdueTasks} empty="No overdue tasks." />
            <TaskList title="Recent activity" tasks={summary.recentActivity} empty="No task activity yet." showUpdated />
          </section>
        </div>
      ) : null}
    </div>
  );
}

function TaskList({ title, tasks, empty, showUpdated = false }) {
  return (
    <article className="card p-5">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <ul className="mt-3 divide-y divide-slate-100">
        {tasks.length === 0 ? <li className="py-6 text-sm text-slate-500">{empty}</li> : null}
        {tasks.map((task) => (
          <li key={task.id} className="py-3">
            <div className="flex items-start justify-between gap-3">
              <Link to={`/tasks/${task.id}`} className="text-sm font-medium text-slate-900 hover:text-indigo-700">{task.title}</Link>
              <StatusBadge value={task.status} />
            </div>
            <p className={`mt-1 text-xs ${isOverdue(task.dueDate, task.status) ? 'text-rose-600' : 'text-slate-500'}`}>
              {task.lead?.name || 'Lead'} · {showUpdated ? `Updated ${formatDate(task.updatedAt)}` : `Due ${formatDate(task.dueDate)}`}
            </p>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default DashboardPage;