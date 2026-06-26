import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly s3: AWS.S3;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.s3 = new AWS.S3({
      accessKeyId: config.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY'),
      region: config.get('AWS_REGION', 'ap-south-1'),
    });
    this.bucket = config.get('AWS_S3_BUCKET', 'griffy-uploads');
  }

  async uploadFile(file: Express.Multer.File, folder = 'uploads'): Promise<string> {
    const key = `${folder}/${uuidv4()}-${file.originalname.replace(/\s+/g, '-')}`;

    await this.s3.putObject({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    }).promise();

    return `https://${this.bucket}.s3.${this.config.get('AWS_REGION', 'ap-south-1')}.amazonaws.com/${key}`;
  }

  async deleteFile(url: string): Promise<void> {
    const key = url.split('.amazonaws.com/')[1];
    if (!key) return;
    await this.s3.deleteObject({ Bucket: this.bucket, Key: key }).promise();
  }

  generatePresignedUrl(key: string, expiresIn = 3600): string {
    return this.s3.getSignedUrl('getObject', {
      Bucket: this.bucket,
      Key: key,
      Expires: expiresIn,
    });
  }
}
