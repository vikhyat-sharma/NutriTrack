import { Injectable } from '@nestjs/common';
import { calculateNutritionTargets, summarizeMealEntries } from '../../../../packages/domain/src';
import type { ActivityLevel, FitnessGoal, Gender, MacroBreakdown, NutritionTargets } from '../../../../packages/domain/src';
import type { NutritionTargetsDto } from './nutrition.dto';

@Injectable()
export class NutritionService {
  calculateTargets(dto: NutritionTargetsDto): NutritionTargets {
    return calculateNutritionTargets({
      age: dto.age,
      gender: dto.gender as Gender,
      heightCm: dto.heightCm,
      weightKg: dto.weightKg,
      activityLevel: dto.activityLevel as ActivityLevel,
      fitnessGoal: dto.fitnessGoal as FitnessGoal,
      targetWeightKg: dto.targetWeightKg,
    });
  }

  summarizeEntries(entries: MacroBreakdown[]): MacroBreakdown {
    return summarizeMealEntries(entries);
  }
}
