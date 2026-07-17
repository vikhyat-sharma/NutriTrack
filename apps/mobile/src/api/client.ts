import axios, { type AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/auth.store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export const api = axios.create({ baseURL: BASE_URL, timeout: 10_000 });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function processQueue(newToken: string) {
  refreshQueue.forEach((resolve) => resolve(newToken));
  refreshQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config as AxiosRequestConfig & { _retry?: boolean };
    if (err.response?.status !== 401 || original._retry) return Promise.reject(err);

    const { refreshToken, setAccessToken, logout } = useAuthStore.getState();
    if (!refreshToken) { await logout(); return Promise.reject(err); }

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((token) => {
          original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
          resolve(api(original));
        });
      });
    }

    original._retry = true;
    isRefreshing = true;
    try {
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken }, { timeout: 10_000 });
      setAccessToken(data.accessToken);
      processQueue(data.accessToken);
      original.headers = { ...original.headers, Authorization: `Bearer ${data.accessToken}` };
      return api(original);
    } catch (refreshErr) {
      refreshQueue = [];
      await logout();
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  },
);

export const authApi = {
  register: (email: string, password: string) => api.post('/auth/register', { email, password }),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
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
  daily: (date: string, timezone: string) =>
    api.get('/dashboard/daily-summary', { params: { date, timezone } }),
};

export const assistantApi = {
  macroAdjustments: (consumed: Record<string, unknown>, targets: Record<string, unknown>) =>
    api.post('/assistant/macro-adjustments', { consumed, targets }),
};
