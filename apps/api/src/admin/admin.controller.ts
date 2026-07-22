import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AdminService, type ContentType } from './admin.service';
import { PaymentsService } from '../payments/payments.service';
import { ReportsService } from '../reports/reports.service';
import { ApprovalStatus, ProjectStatus, User, UserRole, KycStatus, PaymentStatus, RefundStatus, ReportStatus } from '@prisma/client';
import { RejectProfileDto, ModerateProjectDto, ModerateContentDto, CreateRefundDto, CreateUserDto, SetAdminRoleDto, SetAccountStatusDto, UpdateAdminProfileDto } from './dto/admin.dto';
import { RejectKycDto } from '../kyc/dto/kyc.dto';
import { UpdateReportStatusDto } from '../reports/dto/report.dto';
import { CreatePortfolioItemDto } from '../portfolio/dto/portfolio-item.dto';
import { CreateServiceItemDto } from '../service-items/dto/service-item.dto';

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly payments: PaymentsService,
    private readonly reports: ReportsService,
  ) {}

  @Get('reports')
  async listReports(@CurrentUser() user: User, @Query('status') status?: ReportStatus) {
    await this.admin.assertAdminSection(user.id, 'REPORTS');
    return this.reports.listAll(status);
  }

  @Patch('reports/:id/status')
  async updateReportStatus(@CurrentUser() user: User, @Param('id') id: string, @Body() body: UpdateReportStatusDto) {
    await this.admin.assertAdminSection(user.id, 'REPORTS');
    return this.reports.setStatus(id, body.status);
  }

  @Get('profiles/:type')
  async listProfiles(
    @CurrentUser() user: User,
    @Param('type') type: string,
    @Query('status') status?: ApprovalStatus,
  ) {
    await this.admin.assertAdminSection(user.id, 'APPROVALS');
    return this.admin.listProfiles(type as Parameters<AdminService['listProfiles']>[0], status);
  }

  @Patch('profiles/:type/:id/approve')
  async approve(
    @CurrentUser() user: User,
    @Param('type') type: string,
    @Param('id') id: string,
  ) {
    await this.admin.assertAdminSection(user.id, 'APPROVALS');
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
    await this.admin.assertAdminSection(user.id, 'APPROVALS');
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
    await this.admin.assertAdminSection(user.id, 'ORDERS');
    return this.admin.listOrders(paymentStatus);
  }

  @Post('orders/:id/refund')
  async createRefund(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: CreateRefundDto,
  ) {
    await this.admin.assertAdminSection(user.id, 'ORDERS');
    return this.payments.createRefund(user.id, id, body.amount, body.reason);
  }

  @Get('refunds')
  async listRefunds(@CurrentUser() user: User, @Query('status') status?: RefundStatus) {
    await this.admin.assertAdminSection(user.id, 'ORDERS');
    return this.payments.listRefunds(status);
  }

  @Get('projects')
  async listProjects(@CurrentUser() user: User, @Query('status') status?: ProjectStatus) {
    await this.admin.assertAdminSection(user.id, 'CONTENT_MODERATION');
    return this.admin.listAllProjects(status);
  }

  @Patch('projects/:id/status')
  async moderateProject(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: ModerateProjectDto,
  ) {
    await this.admin.assertAdminSection(user.id, 'CONTENT_MODERATION');
    return this.admin.moderateProject(id, body.status);
  }

  @Get('career-applications')
  async listCareerApplications(@CurrentUser() user: User) {
    await this.admin.assertAdminSection(user.id, 'CAREERS');
    return this.admin.listCareerApplications();
  }

  @Get('early-access-signups')
  async listEarlyAccessSignups(@CurrentUser() user: User) {
    await this.admin.assertAdminSection(user.id, 'EARLY_ACCESS');
    return this.admin.listEarlyAccessSignups();
  }

  @Get('summary')
  async getSummary(@CurrentUser() user: User) {
    await this.admin.assertFullAccess(user.id);
    return this.admin.getDashboardSummary();
  }

  @Get('metrics')
  async getMetrics(@CurrentUser() user: User) {
    await this.admin.assertFullAccess(user.id);
    return this.admin.getGrowthMetrics();
  }

  @Get('content/:type')
  async listContent(@CurrentUser() user: User, @Param('type') type: string) {
    await this.admin.assertAdminSection(user.id, 'CONTENT_MODERATION');
    return this.admin.listContent(type as ContentType);
  }

  @Patch('content/:type/:id/moderate')
  async moderateContent(
    @CurrentUser() user: User,
    @Param('type') type: string,
    @Param('id') id: string,
    @Body() body: ModerateContentDto,
  ) {
    await this.admin.assertAdminSection(user.id, 'CONTENT_MODERATION');
    return this.admin.moderateContent(type as ContentType, id, body);
  }

  @Get('users')
  async listUsers(
    @CurrentUser() user: User,
    @Query('search') search?: string,
    @Query('role') role?: UserRole,
  ) {
    await this.admin.assertAdminSection(user.id, 'USERS');
    return this.admin.listUsers(search, role);
  }

  @Post('users')
  async createUser(@CurrentUser() user: User, @Body() body: CreateUserDto) {
    await this.admin.assertAdminSection(user.id, 'USERS');
    return this.admin.createUser(body, user.id);
  }

  // Profile + existing listings for the "manage this person's listings"
  // admin screen — reached by clicking a name in the Users list.
  @Get('users/:id')
  async getUserDetail(@CurrentUser() user: User, @Param('id') id: string) {
    await this.admin.assertAdminSection(user.id, 'USERS');
    return this.admin.getUserDetail(id);
  }

  @Patch('users/:id/profile')
  async updateUserProfile(@CurrentUser() user: User, @Param('id') id: string, @Body() body: UpdateAdminProfileDto) {
    await this.admin.assertAdminSection(user.id, 'USERS');
    return this.admin.updateUserProfile(id, body, user.id);
  }

  @Post('users/:id/portfolio-items')
  async createPortfolioItemFor(@CurrentUser() user: User, @Param('id') id: string, @Body() body: CreatePortfolioItemDto) {
    await this.admin.assertAdminSection(user.id, 'USERS');
    return this.admin.createPortfolioItemFor(id, body, user.id);
  }

  @Post('users/:id/service-items')
  async createServiceItemFor(@CurrentUser() user: User, @Param('id') id: string, @Body() body: CreateServiceItemDto) {
    await this.admin.assertAdminSection(user.id, 'USERS');
    return this.admin.createServiceItemFor(id, body, user.id);
  }

  @Get('users/:id/bookings')
  async getProviderBookings(@CurrentUser() user: User, @Param('id') id: string) {
    await this.admin.assertAdminSection(user.id, 'USERS');
    return this.admin.getProviderBookings(id);
  }

  @Get('users/:id/reviews')
  async getProviderReviews(@CurrentUser() user: User, @Param('id') id: string) {
    await this.admin.assertAdminSection(user.id, 'USERS');
    return this.admin.getProviderReviewsByUserId(id);
  }

  @Patch('users/:id/suspend')
  async suspendUser(@CurrentUser() user: User, @Param('id') id: string) {
    await this.admin.assertAdminSection(user.id, 'USERS');
    if (id === user.id) throw new ForbiddenException('Cannot suspend your own account');
    return this.admin.setUserSuspended(id, true, user.id);
  }

  @Patch('users/:id/unsuspend')
  async unsuspendUser(@CurrentUser() user: User, @Param('id') id: string) {
    await this.admin.assertAdminSection(user.id, 'USERS');
    return this.admin.setUserSuspended(id, false, user.id);
  }

  @Patch('users/:id/status')
  async setAccountStatus(@CurrentUser() user: User, @Param('id') id: string, @Body() body: SetAccountStatusDto) {
    await this.admin.assertAdminSection(user.id, 'USERS');
    return this.admin.setAccountStatus(id, body, user.id);
  }

  @Get('users/:id/status-history')
  async getStatusHistory(@CurrentUser() user: User, @Param('id') id: string) {
    await this.admin.assertAdminSection(user.id, 'USERS');
    return this.admin.getStatusHistory(id);
  }

  // Tiered — AdminService.setAdminRole enforces exactly who can grant what.
  @Patch('users/:id/admin-role')
  async setAdminRole(@CurrentUser() user: User, @Param('id') id: string, @Body() body: SetAdminRoleDto) {
    return this.admin.setAdminRole(id, body.adminRole, user.id);
  }

  @Get('kyc')
  async listKyc(@CurrentUser() user: User, @Query('status') status?: KycStatus) {
    await this.admin.assertAdminSection(user.id, 'KYC');
    return this.admin.listKyc(status);
  }

  @Patch('kyc/:userId/verify')
  async verifyKyc(@CurrentUser() user: User, @Param('userId') userId: string) {
    await this.admin.assertAdminSection(user.id, 'KYC');
    return this.admin.setKycStatus(userId, KycStatus.VERIFIED);
  }

  @Patch('kyc/:userId/reject')
  async rejectKyc(
    @CurrentUser() user: User,
    @Param('userId') userId: string,
    @Body() body: RejectKycDto,
  ) {
    await this.admin.assertAdminSection(user.id, 'KYC');
    return this.admin.setKycStatus(userId, KycStatus.REJECTED, body.reason);
  }
}
