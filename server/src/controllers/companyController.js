import * as companyService from '../services/companyService.js';
import { sendSuccess } from '../utils/response.js';

export async function listCompanies(req, res) {
  const result = await companyService.listCompanies(req.validated.query);
  sendSuccess(res, {
    message: 'Companies retrieved successfully',
    data: result.items,
    pagination: result.pagination,
  });
}

export async function listCompanyOptions(_req, res) {
  const data = await companyService.listCompanyOptions();
  sendSuccess(res, { message: 'Company options retrieved successfully', data });
}

export async function getCompany(req, res) {
  const data = await companyService.getCompany(req.params.id);
  sendSuccess(res, { message: 'Company retrieved successfully', data });
}

export async function createCompany(req, res) {
  const data = await companyService.createCompany(req.validated.body, req.user);
  sendSuccess(res, { status: 201, message: 'Company created successfully', data });
}

export async function updateCompany(req, res) {
  const data = await companyService.updateCompany(req.params.id, req.validated.body, req.user);
  sendSuccess(res, { message: 'Company updated successfully', data });
}

export async function listCompanyLeads(req, res) {
  const result = await companyService.listCompanyLeads(req.params.id, req.validated.query, req.user);
  sendSuccess(res, {
    message: 'Company leads retrieved successfully',
    data: result.items,
    pagination: result.pagination,
  });
}
