import { getApiBase } from './api';
import Cookies from 'js-cookie';
import axios from 'axios';

/**
 * Fetch with authentication token (uses Cookies, same as main API client)
 */
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
  const apiBase = getApiBase();
  let token = typeof window !== 'undefined' ? Cookies.get('access_token') : null;
  
  if (!token) {
    throw new Error('No authentication token found. Please log in.');
  }

  // Helper function to make the actual request
  const makeRequest = async (authToken: string) => {
    const response = await fetch(`${apiBase}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      // If 401, try to refresh token
      if (response.status === 401) {
        const refreshToken = Cookies.get('refresh_token');
        if (refreshToken) {
          try {
            const refreshResponse = await axios.post(`${apiBase}/auth/token/refresh/`, {
              refresh: refreshToken,
            });
            
            const { access } = refreshResponse.data;
            Cookies.set('access_token', access);
            
            // Retry the original request with new token
            return makeRequest(access);
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            Cookies.remove('access_token');
            Cookies.remove('refresh_token');
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            throw new Error('Session expired. Please log in again.');
          }
        } else {
          // No refresh token, redirect to login
          Cookies.remove('access_token');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new Error('Session expired. Please log in again.');
        }
      }
      
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || error.detail || error.message || 'Request failed');
    }

    return response.json();
  };

  return makeRequest(token);
}

