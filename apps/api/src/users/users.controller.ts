import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { UsersService } from './users.service';
import { User, UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: User) {
    return user;
  }

  @Patch('me')
  updateMe(
    @CurrentUser() user: User,
    @Body() body: Partial<Pick<User, 'name' | 'phone' | 'avatarUrl'>>,
  ) {
    return this.users.update(user.id, body);
  }

  @Patch('me/role')
  setRole(@CurrentUser() user: User, @Body() body: { role: UserRole }) {
    return this.users.setRole(user.id, body.role);
  }

  @Get('me/referral')
  getReferralStats(@CurrentUser() user: User) {
    return this.users.getReferralStats(user.id);
  }

  @Get('me/analytics')
  getMyAnalytics(@CurrentUser() user: User) {
    return this.users.getMyAnalytics(user.id);
  }
}
