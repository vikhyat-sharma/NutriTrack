import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (access: string, refresh: string) => void;
  setAccessToken: (access: string) => void;
  logout: () => void;
}

/**
 * Auth tokens are intentionally NOT persisted to localStorage.
 * Storing tokens in localStorage exposes them to XSS attacks (OWASP A02).
 *
 * Access token: in-memory only (lost on page refresh — refreshed silently via /auth/refresh).
 * Refresh token: stored in-memory and sent to /auth/refresh when access token expires.
 *
 * For production: move refresh token to an httpOnly Secure cookie set by the server,
 * so it is never accessible to JavaScript at all.
 */
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
  setAccessToken: (accessToken) => set({ accessToken }),
  logout: () => set({ accessToken: null, refreshToken: null }),
}));
