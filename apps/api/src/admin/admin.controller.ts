import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AdminService } from './admin.service';
import { ApprovalStatus, ProjectStatus, User } from '@prisma/client';

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('profiles/:type')
  async listProfiles(
    @CurrentUser() user: User,
    @Param('type') type: string,
    @Query('status') status?: ApprovalStatus,
  ) {
    await this.admin.assertAdmin(user.id);
    return this.admin.listProfiles(type as Parameters<AdminService['listProfiles']>[0], status);
  }

  @Patch('profiles/:type/:id/approve')
  async approve(
    @CurrentUser() user: User,
    @Param('type') type: string,
    @Param('id') id: string,
  ) {
    await this.admin.assertAdmin(user.id);
    return this.admin.setApproval(
      type as Parameters<AdminService['setApproval']>[0],
      id,
      ApprovalStatus.APPROVED,
      user.id,
    );
  }

  @Patch('profiles/:type/:id/reject')
  async reject(
    @CurrentUser() user: User,
    @Param('type') type: string,
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    await this.admin.assertAdmin(user.id);
    return this.admin.setApproval(
      type as Parameters<AdminService['setApproval']>[0],
      id,
      ApprovalStatus.REJECTED,
      user.id,
      body.reason,
    );
  }

  @Get('projects')
  async listProjects(@CurrentUser() user: User, @Query('status') status?: ProjectStatus) {
    await this.admin.assertAdmin(user.id);
    return this.admin.listAllProjects(status);
  }

  @Patch('projects/:id/status')
  async moderateProject(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: { status: ProjectStatus },
  ) {
    await this.admin.assertAdmin(user.id);
    return this.admin.moderateProject(id, body.status);
  }

  @Get('career-applications')
  async listCareerApplications(@CurrentUser() user: User) {
    await this.admin.assertAdmin(user.id);
    return this.admin.listCareerApplications();
  }
}
