import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import type { MacroBreakdown, ProfileMetrics } from '../../../../packages/domain/src';

@UseGuards(JwtAuthGuard)
@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Post('targets')
  calculateTargets(@Body() profile: ProfileMetrics) {
    return this.nutritionService.calculateTargets(profile);
  }

  @Post('meal-summary')
  summarizeMeal(@Body() entries: MacroBreakdown[]) {
    return this.nutritionService.summarizeEntries(entries);
  }
}
