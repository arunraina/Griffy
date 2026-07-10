import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '@prisma/client';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioItemDto, UpdatePortfolioItemDto } from './dto/portfolio-item.dto';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolio: PortfolioService) {}

  @Get(':profileType/:profileId')
  list(@Param('profileType') profileType: string, @Param('profileId') profileId: string) {
    return this.portfolio.list(profileType, profileId);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(@CurrentUser() user: User, @Body() body: CreatePortfolioItemDto) {
    return this.portfolio.create(user.id, body);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() body: UpdatePortfolioItemDto) {
    return this.portfolio.update(user.id, id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.portfolio.remove(user.id, id);
  }
}
