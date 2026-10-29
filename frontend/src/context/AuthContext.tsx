import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '../types';
import axios from 'axios';

import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (payload: { credential?: string; googleId?: string; email?: string; name?: string; avatarUrl?: string }) => Promise<void>;
  logout: () => void;
  setAuthData: (user: User, token: string) => void;
  updateUser: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const applyAuthSession = (nextUser: User, nextToken: string) => {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem('auth_token', nextToken);
  };

  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        try {
          const res = await authService.getProfile();
          if (!cancelled && res.success && res.data?.user) {
            setUser(res.data.user);
            setToken(storedToken);
          }
        } catch (error) {
          const status = axios.isAxiosError(error) ? error.response?.status : undefined;
          if (!cancelled && (status === 401 || status === 403 || status === 404 || status === undefined || status >= 500)) {
            localStorage.removeItem('auth_token');
            setToken(null);
            setUser(null);
          }
        }
      }
      if (!cancelled) setIsInitializing(false);
    };

    void initAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login(normalizeEmail(email), password);
      if (!res.success || !res.data?.token || !res.data.user) {
        throw new Error(res.message || 'Login failed');
      }
      applyAuthSession(res.data.user, res.data.token);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Unable to reach the backend.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authService.register(name.trim(), normalizeEmail(email), password);
      if (!res.success || !res.data?.token || !res.data.user) {
        throw new Error(res.message || 'Registration failed');
      }
      applyAuthSession(res.data.user, res.data.token);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Unable to reach the backend.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (payload: { credential?: string; googleId?: string; email?: string; name?: string; avatarUrl?: string }) => {
    setIsLoading(true);
    try {
      const res = await authService.googleAuth(payload);
      if (!res.success || !res.data?.token || !res.data.user) {
        throw new Error(res.message || 'Google authentication failed');
      }
      applyAuthSession(res.data.user, res.data.token);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Unable to authenticate with Google.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
  };

  const setAuthData = (newUser: User, newToken: string) => {
    applyAuthSession(newUser, newToken);
  };

  const updateUser = async (name: string) => {
    const response = await authService.updateProfile(name);
    if (!response.success || !response.data?.user) throw new Error('Could not update profile');
    setUser(response.data.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isInitializing,
        login,
        loginWithGoogle,
        register,
        logout,
        setAuthData,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
