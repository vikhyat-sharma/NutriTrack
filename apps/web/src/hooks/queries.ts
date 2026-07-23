import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, dashboardApi, mealsApi, nutritionApi, usersApi, assistantApi } from '../api/client';
import { useAuthStore } from '../store/auth.store';

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

// ── Auth ──────────────────────────────────────────────────────────────────────

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
    onSettled: () => {
      logout();
      qc.clear();
    },
  });
}

// ── Profile ───────────────────────────────────────────────────────────────────

export function useMe() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['me'],
    queryFn: ({ signal }) => usersApi.me(signal).then((r) => r.data),
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

// ── Nutrition ─────────────────────────────────────────────────────────────────

export function useNutritionTargets(profile: Record<string, unknown> | null) {
  // Use stable primitive key fields instead of the object reference to prevent infinite refetch
  const key = profile
    ? [profile.age, profile.gender, profile.heightCm, profile.weightKg, profile.activityLevel, profile.fitnessGoal]
    : null;
  return useQuery({
    queryKey: ['nutrition-targets', key],
    queryFn: ({ signal }) => nutritionApi.targets(profile!, signal).then((r) => r.data),
    enabled: !!profile,
  });
}

// ── Meals ─────────────────────────────────────────────────────────────────────

export function useMeals(date: string) {
  return useQuery({
    queryKey: ['meals', date],
    queryFn: ({ signal }) => mealsApi.list(date, signal).then((r) => r.data),
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

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function useDailySummary(date: string) {
  return useQuery({
    queryKey: ['daily', date],
    queryFn: ({ signal }) => dashboardApi.daily(date, tz, signal).then((r) => r.data),
  });
}

export function useWeeklySummary() {
  return useQuery({
    queryKey: ['weekly'],
    queryFn: ({ signal }) => dashboardApi.weekly(tz, signal).then((r) => r.data),
  });
}

export function useMonthlySummary() {
  return useQuery({
    queryKey: ['monthly'],
    queryFn: ({ signal }) => dashboardApi.monthly(tz, signal).then((r) => r.data),
  });
}

// ── Assistant ─────────────────────────────────────────────────────────────────

export function useMealSuggestions(targets: Record<string, unknown> | null) {
  return useQuery({
    queryKey: ['meal-suggestions', targets],
    queryFn: () => assistantApi.mealSuggestions(targets!).then((r) => r.data),
    enabled: !!targets,
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

export function useExplainNutrition() {
  return useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      assistantApi.explainNutrition(values).then((r) => r.data),
  });
}
