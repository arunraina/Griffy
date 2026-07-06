import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { StorageService } from './storage.service';
import { GetPresignedUrlDto } from './dto/presigned-url.dto';

@Controller('storage')
@UseGuards(AuthGuard)
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Post('presigned-url')
  getPresignedUrl(@Body() body: GetPresignedUrlDto) {
    return this.storage.getPresignedUrl(body.folder, body.contentType);
  }
}
