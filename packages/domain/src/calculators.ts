import type { ActivityLevel, FitnessGoal, Gender, MacroBreakdown, NutritionTargets, ProfileMetrics } from './types';

export const activityFactor: Record<ActivityLevel, number> = {
  SEDENTARY: 1.2,
  LIGHT_MODERATE: 1.375,
  ACTIVE: 1.55,
  VERY_ACTIVE: 1.725,
};

/**
 * Calculates the basal metabolic rate using the Mifflin-St Jeor formula.
 */
export function bmrMifflinStJeor(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'MALE') return base + 5;
  if (gender === 'FEMALE') return base - 161;
  return base;
}

/**
 * Converts the BMR to a total daily energy expenditure using an activity factor.
 */
export function tdee(bmr: number, level: ActivityLevel): number {
  return Math.round(bmr * activityFactor[level]);
}

/**
 * Builds a daily calorie target based on the user's fitness goal.
 */
export function calorieTarget(tdeeVal: number, goal: FitnessGoal, dailyDeficit = 500): number {
  if (goal === 'MAINTAIN') return Math.round(tdeeVal);
  if (goal === 'LOSE') return Math.round(tdeeVal - dailyDeficit);
  return Math.round(tdeeVal + dailyDeficit);
}

/**
 * Derives macro targets from a daily calorie target using a sensible default split.
 */
export function calculateNutritionTargets(profile: ProfileMetrics): NutritionTargets {
  const bmr = bmrMifflinStJeor(profile.weightKg, profile.heightCm, profile.age, profile.gender);
  const tdeeValue = tdee(bmr, profile.activityLevel);
  const dailyCalories = calorieTarget(tdeeValue, profile.fitnessGoal);
  const proteinG = Math.max(1, Math.round(profile.weightKg * 1.6));
  const proteinCalories = proteinG * 4;
  const fatG = Math.max(1, Math.round(dailyCalories * 0.25 / 9));
  const fatCalories = fatG * 9;
  const carbCalories = Math.max(0, dailyCalories - proteinCalories - fatCalories);
  const carbsG = Math.max(0, Math.round(carbCalories / 4));
  const fiberG = Math.max(20, Math.round(profile.weightKg * 0.3));
  const waterMl = Math.max(2500, Math.round(profile.weightKg * 35));

  return {
    bmr,
    tdee: tdeeValue,
    dailyCalories,
    proteinG,
    carbsG,
    fatG,
    fiberG,
    waterMl,
  };
}

/**
 * Produces a macro summary from a list of food entries.
 */
export function summarizeMealEntries(entries: Array<Pick<MacroBreakdown, 'calories' | 'proteinG' | 'carbsG' | 'fatG' | 'fiberG'>>): MacroBreakdown {
  return entries.reduce<MacroBreakdown>(
    (summary, entry) => ({
      calories: summary.calories + entry.calories,
      proteinG: summary.proteinG + entry.proteinG,
      carbsG: summary.carbsG + entry.carbsG,
      fatG: summary.fatG + entry.fatG,
      fiberG: summary.fiberG + entry.fiberG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 },
  );
}
