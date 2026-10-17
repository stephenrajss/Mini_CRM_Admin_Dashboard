import { Lead } from '../models/Lead.js';
import { Task } from '../models/Task.js';
import { getEnv } from '../config/env.js';
import { LEAD_STATUSES } from '../config/constants.js';
import { isAdmin } from '../utils/access.js';
import { getZonedDayBounds } from '../utils/date.js';
import { serializeLead, serializeTask } from '../utils/serialize.js';

const leadPopulate = [
  { path: 'assignedTo', select: 'name email role' },
  { path: 'company', select: 'name industry location' },
];

const taskPopulate = [
  { path: 'lead', select: 'name email status' },
  { path: 'assignedTo', select: 'name email role' },
];

function leadMatch(actor) {
  const match = { isDeleted: false };
  if (!isAdmin(actor)) {
    match.assignedTo = actor._id;
  }
  return match;
}

function taskMatch(actor) {
  if (isAdmin(actor)) {
    return {};
  }
  return { assignedTo: actor._id };
}

export async function getSummary(actor) {
  const leadsFilter = leadMatch(actor);
  const tasksFilter = taskMatch(actor);
  const { start, end } = getZonedDayBounds(getEnv().APP_TIMEZONE);

  const [grouped, tasksDueToday, completedTasks, recentLeads, upcomingTasks, overdueTasks, recentActivity] =
    await Promise.all([
      Lead.aggregate([
        { $match: leadsFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.countDocuments({
        ...tasksFilter,
        dueDate: { $gte: start, $lt: end },
      }),
      Task.countDocuments({
        ...tasksFilter,
        status: 'completed',
      }),
      Lead.find(leadsFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate(leadPopulate)
        .lean(),
      Task.find({
        ...tasksFilter,
        status: { $ne: 'completed' },
        dueDate: { $gte: start },
      })
        .sort({ dueDate: 1 })
        .limit(5)
        .populate(taskPopulate)
        .lean(),
      Task.find({
        ...tasksFilter,
        status: { $ne: 'completed' },
        dueDate: { $lt: start },
      })
        .sort({ dueDate: 1 })
        .limit(5)
        .populate(taskPopulate)
        .lean(),
      Task.find(tasksFilter)
        .sort({ updatedAt: -1 })
        .limit(6)
        .populate(taskPopulate)
        .lean(),
    ]);

  const counts = Object.fromEntries(grouped.map((row) => [row._id, row.count]));
  const leadsByStatus = LEAD_STATUSES.map((status) => ({
    status,
    count: counts[status] || 0,
  }));
  const totalActiveLeads = leadsByStatus.reduce((sum, row) => sum + row.count, 0);

  return {
    totalActiveLeads,
    qualifiedLeads: counts.qualified || 0,
    tasksDueToday,
    completedTasks,
    leadsByStatus,
    recentLeads: recentLeads.map(serializeLead),
    upcomingTasks: upcomingTasks.map(serializeTask),
    overdueTasks: overdueTasks.map(serializeTask),
    recentActivity: recentActivity.map(serializeTask),
  };
}

export async function getLeadsByStatus(actor) {
  const summary = await getSummary(actor);
  return summary.leadsByStatus;
}

export async function getRecentActivity(actor) {
  const summary = await getSummary(actor);
  return summary.recentActivity;
}
