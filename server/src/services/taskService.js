import { Task } from '../models/Task.js';
import { Lead } from '../models/Lead.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { isAdmin } from '../utils/access.js';
import { escapeRegex } from '../utils/regex.js';
import { buildPagination, buildSort, skipFor } from '../utils/pagination.js';
import { getZonedDayBounds } from '../utils/date.js';
import { getEnv } from '../config/env.js';
import { serializeTask } from '../utils/serialize.js';

const taskPopulate = [
  { path: 'lead', select: 'name email status isDeleted' },
  { path: 'assignedTo', select: 'name email role' },
  { path: 'createdBy', select: 'name email' },
];

function assertAdmin(actor) {
  if (!isAdmin(actor)) {
    throw new ApiError(403, 'Only administrators can manage tasks');
  }
}

async function assertAssignee(userId) {
  const user = await User.findOne({ _id: userId, isActive: true }).select('_id');
  if (!user) {
    throw new ApiError(422, 'Validation failed', [
      { field: 'assignedTo', message: 'Assigned user must be an active user' },
    ]);
  }
  return user._id;
}

async function assertLead(leadId) {
  const lead = await Lead.findOne({ _id: leadId, isDeleted: false }).select('_id');
  if (!lead) {
    throw new ApiError(422, 'Validation failed', [
      { field: 'lead', message: 'Lead must exist and must not be deleted' },
    ]);
  }
  return lead._id;
}

function statusWrite(status) {
  if (status === 'completed') {
    return { $set: { status, completedAt: new Date() } };
  }
  return { $set: { status }, $unset: { completedAt: 1 } };
}

async function rejectMissingOrForbidden(id, actor) {
  const existing = await Task.findById(id).select('assignedTo');
  if (!existing) {
    throw new ApiError(404, 'Task not found');
  }
  if (!isAdmin(actor) && String(existing.assignedTo) !== String(actor._id)) {
    throw new ApiError(403, 'You can only update tasks assigned to you');
  }
}

export async function listTasks(query, actor) {
  if (!isAdmin(actor) && query.assignedTo && query.assignedTo !== String(actor._id)) {
    throw new ApiError(403, 'You can only view tasks assigned to you');
  }

  const filter = {};
  if (!isAdmin(actor)) {
    filter.assignedTo = actor._id;
  }
  if (isAdmin(actor) && query.assignedTo) {
    filter.assignedTo = query.assignedTo;
  }
  if (query.lead) filter.lead = query.lead;

  const { start, end } = getZonedDayBounds(getEnv().APP_TIMEZONE);
  if (query.due === 'today') {
    filter.dueDate = { $gte: start, $lt: end };
    if (query.status) filter.status = query.status;
  } else if (query.due === 'overdue') {
    filter.dueDate = { $lt: start };
    if (query.status === 'completed') {
      filter.status = { $in: [] };
    } else if (query.status) {
      filter.status = query.status;
    } else {
      filter.status = { $ne: 'completed' };
    }
  } else if (query.due === 'upcoming') {
    filter.dueDate = { $gte: start };
    if (query.status === 'completed') {
      filter.status = { $in: [] };
    } else if (query.status) {
      filter.status = query.status;
    } else {
      filter.status = { $ne: 'completed' };
    }
  } else if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    const pattern = new RegExp(escapeRegex(query.search), 'i');
    const leads = await Lead.find({ name: pattern }).select('_id').lean();
    filter.$or = [{ title: pattern }, { lead: { $in: leads.map((lead) => lead._id) } }];
  }

  const [items, total] = await Promise.all([
    Task.find(filter)
      .populate(taskPopulate)
      .sort(buildSort(query.sortBy, query.sortOrder))
      .skip(skipFor(query.page, query.limit))
      .limit(query.limit)
      .lean(),
    Task.countDocuments(filter),
  ]);

  return {
    items: items.map(serializeTask),
    pagination: buildPagination(query.page, query.limit, total),
  };
}

export async function getTask(id, actor) {
  const task = await Task.findById(id).populate(taskPopulate).lean();
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }
  const assignedId = task.assignedTo?._id || task.assignedTo;
  if (!isAdmin(actor) && String(assignedId) !== String(actor._id)) {
    throw new ApiError(403, 'You can only view tasks assigned to you');
  }
  return serializeTask(task);
}

export async function createTask(payload, actor) {
  assertAdmin(actor);
  const lead = await assertLead(payload.lead);
  const assignedTo = await assertAssignee(payload.assignedTo);
  const status = payload.status || 'pending';

  const task = await Task.create({
    title: payload.title,
    description: payload.description || '',
    lead,
    assignedTo,
    dueDate: payload.dueDate,
    status,
    createdBy: actor._id,
    completedAt: status === 'completed' ? new Date() : null,
  });
  await task.populate(taskPopulate);
  return serializeTask(task.toObject());
}

export async function updateTask(id, payload, actor) {
  assertAdmin(actor);
  const existing = await Task.findById(id);
  if (!existing) {
    throw new ApiError(404, 'Task not found');
  }

  const updates = {};
  const unsets = {};
  if (payload.title !== undefined) updates.title = payload.title;
  if (payload.description !== undefined) updates.description = payload.description;
  if (payload.dueDate !== undefined) updates.dueDate = payload.dueDate;
  if (payload.lead !== undefined) updates.lead = await assertLead(payload.lead);
  if (payload.assignedTo !== undefined) updates.assignedTo = await assertAssignee(payload.assignedTo);
  if (payload.status !== undefined) {
    updates.status = payload.status;
    if (payload.status === 'completed') updates.completedAt = new Date();
    else unsets.completedAt = 1;
  }

  const write = { $set: updates };
  if (Object.keys(unsets).length) write.$unset = unsets;

  const task = await Task.findByIdAndUpdate(id, write, {
    new: true,
    runValidators: true,
  }).populate(taskPopulate);
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }
  return serializeTask(task.toObject());
}

export async function updateTaskStatus(id, status, actor) {
  const filter = { _id: id };
  if (!isAdmin(actor)) {
    filter.assignedTo = actor._id;
  }

  const task = await Task.findOneAndUpdate(filter, statusWrite(status), {
    new: true,
    runValidators: true,
  }).populate(taskPopulate);

  if (!task) {
    await rejectMissingOrForbidden(id, actor);
    throw new ApiError(404, 'Task not found');
  }
  return serializeTask(task.toObject());
}

export async function deleteTask(id, actor) {
  assertAdmin(actor);
  const task = await Task.findByIdAndDelete(id);
  if (!task) throw new ApiError(404, 'Task not found');
}
