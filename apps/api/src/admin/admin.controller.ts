import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AdminService, type ContentType } from './admin.service';
import { PaymentsService } from '../payments/payments.service';
import { ApprovalStatus, ProjectStatus, User, UserRole, KycStatus, PaymentStatus, RefundStatus } from '@prisma/client';
import { RejectProfileDto, ModerateProjectDto, ModerateContentDto, CreateRefundDto } from './dto/admin.dto';
import { RejectKycDto } from '../kyc/dto/kyc.dto';

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly payments: PaymentsService,
  ) {}

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
    @Body() body: RejectProfileDto,
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

  @Get('orders')
  async listOrders(@CurrentUser() user: User, @Query('paymentStatus') paymentStatus?: PaymentStatus) {
    await this.admin.assertAdmin(user.id);
    return this.admin.listOrders(paymentStatus);
  }

  @Post('orders/:id/refund')
  async createRefund(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: CreateRefundDto,
  ) {
    await this.admin.assertAdmin(user.id);
    return this.payments.createRefund(user.id, id, body.amount, body.reason);
  }

  @Get('refunds')
  async listRefunds(@CurrentUser() user: User, @Query('status') status?: RefundStatus) {
    await this.admin.assertAdmin(user.id);
    return this.payments.listRefunds(status);
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
    @Body() body: ModerateProjectDto,
  ) {
    await this.admin.assertAdmin(user.id);
    return this.admin.moderateProject(id, body.status);
  }

  @Get('career-applications')
  async listCareerApplications(@CurrentUser() user: User) {
    await this.admin.assertAdmin(user.id);
    return this.admin.listCareerApplications();
  }

  @Get('early-access-signups')
  async listEarlyAccessSignups(@CurrentUser() user: User) {
    await this.admin.assertAdmin(user.id);
    return this.admin.listEarlyAccessSignups();
  }

  @Get('summary')
  async getSummary(@CurrentUser() user: User) {
    await this.admin.assertAdmin(user.id);
    return this.admin.getDashboardSummary();
  }

  @Get('metrics')
  async getMetrics(@CurrentUser() user: User) {
    await this.admin.assertAdmin(user.id);
    return this.admin.getGrowthMetrics();
  }

  @Get('content/:type')
  async listContent(@CurrentUser() user: User, @Param('type') type: string) {
    await this.admin.assertAdmin(user.id);
    return this.admin.listContent(type as ContentType);
  }

  @Patch('content/:type/:id/moderate')
  async moderateContent(
    @CurrentUser() user: User,
    @Param('type') type: string,
    @Param('id') id: string,
    @Body() body: ModerateContentDto,
  ) {
    await this.admin.assertAdmin(user.id);
    return this.admin.moderateContent(type as ContentType, id, body);
  }

  @Get('users')
  async listUsers(
    @CurrentUser() user: User,
    @Query('search') search?: string,
    @Query('role') role?: UserRole,
  ) {
    await this.admin.assertAdmin(user.id);
    return this.admin.listUsers(search, role);
  }

  @Patch('users/:id/suspend')
  async suspendUser(@CurrentUser() user: User, @Param('id') id: string) {
    await this.admin.assertAdmin(user.id);
    if (id === user.id) throw new ForbiddenException('Cannot suspend your own account');
    return this.admin.setUserSuspended(id, true);
  }

  @Patch('users/:id/unsuspend')
  async unsuspendUser(@CurrentUser() user: User, @Param('id') id: string) {
    await this.admin.assertAdmin(user.id);
    return this.admin.setUserSuspended(id, false);
  }

  @Get('kyc')
  async listKyc(@CurrentUser() user: User, @Query('status') status?: KycStatus) {
    await this.admin.assertAdmin(user.id);
    return this.admin.listKyc(status);
  }

  @Patch('kyc/:userId/verify')
  async verifyKyc(@CurrentUser() user: User, @Param('userId') userId: string) {
    await this.admin.assertAdmin(user.id);
    return this.admin.setKycStatus(userId, KycStatus.VERIFIED);
  }

  @Patch('kyc/:userId/reject')
  async rejectKyc(
    @CurrentUser() user: User,
    @Param('userId') userId: string,
    @Body() body: RejectKycDto,
  ) {
    await this.admin.assertAdmin(user.id);
    return this.admin.setKycStatus(userId, KycStatus.REJECTED, body.reason);
  }
}
