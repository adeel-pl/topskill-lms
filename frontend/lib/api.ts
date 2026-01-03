import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Log API URL for debugging
if (typeof window !== 'undefined') {
  console.log('API Base URL:', API_BASE_URL);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = Cookies.get('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          Cookies.set('access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { username: string; email: string; password: string; password2: string }) =>
    api.post('/auth/register/', data),
  
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login/', data),
  
  logout: (data: { refresh: string }) =>
    api.post('/auth/logout/', data),
  
  getProfile: () =>
    api.get('/auth/profile/'),
  
  updateProfile: (data: any) =>
    api.put('/auth/profile/update/', data),
};

// Courses API
export const coursesAPI = {
  getAll: (params?: any) =>
    api.get('/courses/', { params }),
  
  getById: (id: number) =>
    api.get(`/courses/${id}/`),
  
  getBySlug: (slug: string) =>
    api.get(`/courses/?slug=${slug}`),
  
  enroll: (id: number) =>
    api.post(`/courses/${id}/enroll/`),
  
  getRecommendations: (id: number) =>
    api.get(`/courses/${id}/recommendations/`),
};

// Course Player API (Udemy-like)
export const playerAPI = {
  getContent: (courseId: number) =>
    api.get(`/courses/${courseId}/player/content/`),
  
  getLecture: (courseId: number, lectureId: number) =>
    api.get(`/courses/${courseId}/player/lecture/${lectureId}/`),
  
  updateProgress: (courseId: number, lectureId: number, data: any) =>
    api.post(`/courses/${courseId}/player/lecture/${lectureId}/progress/`, data),
  
  addNote: (courseId: number, lectureId: number, data: any) =>
    api.post(`/courses/${courseId}/player/lecture/${lectureId}/note/`, data),
  
  getForum: (courseId: number) =>
    api.get(`/courses/${courseId}/player/forum/`),
  
  getOverview: (courseId: number) =>
    api.get(`/courses/${courseId}/player/overview/`),
};

// Cart API
export const cartAPI = {
  get: () =>
    api.get('/cart/'),
  
  addItem: (courseId: number) =>
    api.post('/cart/add-item/', { course_id: courseId }),
  
  removeItem: (courseId: number) =>
    api.post('/cart/remove-item/', { course_id: courseId }),
  
  clear: () =>
    api.post('/cart/clear/'),
  
  checkout: () =>
    api.post('/cart/checkout/'),
  
  getCount: () =>
    api.get('/cart/count/'),
};

// Enrollments API
export const enrollmentsAPI = {
  getAll: (params?: any) =>
    api.get('/enrollments/', { params }),
  
  create: (data: any) =>
    api.post('/enrollments/', data),
  
  updateProgress: (id: number, progress: number) =>
    api.post(`/enrollments/${id}/update_progress/`, { progress_percent: progress }),
};

// Other APIs
export const wishlistAPI = {
  getAll: () => api.get('/wishlist/'),
  add: (courseId: number) => api.post('/wishlist/', { course: courseId }),
  remove: (id: number) => api.delete(`/wishlist/${id}/`),
};

export const notificationsAPI = {
  getAll: () => api.get('/notifications/'),
  markRead: (id: number) => api.post(`/notifications/${id}/mark_read/`),
  markAllRead: () => api.post('/notifications/mark_all_read/'),
};

export default api;



