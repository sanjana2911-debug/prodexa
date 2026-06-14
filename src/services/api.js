/**
 * API service configuration using Axios
 * This file sets up the base configuration for API calls to the backend server
 *
 * CRITICAL: All requests have a 15-second default timeout to prevent the
 * dashboard from hanging indefinitely. If the backend is slow or unresponsive,
 * the request will be aborted and the UI will render with partial/fallback data.
 */

import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  // In development, the Vite dev server proxies /api requests
  // In production, set VITE_API_URL to your backend URL
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // CRITICAL: Default timeout of 15 seconds to prevent infinite loading spinners
  // If a request takes longer than this, it will be aborted and the catch handler
  // will fire, allowing the UI to render with partial data instead of hanging forever
  timeout: 15000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('prodexa_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('prodexa_token');
      localStorage.removeItem('prodexa_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ---- UPLOAD API ----
export const uploadAPI = {
  uploadAvatar: (formData) => api.post('/upload/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  removeAvatar: () => api.delete('/upload/avatar'),
};

// ---- AUTH API ----

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// ---- TASKS API ----

export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

// ---- ATTENDANCE API ----

export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', { params }),
  mark: (data) => api.post('/attendance', data),
  getStats: (params) => api.get('/attendance/stats', { params }),
};

// ---- NOTES API ----

export const notesAPI = {
  getAll: (params) => api.get('/notes', { params }),
  getById: (id) => api.get(`/notes/${id}`),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
};

// ---- STUDY GOALS API ----

export const studyGoalsAPI = {
  getAll: (params) => api.get('/study-goals', { params }),
  create: (data) => api.post('/study-goals', data),
  update: (id, data) => api.put(`/study-goals/${id}`, data),
  delete: (id) => api.delete(`/study-goals/${id}`),
  getProgress: (params) => api.get('/study-goals/progress', { params }),
};

// ---- ANALYTICS API ----

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getMonthly: (params) => api.get('/analytics/monthly', { params }),
  getAdminUserStats: () => api.get('/analytics/admin/users'),
};