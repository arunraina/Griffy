import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { StorageService, StorageFolder } from './storage.service';

@Controller('storage')
@UseGuards(AuthGuard)
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Post('presigned-url')
  getPresignedUrl(@Body() body: { folder: StorageFolder; contentType: string }) {
    return this.storage.getPresignedUrl(body.folder, body.contentType);
  }
}
