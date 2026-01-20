import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Export API base URL getter
export function getApiBase(): string {
  return API_BASE_URL;
}

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
  
  googleLogin: (token: string) =>
    api.post('/auth/google-login/', { token }),
  
  logout: (data: { refresh: string }) =>
    api.post('/auth/logout/', data),
  
  getProfile: () =>
    api.get('/auth/profile/'),
  
  updateProfile: (data: any) =>
    api.put('/auth/profile/update/', data),
  
  changePassword: (data: { old_password: string; new_password: string; new_password2: string }) =>
    api.post('/auth/change-password/', data),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password/', { email }),
  
  resetPassword: (data: { uid: string; token: string; new_password: string }) =>
    api.post('/auth/reset-password/', data),
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
  
  markComplete: (courseId: number, lectureId: number) =>
    api.post(`/courses/${courseId}/player/lecture/${lectureId}/complete/`),
  
  addNote: (courseId: number, lectureId: number, data: any) =>
    api.post(`/courses/${courseId}/player/lecture/${lectureId}/note/`, data),
  updateNote: (noteId: number, data: any) =>
    api.patch(`/notes/${noteId}/`, data),
  deleteNote: (noteId: number) =>
    api.delete(`/notes/${noteId}/`),
  
  getForum: (courseId: number) =>
    api.get(`/courses/${courseId}/player/forum/`),
  
  getOverview: (courseId: number) =>
    api.get(`/courses/${courseId}/player/overview/`),
  
  // Quiz APIs
  getQuiz: (courseId: number, quizId: number) =>
    api.get(`/quizzes/${quizId}/`),
  
  submitQuiz: (courseId: number, quizId: number, data: any) =>
    api.post(`/quizzes/${quizId}/attempt/`, data),
  
  getQuizAttempts: (courseId: number, quizId: number) =>
    api.get(`/quizzes/${quizId}/attempts/`),
  
  // Assignment APIs
  getAssignment: (courseId: number, assignmentId: number) =>
    api.get(`/assignments/${assignmentId}/`),
  
  submitAssignment: (courseId: number, assignmentId: number, data: any) =>
    api.post(`/assignments/${assignmentId}/submit/`, data),
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

