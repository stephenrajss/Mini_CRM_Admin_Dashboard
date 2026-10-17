export const LEAD_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'lost', label: 'Lost' },
];

export const TASK_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export const USER_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User' },
];

export const DUE_FILTERS = [
  { value: 'today', label: 'Due today' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'upcoming', label: 'Upcoming' },
];

const LABELS = Object.fromEntries(
  [...LEAD_STATUSES, ...TASK_STATUSES, ...USER_ROLES].map((item) => [item.value, item.label]),
);

export function statusLabel(value) {
  return LABELS[value] || value || '—';
}
