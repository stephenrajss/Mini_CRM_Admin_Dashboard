import axios from 'axios';
import { clearUserInfo, getUserInfo } from './storage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const userInfo = getUserInfo();
  if (userInfo?.token) {
    config.headers.set('Authorization', `Bearer ${userInfo.token}`);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthAttempt = url.includes('/auth/login') || url.includes('/auth/me');

    if (status === 401 && !isAuthAttempt) {
      clearUserInfo();
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  },
);

export default api;