// Payments API
export const paymentsAPI = {
  getAll: (params?: any) =>
    api.get('/payments/', { params }),
  
  getById: (id: number) =>
    api.get(`/payments/${id}/`),
  
  create: (data: { course: number; amount: number }) =>
    api.post('/payments/', data),
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

// Certificates API
export const certificatesAPI = {
  getAll: () => api.get('/certificates/'),
  getById: (id: number) => api.get(`/certificates/${id}/`),
  download: (id: number) => api.get(`/certificates/${id}/download/`, { responseType: 'blob' }),
  verify: (certificateNumber: string) => api.get(`/certificates/verify/${certificateNumber}/`),
};

// Batch and Session APIs
export const batchesAPI = {
  getAll: (params?: any) => api.get('/batches/', { params }),
  getById: (id: number) => api.get(`/batches/${id}/`),
  getSessions: (batchId: number) => api.get(`/batches/${batchId}/sessions/`),
  autoScheduleSessions: (batchId: number, data: { session_date: string; session_duration_hours?: number; time_slots?: string[] }) =>
    api.post(`/batches/${batchId}/auto_schedule_sessions/`, data),
};

export const batchSessionsAPI = {
  getAll: (params?: any) => api.get('/batch-sessions/', { params }),
  getById: (id: number) => api.get(`/batch-sessions/${id}/`),
  register: (sessionId: number, enrollmentId: number) =>
    api.post(`/batch-sessions/${sessionId}/register/`, { enrollment_id: enrollmentId }),
  getRegistrations: (sessionId: number) => api.get(`/batch-sessions/${sessionId}/registrations/`),
};

export const sessionRegistrationsAPI = {
  getAll: (params?: any) => api.get('/session-registrations/', { params }),
  getById: (id: number) => api.get(`/session-registrations/${id}/`),
  cancel: (id: number) => api.delete(`/session-registrations/${id}/`),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories/'),
  getById: (id: number) => api.get(`/categories/${id}/`),
};

// Reviews API
export const reviewsAPI = {
  getAll: (courseId: number, params?: any) => api.get(`/reviews/`, { params: { course: courseId, ...params } }),
  create: (courseId: number, data: { rating: number; comment: string }) => api.post('/reviews/', { course: courseId, ...data }),
  update: (id: number, data: { rating?: number; comment?: string }) => api.put(`/reviews/${id}/`, data),
  delete: (id: number) => api.delete(`/reviews/${id}/`),
};

// Assignment Submissions API
export const assignmentSubmissionsAPI = {
  getAll: (params?: any) => api.get('/assignment-submissions/', { params }),
  create: (data: { enrollment: number; assignment: number; submission_text?: string; submission_file?: File }) => {
    const formData = new FormData();
    formData.append('enrollment', data.enrollment.toString());
    formData.append('assignment', data.assignment.toString());
    if (data.submission_text) formData.append('submission_text', data.submission_text);
    if (data.submission_file) formData.append('submission_file', data.submission_file);
    return api.post('/assignment-submissions/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getById: (id: number) => api.get(`/assignment-submissions/${id}/`),
  update: (id: number, data: FormData | any) => {
    if (data instanceof FormData) {
      return api.put(`/assignment-submissions/${id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.put(`/assignment-submissions/${id}/`, data);
  },
  delete: (id: number) => api.delete(`/assignment-submissions/${id}/`),
};

// Admin API
export const adminAPI = {
  // Analytics
  getAnalytics: (params?: { date_range?: string; start_date?: string; end_date?: string }) =>
    api.get('/admin/analytics/', { params }),
  
  // Courses
  getCourses: (params?: { page?: number; page_size?: number; search?: string; modality?: string; is_active?: boolean }) =>
    api.get('/admin/courses/', { params }),
  createCourse: (data: any) =>
    api.post('/admin/courses/', data),
  getCourse: (courseId: number) =>
    api.get(`/admin/courses/${courseId}/`),
  updateCourse: (courseId: number, data: any) =>
    api.patch(`/admin/courses/${courseId}/`, data),
  deleteCourse: (courseId: number) =>
    api.delete(`/admin/courses/${courseId}/`),
  
  // Quizzes
  getQuizzes: (courseId: number) =>
    api.get(`/admin/courses/${courseId}/quizzes/`),
  createQuiz: (courseId: number, data: any) =>
    api.post(`/admin/courses/${courseId}/quizzes/`, data),
  getQuiz: (courseId: number, quizId: number) =>
    api.get(`/admin/courses/${courseId}/quizzes/${quizId}/`),
  updateQuiz: (courseId: number, quizId: number, data: any) =>
    api.patch(`/admin/courses/${courseId}/quizzes/${quizId}/`, data),
  deleteQuiz: (courseId: number, quizId: number) =>
    api.delete(`/admin/courses/${courseId}/quizzes/${quizId}/`),
  
  // Questions
  getQuestions: (courseId: number, quizId: number) =>
    api.get(`/admin/courses/${courseId}/quizzes/${quizId}/questions/`),
  createQuestion: (courseId: number, quizId: number, data: any) =>
    api.post(`/admin/courses/${courseId}/quizzes/${quizId}/questions/`, data),
  getQuestion: (courseId: number, quizId: number, questionId: number) =>
    api.get(`/admin/courses/${courseId}/quizzes/${quizId}/questions/${questionId}/`),
  updateQuestion: (courseId: number, quizId: number, questionId: number, data: any) =>
    api.patch(`/admin/courses/${courseId}/quizzes/${quizId}/questions/${questionId}/`, data),
  deleteQuestion: (courseId: number, quizId: number, questionId: number) =>
    api.delete(`/admin/courses/${courseId}/quizzes/${quizId}/questions/${questionId}/`),
  
  // Students
  getStudents: (params?: { page?: number; page_size?: number; search?: string }) =>
    api.get('/admin/students/', { params }),
  
  // Payments
  getPayments: (params?: { page?: number; page_size?: number; search?: string; status?: string; start_date?: string; end_date?: string }) =>
    api.get('/admin/payments/', { params }),
  
  // Users (Admin only)
  getUsers: (params?: { page?: number; page_size?: number; search?: string; role?: string }) =>
    api.get('/admin/users/', { params }),
  createUser: (data: any) =>
    api.post('/admin/users/', data),
  getUser: (userId: number) =>
    api.get(`/admin/users/${userId}/`),
  updateUser: (userId: number, data: any) =>
    api.patch(`/admin/users/${userId}/`, data),
};

export default api;



