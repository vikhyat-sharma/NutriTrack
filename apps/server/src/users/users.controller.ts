import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async me(@Req() req: any) {
    // placeholder: in real app use auth guard and user from request
    const userId = req.user?.id || null;
    if (!userId) return { error: 'unauthenticated' };
    return this.usersService.findById(userId);
  }
}
