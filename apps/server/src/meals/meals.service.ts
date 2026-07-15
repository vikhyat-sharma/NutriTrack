import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { summarizeMealEntries } from '../../../../packages/domain/src';
import type { CreateMealDto, UpdateMealDto, MealItemDto } from './meals.dto';

// Typed Prisma result shape for meals with full includes
type MealWithItems = Prisma.MealGetPayload<{
  include: { items: { include: { foodItem: { include: { nutrients: true } } } } };
}>;

@Injectable()
export class MealsService {
  constructor(private prisma: PrismaService) {}

  async createMeal(userId: string, dto: CreateMealDto) {
    const meal = await this.prisma.$transaction(async (tx) => {
      return tx.meal.create({
        data: {
          userId,
          date: new Date(dto.date),
          type: dto.type,
          items: { create: await Promise.all(dto.items.map((item) => this.buildMealItemData(tx, userId, item))) },
        },
        include: { items: { include: { foodItem: { include: { nutrients: true } } } } },
      });
    });
    return { ...meal, breakdown: this.breakdown(dto.items) };
  }

  async getMealsByDate(userId: string, date: string) {
    // Use UTC boundaries — caller should pass date in user's local timezone context
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);
    return this.prisma.meal.findMany({
      where: { userId, date: { gte: start, lte: end } },
      include: { items: { include: { foodItem: { include: { nutrients: true } } } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateMeal(userId: string, mealId: string, dto: UpdateMealDto) {
    return this.prisma.$transaction(async (tx) => {
      const meal = await tx.meal.findFirst({ where: { id: mealId, userId } });
      if (!meal) throw new NotFoundException('Meal not found');

      if (dto.items) {
        await tx.mealItem.deleteMany({ where: { mealId } });
      }

      return tx.meal.update({
        where: { id: mealId },
        data: {
          ...(dto.type && { type: dto.type }),
          ...(dto.items && {
            items: { create: await Promise.all(dto.items.map((item) => this.buildMealItemData(tx, userId, item))) },
          }),
        },
        include: { items: { include: { foodItem: { include: { nutrients: true } } } } },
      });
    });
  }

  async deleteMeal(userId: string, mealId: string) {
    // Cascade delete handles MealItems via schema onDelete: Cascade
    const meal = await this.prisma.meal.findFirst({ where: { id: mealId, userId } });
    if (!meal) throw new NotFoundException('Meal not found');
    await this.prisma.meal.delete({ where: { id: mealId } });
    return { deleted: true };
  }

  /** Deduplicates FoodItems by name+userId to prevent unbounded table growth. */
  private async buildMealItemData(
    tx: Prisma.TransactionClient,
    userId: string,
    item: MealItemDto,
  ) {
    // Look for an existing custom food item with the same name for this user
    const existing = await tx.foodItem.findFirst({
      where: { name: item.name, userId, isCustom: true },
      include: { nutrients: true },
    });

    if (existing) {
      return { qty: item.quantity, serving: item.servingSize, foodItemId: existing.id };
    }

    const created = await tx.foodItem.create({
      data: {
        name: item.name,
        isCustom: true,
        userId,
        nutrients: {
          create: {
            calories: item.calories,
            proteinG: item.proteinG,
            carbsG: item.carbsG,
            fatG: item.fatG,
            fiberG: item.fiberG,
          },
        },
      },
    });

    return { qty: item.quantity, serving: item.servingSize, foodItemId: created.id };
  }

  private breakdown(items: MealItemDto[]) {
    return summarizeMealEntries(
      items.map((i) => ({
        calories: i.calories * i.quantity,
        proteinG: i.proteinG * i.quantity,
        carbsG: i.carbsG * i.quantity,
        fatG: i.fatG * i.quantity,
        fiberG: i.fiberG * i.quantity,
      })),
    );
  }
}
