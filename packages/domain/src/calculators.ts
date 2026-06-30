export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type ActivityLevel = 'SEDENTARY' | 'LIGHT_MODERATE' | 'ACTIVE' | 'VERY_ACTIVE';

export function bmrMifflinStJeor(weightKg: number, heightCm: number, age: number, gender: Gender) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'MALE') return base + 5;
  if (gender === 'FEMALE') return base - 161;
  return base;
}

export const activityFactor: Record<ActivityLevel, number> = {
  SEDENTARY: 1.2,
  LIGHT_MODERATE: 1.375,
  ACTIVE: 1.55,
  VERY_ACTIVE: 1.725,
};

export function tdee(bmr: number, level: ActivityLevel) {
  return bmr * activityFactor[level];
}

export function calorieTarget(tdeeVal: number, goal: 'LOSE' | 'MAINTAIN' | 'GAIN', dailyDeficit = 500) {
  if (goal === 'MAINTAIN') return Math.round(tdeeVal);
  if (goal === 'LOSE') return Math.round(tdeeVal - dailyDeficit);
  return Math.round(tdeeVal + dailyDeficit);
}

export function macrosFromCalories(calories: number, proteinPerKg: number, weightKg: number, fatPercent = 0.25) {
  const proteinG = Math.round(proteinPerKg * weightKg);
  const proteinCals = proteinG * 4;
  const fatCals = Math.round(calories * fatPercent);
  const fatG = Math.round(fatCals / 9);
  const carbsCals = calories - proteinCals - fatCals;
  const carbsG = Math.round(Math.max(0, carbsCals / 4));
  return { proteinG, fatG, carbsG };
}
