import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { AxiosProgressEvent } from 'axios';
import { Profile } from '../types/profile'; // Import Profile type
import { CreateEventData, UpdateEventData } from '../types/event'; // Import new event types

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
  getAllUsers: () => api.get('/user/admin/all'),
  deleteUser: (userId: string) => api.delete(`/user/admin/${userId}`),
};

export const profileAPI = {
  getProfile: () => api.get('/profile'),
  requestEdit: (data: any) => api.post('/profile/edit-request', data),
  updateProfile: (data: Partial<Profile>) => api.put('/profile', data), // New: Direct update for admin
  uploadPhoto: (file: File, onUploadProgress?: (progressEvent: AxiosProgressEvent) => void) => {
    const formData = new FormData();
    formData.append('profilePhoto', file);
    return api.post('/profile/upload-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },
  getPendingRequests: () => api.get('/profile/admin/pending'),
  approveRequest: (ticketId: string, status: 'APPROVED' | 'REJECTED', adminNote?: string) => 
    api.post(`/profile/admin/approve/${ticketId}`, { status, adminNote }),
  getAllStudents: () => api.get('/profile/admin/students'),
};

export const eventAPI = {
  getEvents: () => api.get('/event'),
  participate: (eventId: string) => api.post('/event/participate', { eventId }),
  createEvent: (data: CreateEventData) => { // Use CreateEventData
    return api.post('/event', data);
  },
  acceptEvent: (eventId: string) => api.post('/event/accept', { eventId }),
  getEventDetails: (eventId: string) => api.get(`/event/${eventId}`),
  updateEvent: (eventId: string, data: Partial<UpdateEventData>) => api.put(`/event/${eventId}`, data), // Use Partial<UpdateEventData>
  deleteEvent: (eventId: string) => api.delete(`/event/${eventId}`), // New: Delete event
};

export const codingStatsAPI = {
  getStats: () => api.get('/coding-stats'),
  submitLeetCode: (url: string) => api.post('/coding-stats/leetcode', { url }),
  submitHackerRank: (url: string, manualCount: number) => api.post('/coding-stats/hackerrank', { url, manualCount }),
  deleteStat: (platform: 'LEETCODE' | 'HACKERRANK') => api.delete(`/coding-stats/${platform.toUpperCase()}`), // Added .toUpperCase()
};

export const certificationAPI = {
  upload: (eventId: string, file: File, onUploadProgress?: (progressEvent: AxiosProgressEvent) => void) => {
    const formData = new FormData();
    formData.append('eventId', eventId);
    formData.append('certification', file);
    return api.post('/certification/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
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
  exportStudents: () => api.get('/admin/export-students', { responseType: 'blob' }), // <--- ADDED responseType: 'blob'
  exportLogs: () => api.get('/admin/export-logs', { responseType: 'blob' }), // New: Export API logs
  getSystemStats: () => api.get('/admin/stats'),
  getPointRules: () => api.get('/admin/point-rules'),
  updatePointRule: (key: string, value: number, description: string) =>
    api.post('/admin/point-rules', { key, value, description }),
  bulkUploadUsers: (file: File, onUploadProgress?: (progressEvent: AxiosProgressEvent) => void) => { // New API call
    const formData = new FormData();
    formData.append('bulkUsers', file);
    return api.post('/admin/users/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },
};

export const eligibilityAPI = {
  checkEligibility: () => api.get('/eligibility/check'),
  assignBatch: (userId: string, batch: string, auto: boolean) =>
    api.post('/eligibility/assign', { userId, batch, auto }),
  assignAllEligibleBatches: () => api.post('/eligibility/assign-all-eligible'),
};

export const pointsAPI = {
  calculateMyPoints: () => api.get('/points/my-points'),
  getMyBreakdown: () => api.get('/points/my-breakdown'),
  getPointRules: () => api.get('/points/rules'),
  addPointsForActivity: (activityType: string, activityData?: any) =>
    api.post('/points/add-activity', { activityType, activityData }),
  getPointStatistics: () => api.get('/points/statistics'),
  updateAllUserPoints: () => api.post('/points/update-all'),
  getAllUsers: () => api.get('/points/users'),
  updateUserPoints: (userIds: string[], pointsToAdd: number, reason: string) =>
    api.post('/points/update-users', { userIds, pointsToAdd, reason }),
  resetUserPoints: (userIds: string[], reason: string) =>
    api.post('/points/reset-users', { userIds, reason }),
};