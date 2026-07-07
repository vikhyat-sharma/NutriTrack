import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { UpdateProfileDto } from './users.dto';

interface AuthRequest {
  user: { id: string; email: string };
}

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  me(@Req() req: AuthRequest) {
    return this.usersService.findById(req.user.id);
  }

  @Patch('me/profile')
  updateProfile(@Req() req: AuthRequest, @Body() dto: UpdateProfileDto) {
    return this.usersService.upsertProfile(req.user.id, dto);
  }
}
