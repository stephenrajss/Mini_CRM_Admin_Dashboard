import api from './client';

export const dashboardApi = {
  summary: (config) => api.get('/api/dashboard/summary', config),
};
