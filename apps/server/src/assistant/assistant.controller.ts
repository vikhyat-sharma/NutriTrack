import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import type { MacroBreakdown, NutritionTargets } from '../../../../packages/domain/src';

@UseGuards(JwtAuthGuard)
@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('meal-suggestions')
  suggestMeal(@Body() body: { targets: NutritionTargets }) {
    return this.assistantService.suggestMeal(body.targets);
  }

  @Post('macro-adjustments')
  suggestMacroAdjustment(@Body() body: { consumed: MacroBreakdown; targets: NutritionTargets }) {
    return this.assistantService.suggestMacroAdjustment(body.consumed, body.targets);
  }

  @Post('explain-nutrition')
  explainNutrition(@Body() body: { values: MacroBreakdown }) {
    return this.assistantService.explainNutrition(body.values);
  }
}
