import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { authApi } from '../api/auth';
import { clearUserInfo, getUserInfo, setUserInfo } from '../api/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');

  const refresh = useCallback(async () => {
    const stored = getUserInfo();
    if (!stored?.token) {
      setUser(null);
      setStatus('guest');
      return;
    }

    try {
      const response = await authApi.me();
      const profile = response.data.data.user;
      setUserInfo({
        ...stored,
        ...profile,
        token: stored.token,
      });
      setUser(profile);
      setStatus('authenticated');
    } catch {
      clearUserInfo();
      setUser(null);
      setStatus('guest');
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearUserInfo();
      setUser(null);
      setStatus('guest');
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback(async (payload) => {
    const response = await authApi.login(payload);
    setUser(response.data.data.user);
    setStatus('authenticated');
    return response.data.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      clearUserInfo();
    } finally {
      setUser(null);
      setStatus('guest');
    }
  }, []);

  const value = useMemo(
    () => ({ user, status, login, logout, refresh }),
    [user, status, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
