import api from './client';
import { cleanParams } from '../utils/cleanParams';

export const usersApi = {
  list: (params, config) => api.get('/api/users',
    {
      params: cleanParams(params),
      ...config
    }
  ),
  options: (config) => api.get('/api/users/options', config),
  get: (id, config) => api.get(`/api/users/${id}`, config),
  create: (body) => api.post('/api/users', body),
  update: (id, body) => api.patch(`/api/users/${id}`, body),
  setActive: (id, isActive) => api.patch(`/api/users/${id}/active`, { isActive }),
};
