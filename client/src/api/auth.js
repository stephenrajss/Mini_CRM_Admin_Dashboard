import api from './client';
import { clearUserInfo, setUserInfo } from './storage';

export const authApi = {
  login: async (body) => {
    const response = await api.post('/api/auth/login', body);
    const { token, user } = response.data.data;
    
    if (token && user) {
      setUserInfo({ token, ...user });
    }
    return response;
  },
  logout: async () => {
    try {
      return await api.post('/api/auth/logout');
    } finally {
      clearUserInfo();
    }
  },
  me: () => api.get('/api/auth/me'),
};
