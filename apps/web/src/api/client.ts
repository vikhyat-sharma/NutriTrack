import axios, { type AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/auth.store';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
  timeout: 10_000,
  withCredentials: true,
});

// ── Request interceptor: attach access token ──────────────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: silent token refresh with queue ─────────────────────
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

    if (err.response?.status !== 401 || original._retry) {
      return Promise.reject(err);
    }

    const { refreshToken, setAccessToken, logout } = useAuthStore.getState();
    if (!refreshToken) {
      logout();
      return Promise.reject(err);
    }

    if (isRefreshing) {
      // Queue this request until the refresh completes
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
          resolve(api(original));
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'}/auth/refresh`,
        { refreshToken },
        { timeout: 10_000 },
      );
      setAccessToken(data.accessToken);
      processQueue(data.accessToken);
      original.headers = { ...original.headers, Authorization: `Bearer ${data.accessToken}` };
      return api(original);
    } catch (refreshErr) {
      refreshQueue = [];
      logout();
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  },
);

// ── API surface ───────────────────────────────────────────────────────────────

export const authApi = {
  register: (email: string, password: string) => api.post('/auth/register', { email, password }),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  googleLogin: (idToken: string) => api.post('/auth/google', { idToken }),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  requestReset: (email: string) => api.post('/auth/password-reset', { email }),
  confirmReset: (token: string, newPassword: string) =>
    api.post('/auth/password-reset/confirm', { token, newPassword }),
};

export const usersApi = {
  me: (signal?: AbortSignal) => api.get('/users/me', { signal }),
  updateProfile: (data: Record<string, unknown>) => api.patch('/users/me/profile', data),
};

export const nutritionApi = {
  targets: (profile: Record<string, unknown>, signal?: AbortSignal) =>
    api.post('/nutrition/targets', profile, { signal }),
};

export const mealsApi = {
  list: (date: string, signal?: AbortSignal) => api.get('/meals', { params: { date }, signal }),
  create: (data: Record<string, unknown>) => api.post('/meals', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/meals/${id}`, data),
  remove: (id: string) => api.delete(`/meals/${id}`),
};

export const dashboardApi = {
  daily: (date: string, timezone: string, signal?: AbortSignal) =>
    api.get('/dashboard/daily-summary', { params: { date, timezone }, signal }),
  weekly: (timezone: string, signal?: AbortSignal) =>
    api.get('/dashboard/weekly-summary', { params: { timezone }, signal }),
  monthly: (timezone: string, signal?: AbortSignal) =>
    api.get('/dashboard/monthly-summary', { params: { timezone }, signal }),
  weightTrend: (signal?: AbortSignal) => api.get('/dashboard/weight-trend', { signal }),
};

export const assistantApi = {
  mealSuggestions: (targets: Record<string, unknown>) =>
    api.post('/assistant/meal-suggestions', { targets }),
  macroAdjustments: (consumed: Record<string, unknown>, targets: Record<string, unknown>) =>
    api.post('/assistant/macro-adjustments', { consumed, targets }),
  explainNutrition: (values: Record<string, unknown>) =>
    api.post('/assistant/explain-nutrition', { values }),
};
