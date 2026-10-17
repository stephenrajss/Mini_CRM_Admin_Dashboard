import api from './client';
import { cleanParams } from '../utils/cleanParams';

export const companiesApi = {
  list: (params, config) => api.get('/api/companies', { params: cleanParams(params), ...config }),
  options: (config) => api.get('/api/companies/options', config),
  get: (id, config) => api.get(`/api/companies/${id}`, config),
  leads: (id, params, config) => api.get(`/api/companies/${id}/leads`, { params: cleanParams(params), ...config }),
  create: (body) => api.post('/api/companies', body),
  update: (id, body) => api.patch(`/api/companies/${id}`, body),
};
