import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { MealsService } from './meals.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CreateMealDto, UpdateMealDto } from './meals.dto';

interface AuthRequest {
  user: { id: string };
}

@UseGuards(JwtAuthGuard)
@Controller('meals')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Post()
  create(@Req() req: AuthRequest, @Body() dto: CreateMealDto) {
    return this.mealsService.createMeal(req.user.id, dto);
  }

  @Get()
  list(@Req() req: AuthRequest, @Query('date') date: string) {
    return this.mealsService.getMealsByDate(req.user.id, date ?? new Date().toISOString().split('T')[0]);
  }

  @Patch(':id')
  update(@Req() req: AuthRequest, @Param('id') id: string, @Body() dto: UpdateMealDto) {
    return this.mealsService.updateMeal(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.mealsService.deleteMeal(req.user.id, id);
  }
}
