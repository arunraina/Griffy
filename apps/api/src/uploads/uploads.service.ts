import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { StorageService, StorageFolder } from '../storage/storage.service';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Injectable()
export class UploadsService {
  constructor(private readonly storage: StorageService) {}

  async processAndUpload(file: Express.Multer.File | undefined, folder: StorageFolder): Promise<{ url: string }> {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, and WebP images are allowed');
    }

    // Indian mobile data matters: re-encode as JPEG at a fixed max width/
    // quality regardless of input format, rather than trusting the client
    // to have already resized a multi-MB phone photo.
    const resized = await sharp(file.buffer)
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    const filename = `${randomUUID()}.jpg`;
    const url = await this.storage.uploadPublicImage(folder, filename, resized, 'image/jpeg');
    return { url };
  }
}
