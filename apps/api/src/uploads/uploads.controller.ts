import { BadRequestException, Body, Controller, Post, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard';
import { UploadsService } from './uploads.service';
import { UploadImageDto } from './dto/upload-image.dto';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

@Controller('uploads')
@UseGuards(AuthGuard)
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE } }))
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Body() body: UploadImageDto) {
    if (file && file.size > MAX_FILE_SIZE) throw new BadRequestException('File must be 5MB or smaller');
    return this.uploads.processAndUpload(file, body.folder);
  }
}
