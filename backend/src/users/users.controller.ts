import { Body, Controller, Get, Param, Patch, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  @ApiBearerAuth()
  updateMe(@Request() req: any, @Body() body: { fullName?: string; phone?: string; city?: string; state?: string }) {
    return this.usersService.updateMe(req.user.id, body);
  }

  @Get('me/referral')
  getReferralStats(@Request() req: any) {
    return this.usersService.getReferralStats(req.user.id);
  }

  @Get()
  findAll(@Query('page') page: number, @Query('limit') limit: number) {
    return this.usersService.findAll(page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
