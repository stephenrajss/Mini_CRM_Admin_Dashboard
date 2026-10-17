import api from './client';
import { cleanParams } from '../utils/cleanParams';

export const tasksApi = {
  list: (params, config) => api.get('/api/tasks',
    {
      params: cleanParams(params),
      ...config
    }
  ),
  get: (id, config) => api.get(`/api/tasks/${id}`, config),
  create: (body) => api.post('/api/tasks', body),
  update: (id, body) => api.patch(`/api/tasks/${id}`, body),
  updateStatus: (id, status) => api.patch(`/api/tasks/${id}/status`, { status }),
  remove: (id) => api.delete(`/api/tasks/${id}`),
};
