import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

export type StorageFolder = 'avatars' | 'materials' | 'documents' | 'portfolio';

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

  private isS3Configured(): boolean {
    return !!(
      this.config.get('AWS_ACCESS_KEY_ID') &&
      this.config.get('AWS_SECRET_ACCESS_KEY') &&
      this.config.get('AWS_REGION') &&
      this.config.get('AWS_S3_BUCKET')
    );
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

  // Server-side upload for generated files (e.g. invoice PDFs), as opposed
  // to the client presigned-upload flow above. Returns an opaque location
  // string prefixed by backend (s3:// or file://) — downloadBuffer() below
  // is the only thing that needs to understand it.
  // TODO: once AWS_* env vars are populated, this always uses S3 and the
  // local-disk branch becomes dead code for anything but local dev.
  async uploadBuffer(folder: StorageFolder, filename: string, buffer: Buffer, contentType: string): Promise<{ location: string }> {
    if (this.isS3Configured()) {
      const key = `${folder}/${filename}`;
      await this.s3.send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: buffer, ContentType: contentType }));
      return { location: `s3://${key}` };
    }

    const dir = join(process.cwd(), 'uploads', folder);
    await mkdir(dir, { recursive: true });
    const filePath = join(dir, filename);
    await writeFile(filePath, buffer);
    return { location: `file://${filePath}` };
  }

  // Server-side upload for images that must be PUBLICLY viewable (avatars,
  // portfolio photos) — unlike uploadBuffer()/downloadBuffer() above (used
  // for invoice PDFs, which are access-controlled and only ever served
  // through an authenticated endpoint), this returns a real fetchable URL
  // directly. The local-disk fallback is served by ServeStaticModule at
  // /uploads (see app.module.ts).
  async uploadPublicImage(folder: StorageFolder, filename: string, buffer: Buffer, contentType: string): Promise<string> {
    if (this.isS3Configured()) {
      const key = `${folder}/${filename}`;
      await this.s3.send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: buffer, ContentType: contentType }));
      return `https://${this.bucket}.s3.amazonaws.com/${key}`;
    }

    const dir = join(process.cwd(), 'uploads', folder);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), buffer);
    const apiBaseUrl = this.config.get<string>('API_BASE_URL') ?? 'http://localhost:3001';
    return `${apiBaseUrl}/media/${folder}/${filename}`;
  }

  async downloadBuffer(location: string): Promise<Buffer> {
    if (location.startsWith('s3://')) {
      const key = location.slice('s3://'.length);
      const res = await this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
      return Buffer.from(await res.Body!.transformToByteArray());
    }
    if (location.startsWith('file://')) {
      return readFile(location.slice('file://'.length));
    }
    throw new Error(`Unrecognized storage location: ${location}`);
  }
}
