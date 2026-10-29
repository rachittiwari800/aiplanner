import api from './api';
import type { User } from '../types';


export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    user: User;
  };
}

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async googleAuth(payload: { credential?: string; googleId?: string; email?: string; name?: string; avatarUrl?: string }): Promise<AuthResponse> {
    const response = await api.post('/auth/google', payload);
    return response.data;
  },

  async getProfile(): Promise<{ success: boolean; data?: { user: User } }> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updateProfile(name: string): Promise<{ success: boolean; data?: { user: User } }> {
    const response = await api.patch('/auth/me', { name });
    return response.data;
  },
};
