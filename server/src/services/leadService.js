import { Lead } from '../models/Lead.js';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { ApiError } from '../utils/ApiError.js';
import { isAdmin } from '../utils/access.js';
import { escapeRegex } from '../utils/regex.js';
import { buildPagination, buildSort, skipFor } from '../utils/pagination.js';
import { serializeLead } from '../utils/serialize.js';

const leadPopulate = [
  { path: 'assignedTo', select: 'name email role' },
  { path: 'company', select: 'name industry location' },
  { path: 'createdBy', select: 'name email' },
];

function scopedFilter(actor) {
  const filter = { isDeleted: false };
  if (!isAdmin(actor)) {
    filter.assignedTo = actor._id;
  }
  return filter;
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

async function assertCompany(companyId) {
  if (!companyId) return null;
  const company = await Company.findById(companyId).select('_id');
  if (!company) {
    throw new ApiError(422, 'Validation failed', [
      { field: 'company', message: 'Company not found' },
    ]);
  }
  return company._id;
}

async function rejectMissingOrForbidden(id, actor) {
  const existing = await Lead.findById(id).select('isDeleted assignedTo');
  if (!existing || existing.isDeleted) {
    throw new ApiError(404, 'Lead not found');
  }
  if (!isAdmin(actor) && String(existing.assignedTo) !== String(actor._id)) {
    throw new ApiError(403, 'You can only update leads assigned to you');
  }
}

export async function listLeads(query, actor) {
  if (!isAdmin(actor) && query.assignedTo && query.assignedTo !== String(actor._id)) {
    throw new ApiError(403, 'You can only view leads assigned to you');
  }

  const filter = scopedFilter(actor);
  if (query.status) filter.status = query.status;
  if (query.company) filter.company = query.company;
  if (isAdmin(actor) && query.assignedTo) {
    filter.assignedTo = query.assignedTo;
  }
  if (query.search) {
    const pattern = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [{ name: pattern }, { email: pattern }, { phone: pattern }];
  }

  const [items, total] = await Promise.all([
    Lead.find(filter)
      .populate(leadPopulate)
      .sort(buildSort(query.sortBy, query.sortOrder))
      .skip(skipFor(query.page, query.limit))
      .limit(query.limit)
      .lean(),
    Lead.countDocuments(filter),
  ]);

  return {
    items: items.map(serializeLead),
    pagination: buildPagination(query.page, query.limit, total),
  };
}

export async function listLeadOptions(actor) {
  const leads = await Lead.find(scopedFilter(actor))
    .sort({ name: 1 })
    .select('name email status')
    .limit(300)
    .lean();
  return leads.map((lead) => ({
    id: String(lead._id),
    name: lead.name,
    email: lead.email,
    status: lead.status,
  }));
}

export async function getLead(id, actor) {
  const lead = await Lead.findOne({ _id: id, isDeleted: false }).populate(leadPopulate).lean();
  if (!lead) {
    throw new ApiError(404, 'Lead not found');
  }
  const assignedId = lead.assignedTo?._id || lead.assignedTo;
  if (!isAdmin(actor) && String(assignedId) !== String(actor._id)) {
    throw new ApiError(403, 'You can only view leads assigned to you');
  }
  return serializeLead(lead);
}

export async function createLead(payload, actor) {
  if (!isAdmin(actor)) {
    throw new ApiError(403, 'Only administrators can create leads');
  }
  const assignedTo = await assertAssignee(payload.assignedTo);
  const company = await assertCompany(payload.company);

  try {
    const lead = await Lead.create({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      status: payload.status,
      assignedTo,
      company,
      notes: payload.notes || '',
      createdBy: actor._id,
    });
    await lead.populate(leadPopulate);
    return serializeLead(lead.toObject());
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, 'A lead with this email already exists');
    }
    throw error;
  }
}

export async function updateLead(id, payload, actor) {
  const existing = await Lead.findById(id).select('isDeleted assignedTo');
  if (!existing || existing.isDeleted) {
    throw new ApiError(404, 'Lead not found');
  }
  if (!isAdmin(actor) && String(existing.assignedTo) !== String(actor._id)) {
    throw new ApiError(403, 'You can only update leads assigned to you');
  }
  if (!isAdmin(actor) && payload.assignedTo && payload.assignedTo !== String(existing.assignedTo)) {
    throw new ApiError(403, 'You cannot reassign leads');
  }

  const updates = {};
  if (payload.name !== undefined) updates.name = payload.name;
  if (payload.email !== undefined) updates.email = payload.email;
  if (payload.phone !== undefined) updates.phone = payload.phone;
  if (payload.status !== undefined) updates.status = payload.status;
  if (payload.notes !== undefined) updates.notes = payload.notes;
  if (payload.company !== undefined) updates.company = await assertCompany(payload.company);
  if (isAdmin(actor) && payload.assignedTo !== undefined) {
    updates.assignedTo = await assertAssignee(payload.assignedTo);
  }

  const filter = { _id: id, isDeleted: false };
  if (!isAdmin(actor)) {
    filter.assignedTo = actor._id;
  }

  try {
    const lead = await Lead.findOneAndUpdate(filter, { $set: updates }, {
      new: true,
      runValidators: true,
    }).populate(leadPopulate);
    if (!lead) {
      await rejectMissingOrForbidden(id, actor);
      throw new ApiError(404, 'Lead not found');
    }
    return serializeLead(lead.toObject());
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, 'A lead with this email already exists');
    }
    throw error;
  }
}

export async function updateLeadStatus(id, status, actor) {
  const filter = { _id: id, isDeleted: false };
  if (!isAdmin(actor)) {
    filter.assignedTo = actor._id;
  }

  const lead = await Lead.findOneAndUpdate(
    filter,
    { $set: { status } },
    { new: true, runValidators: true },
  ).populate(leadPopulate);

  if (!lead) {
    await rejectMissingOrForbidden(id, actor);
    throw new ApiError(404, 'Lead not found');
  }
  return serializeLead(lead.toObject());
}

export async function softDeleteLead(id, actor) {
  if (!isAdmin(actor)) {
    throw new ApiError(403, 'Only administrators can delete leads');
  }
  const lead = await Lead.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isDeleted: true, deletedAt: new Date() } },
    { new: true },
  );
  if (!lead) {
    throw new ApiError(404, 'Lead not found');
  }
}
