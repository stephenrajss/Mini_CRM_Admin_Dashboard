import * as leadService from '../services/leadService.js';
import { sendSuccess } from '../utils/response.js';

export async function listLeads(req, res) {
  const result = await leadService.listLeads(req.validated.query, req.user);
  sendSuccess(res, {
    message: 'Leads retrieved successfully',
    data: result.items,
    pagination: result.pagination,
  });
}

export async function listLeadOptions(req, res) {
  const data = await leadService.listLeadOptions(req.user);
  sendSuccess(res, { message: 'Lead options retrieved successfully', data });
}

export async function getLead(req, res) {
  const data = await leadService.getLead(req.params.id, req.user);
  sendSuccess(res, { message: 'Lead retrieved successfully', data });
}

export async function createLead(req, res) {
  const data = await leadService.createLead(req.validated.body, req.user);
  sendSuccess(res, { status: 201, message: 'Lead created successfully', data });
}

export async function updateLead(req, res) {
  const data = await leadService.updateLead(req.params.id, req.validated.body, req.user);
  sendSuccess(res, { message: 'Lead updated successfully', data });
}

export async function updateLeadStatus(req, res) {
  const data = await leadService.updateLeadStatus(req.params.id, req.validated.body.status, req.user);
  sendSuccess(res, { message: 'Lead status updated successfully', data });
}

export async function deleteLead(req, res) {
  await leadService.softDeleteLead(req.params.id, req.user);
  sendSuccess(res, { message: 'Lead deleted successfully', data: null });
}
