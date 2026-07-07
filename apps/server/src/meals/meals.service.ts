import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { summarizeMealEntries } from '../../../../packages/domain/src';
import type { CreateMealDto, UpdateMealDto, MealItemDto } from './meals.dto';

@Injectable()
export class MealsService {
  constructor(private prisma: PrismaService) {}

  async createMeal(userId: string, dto: CreateMealDto) {
    const meal = await this.prisma.meal.create({
      data: {
        userId,
        date: new Date(dto.date),
        type: dto.type,
        items: { create: dto.items.map((item) => this.buildMealItemData(item)) },
      },
      include: { items: { include: { foodItem: { include: { nutrients: true } } } } },
    });
    return { ...meal, breakdown: this.breakdown(dto.items) };
  }

  async getMealsByDate(userId: string, date: string) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return this.prisma.meal.findMany({
      where: { userId, date: { gte: start, lte: end } },
      include: { items: { include: { foodItem: { include: { nutrients: true } } } } },
    });
  }

  async updateMeal(userId: string, mealId: string, dto: UpdateMealDto) {
    const meal = await this.prisma.meal.findFirst({ where: { id: mealId, userId } });
    if (!meal) throw new NotFoundException('Meal not found');
    if (dto.items) {
      await this.prisma.mealItem.deleteMany({ where: { mealId } });
    }
    return this.prisma.meal.update({
      where: { id: mealId },
      data: {
        ...(dto.type && { type: dto.type }),
        ...(dto.items && { items: { create: dto.items.map((item) => this.buildMealItemData(item)) } }),
      },
      include: { items: { include: { foodItem: { include: { nutrients: true } } } } },
    });
  }

  async deleteMeal(userId: string, mealId: string) {
    const meal = await this.prisma.meal.findFirst({ where: { id: mealId, userId } });
    if (!meal) throw new NotFoundException('Meal not found');
    await this.prisma.mealItem.deleteMany({ where: { mealId } });
    await this.prisma.meal.delete({ where: { id: mealId } });
    return { deleted: true };
  }

  private buildMealItemData(item: MealItemDto) {
    return {
      qty: item.quantity,
      serving: item.servingSize,
      foodItem: {
        create: {
          name: item.name,
          isCustom: true,
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
      },
    };
  }

  private breakdown(items: MealItemDto[]) {
    return summarizeMealEntries(items.map((i) => ({
      calories: i.calories * i.quantity,
      proteinG: i.proteinG * i.quantity,
      carbsG: i.carbsG * i.quantity,
      fatG: i.fatG * i.quantity,
      fiberG: i.fiberG * i.quantity,
    })));
  }
}
