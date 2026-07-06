import { Body, Controller, ForbiddenException, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { UsersService } from './users.service';
import { KycService } from '../kyc/kyc.service';
import { KycSubmitDto } from '../kyc/dto/kyc.dto';
import { User } from '@prisma/client';
import { UpdateMeDto, SetRoleDto } from './dto/user.dto';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly kyc: KycService,
  ) {}

  @Get('me')
  getMe(@CurrentUser() user: User) {
    return user;
  }

  @Patch('me')
  updateMe(@CurrentUser() user: User, @Body() body: UpdateMeDto) {
    return this.users.update(user.id, body);
  }

  @Patch('me/role')
  setRole(@CurrentUser() user: User, @Body() body: SetRoleDto) {
    // ADMIN must never be settable via self-service — see LEGACY_ROLE_MAP
    // comment in auth.guard.ts for why client-supplied ADMIN is untrusted.
    if (body.role === 'ADMIN') {
      throw new ForbiddenException('Cannot self-assign the ADMIN role');
    }
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

  @Get('me/kyc')
  getMyKyc(@CurrentUser() user: User) {
    return this.kyc.findMine(user.id);
  }

  @Patch('me/kyc')
  submitMyKyc(@CurrentUser() user: User, @Body() body: KycSubmitDto) {
    return this.kyc.submit(user.id, body);
  }
}
