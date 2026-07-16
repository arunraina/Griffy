import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '@prisma/client';
import { TurnkeyProjectsService } from './turnkey-projects.service';
import { CreateTurnkeyProjectDto, PostProjectUpdateDto, ProposeMilestoneDto, RequestMilestoneChangesDto } from './dto/turnkey.dto';

@Controller('turnkey-projects')
@UseGuards(AuthGuard)
export class TurnkeyProjectsController {
  constructor(private readonly turnkey: TurnkeyProjectsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() body: CreateTurnkeyProjectDto) {
    return this.turnkey.create(user.id, body);
  }

  @Get('mine')
  listMine(@CurrentUser() user: User) {
    return this.turnkey.listMine(user.id);
  }

  @Get('assigned')
  listAssigned(@CurrentUser() user: User) {
    return this.turnkey.listAssigned(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.turnkey.findOne(id, user.id);
  }

  @Patch(':id/accept')
  accept(@CurrentUser() user: User, @Param('id') id: string) {
    return this.turnkey.accept(id, user.id);
  }

  @Patch(':id/decline')
  decline(@CurrentUser() user: User, @Param('id') id: string) {
    return this.turnkey.decline(id, user.id);
  }

  @Patch(':id/complete')
  complete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.turnkey.markCompleted(id, user.id);
  }

  @Patch(':id/cancel')
  cancel(@CurrentUser() user: User, @Param('id') id: string) {
    return this.turnkey.cancel(id, user.id);
  }

  @Post(':id/updates')
  postUpdate(@CurrentUser() user: User, @Param('id') id: string, @Body() body: PostProjectUpdateDto) {
    return this.turnkey.postUpdate(id, user.id, body);
  }

  @Get(':id/updates')
  listUpdates(@CurrentUser() user: User, @Param('id') id: string) {
    return this.turnkey.listUpdates(id, user.id);
  }

  @Post(':id/milestones')
  proposeMilestone(@CurrentUser() user: User, @Param('id') id: string, @Body() body: ProposeMilestoneDto) {
    return this.turnkey.proposeMilestone(id, user.id, body);
  }

  @Get(':id/milestones')
  listMilestones(@CurrentUser() user: User, @Param('id') id: string) {
    return this.turnkey.listMilestones(id, user.id);
  }

  @Patch('milestones/:milestoneId/submit')
  submitMilestone(@CurrentUser() user: User, @Param('milestoneId') milestoneId: string) {
    return this.turnkey.submitMilestone(milestoneId, user.id);
  }

  @Patch('milestones/:milestoneId/approve')
  approveMilestone(@CurrentUser() user: User, @Param('milestoneId') milestoneId: string) {
    return this.turnkey.approveMilestone(milestoneId, user.id);
  }

  @Patch('milestones/:milestoneId/request-changes')
  requestChanges(
    @CurrentUser() user: User,
    @Param('milestoneId') milestoneId: string,
    @Body() body: RequestMilestoneChangesDto,
  ) {
    return this.turnkey.requestMilestoneChanges(milestoneId, user.id, body.note);
  }
}
