import api from './client';
import { cleanParams } from '../utils/cleanParams';

export const leadsApi = {
  list: (params, config) => api.get('/api/leads',
    {
      params: cleanParams(params),
      ...config
    }
  ),
  options: (config) => api.get('/api/leads/options', config),
  get: (id, config) => api.get(`/api/leads/${id}`, config),
  create: (body) => api.post('/api/leads', body),
  update: (id, body) => api.patch(`/api/leads/${id}`, body),
  updateStatus: (id, status) => api.patch(`/api/leads/${id}/status`, { status }),
  remove: (id) => api.delete(`/api/leads/${id}`),
};
