import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { NutritionTargetsDto } from './nutrition.dto';
import type { MacroBreakdown } from '../../../../packages/domain/src';

@UseGuards(JwtAuthGuard)
@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Post('targets')
  calculateTargets(@Body() dto: NutritionTargetsDto) {
    return this.nutritionService.calculateTargets(dto);
  }

  @Post('meal-summary')
  summarizeMeal(@Body() entries: MacroBreakdown[]) {
    return this.nutritionService.summarizeEntries(entries);
  }
}
