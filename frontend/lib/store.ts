import { create } from 'zustand';
import Cookies from 'js-cookie';
import { authAPI } from './api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (username: string, password: string) => {
    try {
      const response = await authAPI.login({ username, password });
      const { user, tokens } = response.data;
      
      Cookies.set('access_token', tokens.access);
      Cookies.set('refresh_token', tokens.refresh);
      
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  },

  register: async (data: any) => {
    try {
      const response = await authAPI.register(data);
      const { user, tokens } = response.data;
      
      Cookies.set('access_token', tokens.access);
      Cookies.set('refresh_token', tokens.refresh);
      
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  },

  logout: () => {
    const refreshToken = Cookies.get('refresh_token');
    if (refreshToken) {
      authAPI.logout({ refresh: refreshToken }).catch(() => {});
    }
    
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  loadUser: async () => {
    const token = Cookies.get('access_token');
    if (!token) {
      set({ isLoading: false });
      return;
    }

    try {
      const response = await authAPI.getProfile();
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));



