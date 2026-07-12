import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) useAuthStore.getState().logout();
    return Promise.reject(err);
  },
);

// Auth
export const authApi = {
  register: (email: string, password: string) => api.post('/auth/register', { email, password }),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  googleLogin: (idToken: string) => api.post('/auth/google', { idToken }),
  requestReset: (email: string) => api.post('/auth/password-reset', { email }),
  confirmReset: (token: string, newPassword: string) => api.post('/auth/password-reset/confirm', { token, newPassword }),
};

// Users
export const usersApi = {
  me: () => api.get('/users/me'),
  updateProfile: (data: Record<string, unknown>) => api.patch('/users/me/profile', data),
};

// Nutrition
export const nutritionApi = {
  targets: (profile: Record<string, unknown>) => api.post('/nutrition/targets', profile),
};

// Meals
export const mealsApi = {
  list: (date: string) => api.get('/meals', { params: { date } }),
  create: (data: Record<string, unknown>) => api.post('/meals', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/meals/${id}`, data),
  remove: (id: string) => api.delete(`/meals/${id}`),
};

// Dashboard
export const dashboardApi = {
  daily: (date: string) => api.get('/dashboard/daily-summary', { params: { date } }),
  weekly: () => api.get('/dashboard/weekly-summary'),
  monthly: () => api.get('/dashboard/monthly-summary'),
  weightTrend: () => api.get('/dashboard/weight-trend'),
};

// Assistant
export const assistantApi = {
  mealSuggestions: (targets: Record<string, unknown>) => api.post('/assistant/meal-suggestions', { targets }),
  macroAdjustments: (consumed: Record<string, unknown>, targets: Record<string, unknown>) =>
    api.post('/assistant/macro-adjustments', { consumed, targets }),
  explainNutrition: (values: Record<string, unknown>) => api.post('/assistant/explain-nutrition', { values }),
};
