import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, dashboardApi, mealsApi, usersApi, assistantApi } from '../api/client';
import { useAuthStore } from '../store/auth.store';

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

export function useLogin() {
  const setTokens = useAuthStore((s) => s.setTokens);
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password).then((r) => r.data),
    onSuccess: (data) => setTokens(data.accessToken, data.refreshToken),
  });
}

export function useRegister() {
  const setTokens = useAuthStore((s) => s.setTokens);
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.register(email, password).then((r) => r.data),
    onSuccess: (data) => setTokens(data.accessToken, data.refreshToken),
  });
}

export function useLogout() {
  const { refreshToken, logout } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      refreshToken ? authApi.logout(refreshToken).then((r) => r.data) : Promise.resolve(),
    onSettled: async () => {
      await logout();
      qc.clear();
    },
  });
}

export function useMe() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['me'],
    queryFn: () => usersApi.me().then((r) => r.data),
    enabled: !!token,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => usersApi.updateProfile(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
}

export function useMeals(date: string) {
  return useQuery({
    queryKey: ['meals', date],
    queryFn: () => mealsApi.list(date).then((r) => r.data),
  });
}

export function useCreateMeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => mealsApi.create(data).then((r) => r.data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['meals', (variables as any).date] });
      qc.invalidateQueries({ queryKey: ['daily'] });
    },
  });
}

export function useDeleteMeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mealsApi.remove(id).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meals'] });
      qc.invalidateQueries({ queryKey: ['daily'] });
    },
  });
}

export function useDailySummary(date: string) {
  return useQuery({
    queryKey: ['daily', date],
    queryFn: () => dashboardApi.daily(date, tz).then((r) => r.data),
  });
}

export function useMacroAdjustments() {
  return useMutation({
    mutationFn: ({
      consumed,
      targets,
    }: {
      consumed: Record<string, unknown>;
      targets: Record<string, unknown>;
    }) => assistantApi.macroAdjustments(consumed, targets).then((r) => r.data),
  });
}
