import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, dashboardApi, mealsApi, nutritionApi, usersApi, assistantApi } from '../api/client';
import { useAuthStore } from '../store/auth.store';

// Auth hooks
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

// Profile hooks
export function useMe() {
  return useQuery({ queryKey: ['me'], queryFn: () => usersApi.me().then((r) => r.data) });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => usersApi.updateProfile(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
}

// Nutrition hooks
export function useNutritionTargets(profile: Record<string, unknown> | null) {
  return useQuery({
    queryKey: ['nutrition-targets', profile],
    queryFn: () => nutritionApi.targets(profile!).then((r) => r.data),
    enabled: !!profile,
  });
}

// Meals hooks
export function useMeals(date: string) {
  return useQuery({ queryKey: ['meals', date], queryFn: () => mealsApi.list(date).then((r) => r.data) });
}

export function useCreateMeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => mealsApi.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meals'] }),
  });
}

export function useDeleteMeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mealsApi.remove(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meals'] }),
  });
}

// Dashboard hooks
export function useDailySummary(date: string) {
  return useQuery({ queryKey: ['daily', date], queryFn: () => dashboardApi.daily(date).then((r) => r.data) });
}

export function useWeeklySummary() {
  return useQuery({ queryKey: ['weekly'], queryFn: () => dashboardApi.weekly().then((r) => r.data) });
}

export function useMonthlySummary() {
  return useQuery({ queryKey: ['monthly'], queryFn: () => dashboardApi.monthly().then((r) => r.data) });
}

// Assistant hooks
export function useMealSuggestions(targets: Record<string, unknown> | null) {
  return useQuery({
    queryKey: ['meal-suggestions', targets],
    queryFn: () => assistantApi.mealSuggestions(targets!).then((r) => r.data),
    enabled: !!targets,
  });
}

export function useMacroAdjustments() {
  return useMutation({
    mutationFn: ({ consumed, targets }: { consumed: Record<string, unknown>; targets: Record<string, unknown> }) =>
      assistantApi.macroAdjustments(consumed, targets).then((r) => r.data),
  });
}

export function useExplainNutrition() {
  return useMutation({
    mutationFn: (values: Record<string, unknown>) => assistantApi.explainNutrition(values).then((r) => r.data),
  });
}
