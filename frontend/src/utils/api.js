// API configuration file
import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/users', userData),
  refreshToken: () => api.post('/auth/refresh'),
  getUserProfile: () => api.get('/users/profile'),
};

export const userAPI = {
  updateProfile: (userId, data) => api.put(`/users/${userId}`, data),
  changePassword: (userId, data) => api.put(`/users/${userId}/password`, data),
  deleteAccount: (userId) => api.delete(`/users/${userId}`),
};

export const uploadAPI = {
  uploadFile: (formData, onUploadProgress) => 
    api.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    }),
  getUploadById: (uploadId) => api.get(`/uploads/${uploadId}`),
  getAllUploads: (page = 1, perPage = 10) => 
    api.get('/uploads', { params: { page, per_page: perPage } }),
  deleteUpload: (uploadId) => api.delete(`/uploads/${uploadId}`),
};

export const detectionAPI = {
  processUpload: (uploadId) => api.post(`/detections/process/${uploadId}`),
  getDetectionById: (resultId) => api.get(`/detections/${resultId}`),
  getAllDetections: (page = 1, perPage = 10, filters = {}) => 
    api.get('/detections', { 
      params: { 
        page, 
        per_page: perPage,
        ...filters
      } 
    }),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;
