import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calculateNutritionTargets, summarizeMealEntries } from '../../../../packages/domain/src';
import type { ProfileMetrics } from '../../../../packages/domain/src';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDailySummary(userId: string, date: string) {
    const { meals, targets } = await this.getMealsAndTargets(userId, date, date);
    const consumed = this.aggregateMeals(meals);
    return {
      date,
      targets,
      consumed,
      remainingCalories: Math.max(0, (targets?.dailyCalories ?? 0) - consumed.calories),
      progress: targets ? {
        calories: pct(consumed.calories, targets.dailyCalories),
        protein: pct(consumed.proteinG, targets.proteinG),
        carbs: pct(consumed.carbsG, targets.carbsG),
        fat: pct(consumed.fatG, targets.fatG),
      } : null,
    };
  }

  async getWeeklySummary(userId: string) {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 6);
    const startDate = weekAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];
    const { meals, targets } = await this.getMealsAndTargets(userId, startDate, endDate);
    return { period: 'week', startDate, endDate, targets, totals: this.aggregateMeals(meals), mealCount: meals.length };
  }

  async getMonthlySummary(userId: string) {
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setDate(today.getDate() - 29);
    const startDate = monthAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];
    const { meals, targets } = await this.getMealsAndTargets(userId, startDate, endDate);
    return { period: 'month', startDate, endDate, targets, totals: this.aggregateMeals(meals), mealCount: meals.length };
  }

  async getWeightTrend(userId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    return {
      currentWeightKg: profile?.weightKg ?? null,
      targetWeightKg: profile?.targetWeightKg ?? null,
      message: 'Log weight entries to see trend data.',
    };
  }

  private async getMealsAndTargets(userId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const [meals, profile] = await Promise.all([
      this.prisma.meal.findMany({
        where: { userId, date: { gte: start, lte: end } },
        include: { items: { include: { foodItem: { include: { nutrients: true } } } } },
      }),
      this.prisma.profile.findUnique({ where: { userId } }),
    ]);

    const targets = profile && profile.age > 0
      ? calculateNutritionTargets(profile as unknown as ProfileMetrics)
      : null;

    return { meals, targets };
  }

  private aggregateMeals(meals: any[]) {
    const entries = meals.flatMap((meal) =>
      meal.items.flatMap((item: any) =>
        item.foodItem.nutrients.map((n: any) => ({
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

function pct(value: number, total: number) {
  if (!total) return 0;
  return Number(((value / total) * 100).toFixed(1));
}
