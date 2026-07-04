import { Body, Controller, Delete, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SavedService } from './saved.service';
import { SaveItemDto } from './dto/save-item.dto';
import { SavedItemType } from './saved-item.entity';

@ApiTags('saved')
@Controller('saved')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SavedController {
  constructor(private readonly savedService: SavedService) {}

  @Post()
  save(@Body() dto: SaveItemDto, @Request() req: any) {
    return this.savedService.save(req.user.id, dto.type, dto.targetId);
  }

  @Delete(':type/:targetId')
  unsave(
    @Param('type') type: SavedItemType,
    @Param('targetId') targetId: string,
    @Request() req: any,
  ) {
    return this.savedService.unsave(req.user.id, type, targetId);
  }

  @Get()
  findAll(@Request() req: any, @Query('type') type?: SavedItemType) {
    return this.savedService.findAll(req.user.id, type);
  }

  @Get(':type/:targetId')
  isSaved(
    @Param('type') type: SavedItemType,
    @Param('targetId') targetId: string,
    @Request() req: any,
  ) {
    return this.savedService.isSaved(req.user.id, type, targetId);
  }
}
