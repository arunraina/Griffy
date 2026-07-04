import {
  Body, Controller, Get, Param, Patch, Post,
  Query, Request, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EnquiriesService } from './enquiries.service';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { ReplyEnquiryDto } from './dto/reply-enquiry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('enquiries')
@Controller('enquiries')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EnquiriesController {
  constructor(private readonly enquiriesService: EnquiriesService) {}

  @Post()
  create(@Body() dto: CreateEnquiryDto, @Request() req: any) {
    return this.enquiriesService.create(dto, req.user.id);
  }

  @Get('sent')
  getSent(
    @Request() req: any,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.enquiriesService.findSent(req.user.id, page, limit);
  }

  @Get('received')
  getReceived(
    @Request() req: any,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.enquiriesService.findReceived(req.user.id, page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enquiriesService.findOne(id);
  }

  @Patch(':id/reply')
  reply(@Param('id') id: string, @Body() dto: ReplyEnquiryDto, @Request() req: any) {
    return this.enquiriesService.reply(id, dto, req.user.id);
  }
}
