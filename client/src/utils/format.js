export function formatDate(value) {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function toDateInput(value) {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString().slice(0, 10);
}

export function fromDateInput(value) {
  if (!value) {
    return '';
  }
  return `${value}T12:00:00.000Z`;
}

export function isOverdue(dueDate, status) {
  if (!dueDate || status === 'completed') {
    return false;
  }
  const due = new Date(dueDate);
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  return due < todayStart;
}
