import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { isAdmin } from '../utils/access.js';
import { escapeRegex } from '../utils/regex.js';
import { buildPagination, buildSort, skipFor } from '../utils/pagination.js';
import { serializeUser } from '../utils/serialize.js';

export function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

function assertAdmin(actor) {
  if (!isAdmin(actor)) {
    throw new ApiError(403, 'Only administrators can manage users');
  }
}

async function assertAnotherActiveAdmin(excludeId) {
  const count = await User.countDocuments({
    role: 'admin',
    isActive: true,
    _id: { $ne: excludeId },
  });
  if (count === 0) {
    throw new ApiError(400, 'At least one active administrator is required');
  }
}

export async function listUsers(query, actor) {
  assertAdmin(actor);
  const filter = {};
  if (query.role) filter.role = query.role;
  if (typeof query.isActive === 'boolean') filter.isActive = query.isActive;
  if (query.search) {
    const pattern = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [{ name: pattern }, { email: pattern }];
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .sort(buildSort(query.sortBy, query.sortOrder))
      .skip(skipFor(query.page, query.limit))
      .limit(query.limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    items: items.map(serializeUser),
    pagination: buildPagination(query.page, query.limit, total),
  };
}

export async function listUserOptions() {
  const users = await User.find({ isActive: true })
    .sort({ name: 1 })
    .select('name email role')
    .limit(200)
    .lean();

  return users.map((user) => ({
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  }));
}

export async function getUser(id, actor) {
  assertAdmin(actor);
  const user = await User.findById(id).lean();
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return serializeUser(user);
}

export async function createUser(payload, actor) {
  assertAdmin(actor);
  const existing = await User.findOne({ email: payload.email }).select('_id');
  if (existing) {
    throw new ApiError(409, 'A user with this email already exists');
  }

  const user = await User.create({
    name: payload.name,
    email: payload.email,
    passwordHash: await hashPassword(payload.password),
    role: payload.role,
    isActive: true,
  });
  return serializeUser(user);
}

export async function updateUser(id, payload, actor) {
  assertAdmin(actor);
  const user = await User.findById(id).select('+passwordHash');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const demotingAdmin = payload.role && payload.role !== 'admin' && user.role === 'admin';
  if (demotingAdmin && String(user._id) === String(actor._id)) {
    throw new ApiError(400, 'You cannot remove your own administrator role');
  }
  if (demotingAdmin) await assertAnotherActiveAdmin(user._id);

  if (payload.name !== undefined) user.name = payload.name;
  if (payload.email !== undefined) user.email = payload.email;
  if (payload.role !== undefined) user.role = payload.role;
  if (payload.password) user.passwordHash = await hashPassword(payload.password);

  try {
    await user.save();
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, 'A user with this email already exists');
    }
    throw error;
  }

  return serializeUser(user);
}

export async function setUserActive(id, isActive, actor) {
  assertAdmin(actor);
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (!isActive && String(user._id) === String(actor._id)) {
    throw new ApiError(400, 'You cannot deactivate your own account');
  }
  if (!isActive && user.role === 'admin') {
    await assertAnotherActiveAdmin(user._id);
  }

  user.isActive = isActive;
  await user.save();
  return serializeUser(user);
}
