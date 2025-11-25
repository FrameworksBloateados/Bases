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
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const isAuthenticated = !!accessToken;

  // Try to refresh token on mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const token = await refreshToken();
        if (!cancelled) setAccessToken(token);
      } catch {
        if (!cancelled) setAccessToken(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const register = async (email: string, password: string) => {
    try {
      const token = await registerUser({email, password});
      setAccessToken(token);
    } catch (error) {
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const token = await loginUser({email, password});
      setAccessToken(token);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setAccessToken(null);
    } catch (error) {
      throw error;
    }
  };

  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    let token = accessToken;

    // If no token, try to refresh
    if (!token) {
      try {
        token = await refreshToken();
        setAccessToken(token);
      } catch {
        throw new Error('No access token available and refresh failed');
      }
    }

    // Ensure token is available
    if (!token) {
      throw new Error('No access token available after refresh');
    }

    try {
      return await authenticatedFetchUser(url, token, options);
    } catch (error) {
      // If 401, try to refresh token and retry
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
