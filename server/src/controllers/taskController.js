import * as taskService from '../services/taskService.js';
import { sendSuccess } from '../utils/response.js';

export async function listTasks(req, res) {
  const result = await taskService.listTasks(req.validated.query, req.user);
  sendSuccess(res, {
    message: 'Tasks retrieved successfully',
    data: result.items,
    pagination: result.pagination,
  });
}

export async function getTask(req, res) {
  const data = await taskService.getTask(req.params.id, req.user);
  sendSuccess(res, { message: 'Task retrieved successfully', data });
}

export async function createTask(req, res) {
  const data = await taskService.createTask(req.validated.body, req.user);
  sendSuccess(res, { status: 201, message: 'Task created successfully', data });
}

export async function updateTask(req, res) {
  const data = await taskService.updateTask(req.params.id, req.validated.body, req.user);
  sendSuccess(res, { message: 'Task updated successfully', data });
}

export async function updateTaskStatus(req, res) {
  const data = await taskService.updateTaskStatus(req.params.id, req.validated.body.status, req.user);
  sendSuccess(res, { message: 'Task status updated successfully', data });
}

export async function deleteTask(req, res) {
  await taskService.deleteTask(req.params.id, req.user);
  sendSuccess(res, { message: 'Task deleted successfully', data: null });
}
