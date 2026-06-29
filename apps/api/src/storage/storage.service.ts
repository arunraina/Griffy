import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

export type StorageFolder = 'avatars' | 'materials' | 'documents';

@Injectable()
export class StorageService {
  private _s3: S3Client | null = null;

  constructor(private readonly config: ConfigService) {}

  private get s3(): S3Client {
    if (!this._s3) {
      this._s3 = new S3Client({ region: this.config.getOrThrow('AWS_REGION') });
    }
    return this._s3;
  }

  private get bucket(): string {
    return this.config.getOrThrow('AWS_S3_BUCKET');
  }

  async getPresignedUrl(folder: StorageFolder, contentType: string) {
    const key = `${folder}/${randomUUID()}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    const url = await getSignedUrl(this.s3, command, { expiresIn: 300 });
    return { url, key, publicUrl: `https://${this.bucket}.s3.amazonaws.com/${key}` };
  }
}
