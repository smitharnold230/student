import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { AxiosProgressEvent, AxiosResponse } from 'axios';
import { Profile } from '../types/profile';
import { CreateEventData, UpdateEventData } from '../types/event';
import {
  PointBreakdown,
  PointRule,
  PointStatistics,
  UserWithPoints,
  ActivityPointsResult, // New import
  UpdateAllPointsResponse, // New import
  ManualPointUpdateResponse, // New import
  ResetPointsResponse, // New import
} from '../types/points';

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
  login: (email: string, password: string): Promise<AxiosResponse<{ token: string; user: { id: string; email: string; role: 'STUDENT' | 'ADMIN'; } }>> =>
    api.post('/user/login', { email, password }),
  signup: (email: string, password: string, role: 'STUDENT' | 'ADMIN'): Promise<AxiosResponse<any>> =>
    api.post('/user/signup', { email, password, role }),
  getMe: (): Promise<AxiosResponse<any>> => api.get('/user/me'),
  getAllUsers: (): Promise<AxiosResponse<{ data: any[] }>> => api.get('/user/admin/all'),
  deleteUser: (userId: string): Promise<AxiosResponse<any>> => api.delete(`/user/admin/${userId}`),
};

export const profileAPI = {
  getProfile: (): Promise<AxiosResponse<Profile>> => api.get('/profile'),
  requestEdit: (data: any): Promise<AxiosResponse<any>> => api.post('/profile/edit-request', data),
  updateProfile: (data: Partial<Profile>): Promise<AxiosResponse<any>> => api.put('/profile', data),
  uploadPhoto: (file: File, onUploadProgress?: (progressEvent: AxiosProgressEvent) => void): Promise<AxiosResponse<any>> => {
    const formData = new FormData();
    formData.append('profilePhoto', file);
    return api.post('/profile/upload-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },
  getPendingRequests: (): Promise<AxiosResponse<any[]>> => api.get('/profile/admin/pending'),
  approveRequest: (ticketId: string, status: 'APPROVED' | 'REJECTED', adminNote?: string) =>
    api.post(`/profile/admin/approve/${ticketId}`, { status, adminNote }),
  getAllStudents: (): Promise<AxiosResponse<{ data: any[] }>> => api.get('/profile/admin/students'),
};

export const eventAPI = {
  getEvents: (): Promise<AxiosResponse<any[]>> => api.get('/event'),
  participate: (eventId: string): Promise<AxiosResponse<any>> => api.post('/event/participate', { eventId }),
  createEvent: (data: CreateEventData): Promise<AxiosResponse<any>> => {
    return api.post('/event', data);
  },
  acceptEvent: (eventId: string): Promise<AxiosResponse<any>> => api.post('/event/accept', { eventId }),
  getEventDetails: (eventId: string): Promise<AxiosResponse<any>> => api.get(`/event/${eventId}`),
  updateEvent: (eventId: string, data: Partial<UpdateEventData>): Promise<AxiosResponse<any>> => api.put(`/event/${eventId}`, data),
  deleteEvent: (eventId: string): Promise<AxiosResponse<any>> => api.delete(`/event/${eventId}`),
};

export const codingStatsAPI = {
  getStats: (): Promise<AxiosResponse<any[]>> => api.get('/coding-stats'),
  submitLeetCode: (url: string): Promise<AxiosResponse<any>> => api.post('/coding-stats/leetcode', { url }),
  submitHackerRank: (url: string, manualCount: number): Promise<AxiosResponse<any>> => api.post('/coding-stats/hackerrank', { url, manualCount }),
  deleteStat: (platform: 'LEETCODE' | 'HACKERRANK'): Promise<AxiosResponse<any>> => api.delete(`/coding-stats/${platform.toUpperCase()}`),
};

export const certificationAPI = {
  upload: (eventId: string, file: File, onUploadProgress?: (progressEvent: AxiosProgressEvent) => void): Promise<AxiosResponse<any>> => {
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
  getPending: (): Promise<AxiosResponse<any[]>> => api.get('/certification/pending'),
  getUserCertifications: (): Promise<AxiosResponse<any[]>> => api.get('/certification/user'),
  verify: (submissionId: string, status: string): Promise<AxiosResponse<any>> =>
    api.post(`/certification/verify/${submissionId}`, { status }),
};

export const leaderboardAPI = {
  getLeaderboard: (): Promise<AxiosResponse<any[]>> => api.get('/leaderboard'),
  getMyRank: (): Promise<AxiosResponse<any>> => api.get('/leaderboard/me'),
};

export const notificationAPI = {
  getNotifications: (): Promise<AxiosResponse<any[]>> => api.get('/notifications'),
  markAsRead: (notificationId: string): Promise<AxiosResponse<any>> =>
    api.post(`/notifications/read/${notificationId}`),
  createNotification: (data: any): Promise<AxiosResponse<any>> => api.post('/notifications', data),
  deleteNotification: (notificationId: string): Promise<AxiosResponse<any>> => api.delete(`/notifications/${notificationId}`),
};

export const adminAPI = {
  getLogs: (params?: any): Promise<AxiosResponse<any[]>> => api.get('/admin/logs', { params }),
  exportStudents: (): Promise<AxiosResponse<Blob>> => api.get('/admin/export-students', { responseType: 'blob' }),
  exportLogs: (): Promise<AxiosResponse<Blob>> => api.get('/admin/export-logs', { responseType: 'blob' }),
  getSystemStats: (): Promise<AxiosResponse<any>> => api.get('/admin/stats'),
  getPointRules: (): Promise<AxiosResponse<{ data: PointRule[] }>> => api.get('/admin/point-rules'),
  updatePointRule: (key: string, value: number, description: string): Promise<AxiosResponse<any>> =>
    api.post('/admin/point-rules', { key, value, description }),
  bulkUploadUsers: (file: File, onUploadProgress?: (progressEvent: AxiosProgressEvent) => void): Promise<AxiosResponse<any>> => {
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

export const pointsAPI = {
  /**
   * Calculates and updates points for the current user.
   * @returns {Promise<AxiosResponse<any>>}
   */
  calculateMyPoints: (): Promise<AxiosResponse<any>> => api.get('/points/my-points'),
  /**
   * Retrieves the detailed point breakdown for the current user.
   * @returns {Promise<AxiosResponse<{ data: PointBreakdown }>>}
   */
  getMyBreakdown: (): Promise<AxiosResponse<{ data: PointBreakdown }>> => api.get('/points/my-breakdown'),
  /**
   * Retrieves all defined point rules.
   * @returns {Promise<AxiosResponse<{ data: PointRule[] }>>}
   */
  getPointRules: (): Promise<AxiosResponse<{ data: PointRule[] }>> => api.get('/points/rules'),
  /**
   * Adds points for a specific activity.
   * @param {string} activityType - The type of activity (e.g., 'WORKSHOP_PARTICIPATION').
   * @param {any} [activityData] - Additional data related to the activity.
   * @returns {Promise<AxiosResponse<{ data: ActivityPointsResult }>>}
   */
  addPointsForActivity: (activityType: string, activityData?: any): Promise<AxiosResponse<{ data: ActivityPointsResult }>> =>
    api.post('/points/add-activity', { activityType, activityData }),
  /**
   * Retrieves overall point statistics for all users (admin only).
   * @returns {Promise<AxiosResponse<{ data: PointStatistics }>>}
   */
  getPointStatistics: (): Promise<AxiosResponse<{ data: PointStatistics }>> => api.get('/points/statistics'),
  /**
   * Triggers a recalculation and update of points for all users (admin only).
   * @returns {Promise<AxiosResponse<UpdateAllPointsResponse>>}
   */
  updateAllUserPoints: (): Promise<AxiosResponse<UpdateAllPointsResponse>> => api.post('/points/update-all'),
  /**
   * Retrieves all users with their current points (admin only).
   * @returns {Promise<AxiosResponse<{ data: UserWithPoints[] }>>}
   */
  getAllUsers: (): Promise<AxiosResponse<{ data: UserWithPoints[] }>> => api.get('/points/users'),
  /**
   * Manually updates points for a list of users (admin only).
   * @param {string[]} userIds - Array of user IDs to update.
   * @param {number} pointsToAdd - Number of points to add (can be negative for subtraction).
   * @param {string} reason - Reason for the manual adjustment.
   * @returns {Promise<AxiosResponse<ManualPointUpdateResponse>>}
   */
  updateUserPoints: (userIds: string[], pointsToAdd: number, reason: string): Promise<AxiosResponse<ManualPointUpdateResponse>> =>
    api.post('/points/update-users', { userIds, pointsToAdd, reason }),
  /**
   * Resets points to zero for a list of users (admin only).
   * @param {string[]} userIds - Array of user IDs to reset.
   * @param {string} reason - Reason for the point reset.
   * @returns {Promise<AxiosResponse<ResetPointsResponse>>}
   */
  resetUserPoints: (userIds: string[], reason: string): Promise<AxiosResponse<ResetPointsResponse>> =>
    api.post('/points/reset-users', { userIds, reason }),
};

export const eligibilityAPI = {
  checkEligibility: (): Promise<AxiosResponse<any>> => api.get('/eligibility/check'),
  assignBatch: (userId: string, batch: string, auto: boolean): Promise<AxiosResponse<any>> =>
    api.post('/eligibility/assign', { userId, batch, auto }),
  assignAllEligibleBatches: (): Promise<AxiosResponse<any>> => api.post('/eligibility/assign-all-eligible'),
};