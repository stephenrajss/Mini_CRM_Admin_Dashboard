import { Company } from '../models/Company.js';
import { Lead } from '../models/Lead.js';
import { ApiError } from '../utils/ApiError.js';
import { isAdmin } from '../utils/access.js';
import { normalizeName } from '../utils/names.js';
import { escapeRegex } from '../utils/regex.js';
import { buildPagination, buildSort, skipFor } from '../utils/pagination.js';
import { serializeCompany, serializeLead } from '../utils/serialize.js';

const companyPopulate = { path: 'createdBy', select: 'name email' };
const leadPopulate = [
  { path: 'assignedTo', select: 'name email role' },
  { path: 'company', select: 'name industry location' },
  { path: 'createdBy', select: 'name email' },
];

function assertAdmin(actor) {
  if (!isAdmin(actor)) {
    throw new ApiError(403, 'Only administrators can manage companies');
  }
}

async function assertUniqueName(name, excludeId) {
  const nameNormalized = normalizeName(name);
  const filter = { nameNormalized };
  if (excludeId) filter._id = { $ne: excludeId };
  const existing = await Company.findOne(filter).select('_id');
  if (existing) {
    throw new ApiError(409, 'A company with this name already exists');
  }
  return nameNormalized;
}

export async function listCompanies(query) {
  const filter = {};
  if (query.search) {
    const pattern = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [{ name: pattern }, { industry: pattern }, { location: pattern }];
  }

  const [items, total] = await Promise.all([
    Company.find(filter)
      .populate(companyPopulate)
      .sort(buildSort(query.sortBy, query.sortOrder))
      .skip(skipFor(query.page, query.limit))
      .limit(query.limit)
      .lean(),
    Company.countDocuments(filter),
  ]);

  return {
    items: items.map(serializeCompany),
    pagination: buildPagination(query.page, query.limit, total),
  };
}

export async function listCompanyOptions() {
  const companies = await Company.find().sort({ name: 1 }).select('name').limit(300).lean();
  return companies.map((company) => ({ id: String(company._id), name: company.name }));
}

export async function getCompany(id) {
  const company = await Company.findById(id).populate(companyPopulate).lean();
  if (!company) {
    throw new ApiError(404, 'Company not found');
  }
  return serializeCompany(company);
}

export async function createCompany(payload, actor) {
  assertAdmin(actor);
  const nameNormalized = await assertUniqueName(payload.name);
  try {
    const company = await Company.create({
      name: payload.name,
      nameNormalized,
      industry: payload.industry,
      location: payload.location,
      website: payload.website || '',
      phone: payload.phone || '',
      description: payload.description || '',
      createdBy: actor._id,
    });
    await company.populate(companyPopulate);
    return serializeCompany(company.toObject());
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, 'A company with this name already exists');
    }
    throw error;
  }
}

export async function updateCompany(id, payload, actor) {
  assertAdmin(actor);
  const updates = {};
  if (payload.name !== undefined) {
    updates.name = payload.name;
    updates.nameNormalized = await assertUniqueName(payload.name, id);
  }
  if (payload.industry !== undefined) updates.industry = payload.industry;
  if (payload.location !== undefined) updates.location = payload.location;
  if (payload.website !== undefined) updates.website = payload.website;
  if (payload.phone !== undefined) updates.phone = payload.phone;
  if (payload.description !== undefined) updates.description = payload.description;

  try {
    const company = await Company.findByIdAndUpdate(id, { $set: updates }, {
      new: true,
      runValidators: true,
    }).populate(companyPopulate);
    if (!company) {
      throw new ApiError(404, 'Company not found');
    }
    return serializeCompany(company.toObject());
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, 'A company with this name already exists');
    }
    throw error;
  }
}

export async function listCompanyLeads(companyId, query, actor) {
  const company = await Company.findById(companyId).select('_id');
  if (!company) {
    throw new ApiError(404, 'Company not found');
  }

  const filter = { company: company._id, isDeleted: false };
  if (!isAdmin(actor)) {
    filter.assignedTo = actor._id;
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
