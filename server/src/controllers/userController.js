import * as userService from '../services/userService.js';
import { sendSuccess } from '../utils/response.js';

export async function listUsers(req, res) {
  const result = await userService.listUsers(req.validated.query, req.user);
  sendSuccess(res, {
    message: 'Users retrieved successfully',
    data: result.items,
    pagination: result.pagination,
  });
}

export async function listUserOptions(_req, res) {
  const data = await userService.listUserOptions();
  sendSuccess(res, { message: 'User options retrieved successfully', data });
}

export async function getUser(req, res) {
  const data = await userService.getUser(req.params.id, req.user);
  sendSuccess(res, { message: 'User retrieved successfully', data });
}

export async function createUser(req, res) {
  const data = await userService.createUser(req.validated.body, req.user);
  sendSuccess(res, { status: 201, message: 'User created successfully', data });
}

export async function updateUser(req, res) {
  const data = await userService.updateUser(req.params.id, req.validated.body, req.user);
  sendSuccess(res, { message: 'User updated successfully', data });
}

export async function setUserActive(req, res) {
  const data = await userService.setUserActive(req.params.id, req.validated.body.isActive, req.user);
  sendSuccess(res, { message: 'User status updated successfully', data });
}
