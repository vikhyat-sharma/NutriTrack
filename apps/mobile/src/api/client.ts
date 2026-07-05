import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export const api = axios.create({ baseURL: BASE_URL });

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

export const authApi = {
  register: (email: string, password: string) => api.post('/auth/register', { email, password }),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  requestReset: (email: string) => api.post('/auth/password-reset', { email }),
};

export const usersApi = {
  me: () => api.get('/users/me'),
  updateProfile: (data: Record<string, unknown>) => api.patch('/users/me/profile', data),
};

export const mealsApi = {
  list: (date: string) => api.get('/meals', { params: { date } }),
  create: (data: Record<string, unknown>) => api.post('/meals', data),
  remove: (id: string) => api.delete(`/meals/${id}`),
};

export const dashboardApi = {
  daily: (date: string) => api.get('/dashboard/daily-summary', { params: { date } }),
};

export const assistantApi = {
  macroAdjustments: (consumed: Record<string, unknown>, targets: Record<string, unknown>) =>
    api.post('/assistant/macro-adjustments', { consumed, targets }),
};
