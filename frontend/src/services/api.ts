import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/user/login', { email, password }),
  signup: (email: string, password: string, role: 'STUDENT' | 'ADMIN') =>
    api.post('/user/signup', { email, password, role }),
  getMe: () => api.get('/user/me'),
};

export const profileAPI = {
  getProfile: () => api.get('/profile'),
  requestEdit: (data: any) => api.post('/profile/edit-request', data),
  getPendingRequests: () => api.get('/profile/admin/pending'),
  approveRequest: (ticketId: string, status: 'APPROVED' | 'REJECTED', adminNote?: string) => 
    api.post(`/profile/admin/approve/${ticketId}`, { status, adminNote }),
};

export const eventAPI = {
  getEvents: () => api.get('/event'),
  participate: (eventId: string) => api.post('/event/participate', { eventId }),
  createEvent: (data: any) => {
    console.log('Sending event data to API:', data);
    return api.post('/event', data);
  },
  acceptEvent: (eventId: string) => api.post('/event/accept', { eventId }),
  getEventDetails: (eventId: string) => api.get(`/event/${eventId}`),
};

export const codingStatsAPI = {
  getStats: () => api.get('/coding-stats'),
  submitLeetCode: (url: string) => api.post('/coding-stats/leetcode', { url }),
  submitHackerRank: (url: string) => api.post('/coding-stats/hackerrank', { url }),
};

export const certificationAPI = {
  upload: (eventId: string, file: File) => {
    const formData = new FormData();
    formData.append('eventId', eventId);
    formData.append('certification', file);
    return api.post('/certification/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getPending: () => api.get('/certification/pending'),
  getUserCertifications: () => api.get('/certification/user'),
  verify: (submissionId: string, status: string) =>
    api.post(`/certification/verify/${submissionId}`, { status }),
};

export const leaderboardAPI = {
  getLeaderboard: () => api.get('/leaderboard'),
  getMyRank: () => api.get('/leaderboard/me'),
};

export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (notificationId: string) =>
    api.post(`/notifications/read/${notificationId}`),
  createNotification: (data: any) => api.post('/notifications', data),
  deleteNotification: (notificationId: string) => api.delete(`/notifications/${notificationId}`),
};

export const adminAPI = {
  getLogs: (params?: any) => api.get('/admin/logs', { params }),
  exportStudents: () => api.get('/admin/export-students'),
  exportLogs: () => api.get('/admin/export-logs'),
  getSystemStats: () => api.get('/admin/stats'),
  getRecentActivity: () => api.get('/admin/recent-activity'),
  updatePointRule: (key: string, value: number, description: string) =>
    api.post('/admin/point-rule', { key, value, description }),
};

export const eligibilityAPI = {
  checkEligibility: () => api.get('/eligibility/check'),
  assignBatch: (userId: string, batch: string, auto: boolean) =>
    api.post('/eligibility/assign', { userId, batch, auto }),
}; 