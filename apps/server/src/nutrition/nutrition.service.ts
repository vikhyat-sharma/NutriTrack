import { Injectable } from '@nestjs/common';
import { calculateNutritionTargets, summarizeMealEntries } from '../../../../packages/domain/src';
import type { MacroBreakdown, NutritionTargets, ProfileMetrics } from '../../../../packages/domain/src';

/**
 * Encapsulates nutrition calculation business rules for the MacroWise API.
 */
@Injectable()
export class NutritionService {
  /**
   * Calculates the daily target values for calories, macros, fiber, and water.
   */
  calculateTargets(profile: ProfileMetrics): NutritionTargets {
    return calculateNutritionTargets(profile);
  }

  /**
   * Aggregates one or more food entries into a single macro summary.
   */
  summarizeEntries(entries: Array<MacroBreakdown>): MacroBreakdown {
    return summarizeMealEntries(entries);
  }
}
