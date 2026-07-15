import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { calculateNutritionTargets, summarizeMealEntries } from '../../../../packages/domain/src';
import type { ActivityLevel, FitnessGoal, Gender, MacroBreakdown } from '../../../../packages/domain/src';

type MealWithItems = Prisma.MealGetPayload<{
  include: { items: { include: { foodItem: { include: { nutrients: true } } } } };
}>;

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDailySummary(userId: string, date: string, timezone = 'UTC') {
    const { meals, targets } = await this.getMealsAndTargets(userId, date, date, timezone);
    const consumed = this.aggregateMeals(meals);
    return {
      date,
      targets,
      consumed,
      remainingCalories: Math.max(0, (targets?.dailyCalories ?? 0) - consumed.calories),
      progress: targets
        ? {
            calories: pct(consumed.calories, targets.dailyCalories),
            protein: pct(consumed.proteinG, targets.proteinG),
            carbs: pct(consumed.carbsG, targets.carbsG),
            fat: pct(consumed.fatG, targets.fatG),
          }
        : null,
    };
  }

  async getWeeklySummary(userId: string, timezone = 'UTC') {
    const today = localDateString(new Date(), timezone);
    const weekAgo = localDateString(daysAgo(6), timezone);
    const { meals, targets } = await this.getMealsAndTargets(userId, weekAgo, today, timezone);
    return {
      period: 'week',
      startDate: weekAgo,
      endDate: today,
      targets,
      totals: this.aggregateMeals(meals),
      mealCount: meals.length,
    };
  }

  async getMonthlySummary(userId: string, timezone = 'UTC') {
    const today = localDateString(new Date(), timezone);
    const monthAgo = localDateString(daysAgo(29), timezone);
    const { meals, targets } = await this.getMealsAndTargets(userId, monthAgo, today, timezone);
    return {
      period: 'month',
      startDate: monthAgo,
      endDate: today,
      targets,
      totals: this.aggregateMeals(meals),
      mealCount: meals.length,
    };
  }

  async getWeightTrend(userId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    return {
      currentWeightKg: profile?.weightKg ?? null,
      targetWeightKg: profile?.targetWeightKg ?? null,
      message: 'Log weight entries to see trend data.',
    };
  }

  private async getMealsAndTargets(userId: string, startDate: string, endDate: string, timezone: string) {
    // Build UTC boundaries from the user's local date string
    const start = utcStartOfDay(startDate, timezone);
    const end = utcEndOfDay(endDate, timezone);

    const [meals, profile] = await Promise.all([
      this.prisma.meal.findMany({
        where: { userId, date: { gte: start, lte: end } },
        include: { items: { include: { foodItem: { include: { nutrients: true } } } } },
        orderBy: { date: 'asc' },
      }),
      this.prisma.profile.findUnique({ where: { userId } }),
    ]);

    const targets =
      profile && profile.age > 0 && profile.weightKg > 0 && profile.heightCm > 0
        ? calculateNutritionTargets({
            age: profile.age,
            gender: profile.gender as Gender,
            heightCm: profile.heightCm,
            weightKg: profile.weightKg,
            activityLevel: profile.activityLevel as ActivityLevel,
            fitnessGoal: profile.fitnessGoal as FitnessGoal,
            targetWeightKg: profile.targetWeightKg ?? undefined,
          })
        : null;

    return { meals, targets };
  }

  private aggregateMeals(meals: MealWithItems[]): MacroBreakdown {
    const entries = meals.flatMap((meal) =>
      meal.items.flatMap((item) =>
        item.foodItem.nutrients.map((n) => ({
          calories: n.calories * item.qty,
          proteinG: n.proteinG * item.qty,
          carbsG: n.carbsG * item.qty,
          fatG: n.fatG * item.qty,
          fiberG: n.fiberG * item.qty,
        })),
      ),
    );
    return summarizeMealEntries(entries);
  }
}

function pct(value: number, total: number): number {
  if (!total) return 0;
  return Number(((value / total) * 100).toFixed(1));
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function localDateString(date: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(date);
  } catch {
    return date.toISOString().split('T')[0];
  }
}

function utcStartOfDay(localDate: string, timezone: string): Date {
  // Parse the local date as midnight in the given timezone
  try {
    return new Date(new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).format(new Date(`${localDate}T00:00:00`)));
  } catch {
    const d = new Date(localDate);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }
}

function utcEndOfDay(localDate: string, timezone: string): Date {
  try {
    return new Date(new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).format(new Date(`${localDate}T23:59:59`)));
  } catch {
    const d = new Date(localDate);
    d.setUTCHours(23, 59, 59, 999);
    return d;
  }
}
