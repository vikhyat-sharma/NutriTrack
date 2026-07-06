import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

interface AuthRequest {
  user: { id: string };
}

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('daily-summary')
  daily(@Req() req: AuthRequest, @Query('date') date: string) {
    return this.dashboardService.getDailySummary(req.user.id, date ?? new Date().toISOString().split('T')[0]);
  }

  @Get('weekly-summary')
  weekly(@Req() req: AuthRequest) {
    return this.dashboardService.getWeeklySummary(req.user.id);
  }

  @Get('monthly-summary')
  monthly(@Req() req: AuthRequest) {
    return this.dashboardService.getMonthlySummary(req.user.id);
  }

  @Get('weight-trend')
  weightTrend(@Req() req: AuthRequest) {
    return this.dashboardService.getWeightTrend(req.user.id);
  }
}
