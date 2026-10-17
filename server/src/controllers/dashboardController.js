import * as dashboardService from '../services/dashboardService.js';
import { sendSuccess } from '../utils/response.js';

export async function getSummary(req, res) {
  const data = await dashboardService.getSummary(req.user);
  sendSuccess(res, { message: 'Dashboard summary retrieved successfully', data });
}

export async function getLeadsByStatus(req, res) {
  const data = await dashboardService.getLeadsByStatus(req.user);
  sendSuccess(res, { message: 'Lead status summary retrieved successfully', data });
}

export async function getRecentActivity(req, res) {
  const data = await dashboardService.getRecentActivity(req.user);
  sendSuccess(res, { message: 'Recent activity retrieved successfully', data });
}
