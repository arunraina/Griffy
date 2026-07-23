import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '@prisma/client';
import { EnquiriesService } from './enquiries.service';
import { CreateEnquiryDto, UpdateEnquiryStatusDto } from './dto/enquiry.dto';

@Controller('enquiries')
export class EnquiriesController {
  constructor(private readonly enquiries: EnquiriesService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@CurrentUser() user: User, @Body() body: CreateEnquiryDto) {
    return this.enquiries.create(user.id, body);
  }

  @Get('received')
  @UseGuards(AuthGuard)
  findReceived(@CurrentUser() user: User) {
    return this.enquiries.findReceived(user.id);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard)
  updateStatus(@CurrentUser() user: User, @Param('id') id: string, @Body() body: UpdateEnquiryStatusDto) {
    return this.enquiries.updateStatus(id, user.id, body.status);
  }
}
