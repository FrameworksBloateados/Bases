import {createContext, useContext, useEffect, useState} from 'react';
import React from 'react';
import {
  register as registerUser,
  login as loginUser,
  logout as logoutUser,
  authenticatedFetch as authenticatedFetchUser,
  refreshToken,
  HttpError,
} from '../utils/Auth';

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initializeSession = async () => {
    try {
      const token = await refreshToken();
      setAccessToken(token);
    } catch {
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeSession();
  }, []);

  const isAuthenticated = Boolean(accessToken);

  const register = async (email: string, password: string) => {
    const token = await registerUser({email, password});
    setAccessToken(token);
  };

  const login = async (email: string, password: string) => {
    const token = await loginUser({email, password});
    setAccessToken(token);
  };

  const logout = async () => {
    await logoutUser();
    setAccessToken(null);
  };

  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const token = accessToken;
    if (!token) {
      throw new Error('No authenticated user');
    }
    try {
      return await authenticatedFetchUser(url, token, options);
    } catch (error) {
      if (error instanceof HttpError && error.status === 401) {
        const newToken = await refreshToken();
        setAccessToken(newToken);
        return authenticatedFetchUser(url, newToken, options);
      }
      throw error;
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    register,
    login,
    logout,
    authenticatedFetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
