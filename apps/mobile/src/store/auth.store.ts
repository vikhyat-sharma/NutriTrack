import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const KEYS = { access: 'mw_access_token', refresh: 'mw_refresh_token' } as const;

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
  setTokens: (access: string, refresh: string) => Promise<void>;
  setAccessToken: (access: string) => void;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  isHydrated: false,

  hydrate: async () => {
    const [accessToken, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(KEYS.access),
      SecureStore.getItemAsync(KEYS.refresh),
    ]);
    set({ accessToken, refreshToken, isHydrated: true });
  },

  setTokens: async (accessToken, refreshToken) => {
    await Promise.all([
      SecureStore.setItemAsync(KEYS.access, accessToken),
      SecureStore.setItemAsync(KEYS.refresh, refreshToken),
    ]);
    set({ accessToken, refreshToken });
  },

  setAccessToken: (accessToken) => {
    SecureStore.setItemAsync(KEYS.access, accessToken).catch(() => {});
    set({ accessToken });
  },

  logout: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.access),
      SecureStore.deleteItemAsync(KEYS.refresh),
    ]);
    set({ accessToken: null, refreshToken: null });
  },
}));
