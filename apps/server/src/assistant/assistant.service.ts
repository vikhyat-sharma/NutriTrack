import { Injectable } from '@nestjs/common';
import type { MacroBreakdown, NutritionTargets } from '../../../../packages/domain/src';

/**
 * Provides AI-style guidance suggestions for nutrition guidance flows.
 */
@Injectable()
export class AssistantService {
  suggestMeal(targets: NutritionTargets) {
    return {
      title: 'High-protein dinner suggestion',
      meal: 'Grilled chicken bowl with rice and roasted vegetables',
      rationale: `This suggestion keeps protein high while staying aligned with a daily target of ${targets.dailyCalories} kcal.`,
    };
  }

  suggestMacroAdjustment(consumed: MacroBreakdown, targets: NutritionTargets) {
    const calorieDelta = consumed.calories - targets.dailyCalories;
    if (Math.abs(calorieDelta) < 80) {
      return 'Your intake is close to target. Keep portion sizes consistent.';
    }

    return calorieDelta > 0
      ? 'Reduce portions slightly at dinner and keep snacks lighter to stay near your calorie target.'
      : 'Add a balanced snack or increase portions at lunch to reach your calorie target.';
  }

  explainNutrition(values: MacroBreakdown) {
    return {
      summary: 'Protein is the main driver of satiety and recovery; carbs fuel training; fats support hormone health.',
      values,
    };
  }
}
