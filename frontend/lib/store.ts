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
  role?: 'admin' | 'instructor' | 'student';
  is_instructor?: boolean;
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
      return user; // Return user for redirect logic
    } catch (error: any) {
      // Extract detailed error messages from backend
      let errorMessage = 'Login failed';
      
      if (error.response?.data) {
        const data = error.response.data;
        
        // Handle different error formats
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
          errorMessage = data.non_field_errors.join('. ');
        } else if (typeof data === 'object') {
          // Try to extract any error message
          const errorKeys = Object.keys(data);
          if (errorKeys.length > 0) {
            const firstError = data[errorKeys[0]];
            if (Array.isArray(firstError)) {
              errorMessage = firstError.join('. ');
            } else if (typeof firstError === 'string') {
              errorMessage = firstError;
            }
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
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
      // Extract detailed error messages from backend
      let errorMessage = 'Registration failed';
      
      if (error.response?.data) {
        const data = error.response.data;
        
        // Handle field-specific errors
        if (typeof data === 'object') {
          const fieldErrors: string[] = [];
          
          // Check for non_field_errors
          if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
            fieldErrors.push(...data.non_field_errors);
          }
          
          // Check for field-specific errors
          Object.keys(data).forEach((key) => {
            if (key !== 'non_field_errors' && Array.isArray(data[key])) {
              fieldErrors.push(`${key}: ${data[key].join(', ')}`);
            } else if (key !== 'non_field_errors' && typeof data[key] === 'string') {
              fieldErrors.push(`${key}: ${data[key]}`);
            }
          });
          
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join('. ');
          } else if (data.error) {
            errorMessage = data.error;
          } else if (data.detail) {
            errorMessage = data.detail;
          }
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
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

















