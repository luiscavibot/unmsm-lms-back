import { Injectable, Inject } from '@nestjs/common';
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { IStorageService } from '../interfaces/storage.service.interface';
import { Readable } from 'stream';
import { Sha256 } from '@aws-crypto/sha256-js';

const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
};

@Injectable()
export class S3Service implements IStorageService {
  private readonly bucket: string;

  constructor(
    @Inject('S3_CLIENT') private readonly client: S3Client,
    private readonly config: ConfigService,
  ) {
    const bucketName = this.config.get<string>('S3_BUCKET');
    if (!bucketName) {
      throw new Error('S3_BUCKET configuration is required');
    }
    this.bucket = bucketName;
  }

  private async addHash(originalName: string): Promise<string> {
    const raw = `${Date.now()}-${originalName}`;
    const hasher = new Sha256();
    hasher.update(raw);
    const hashBuffer = await hasher.digest();
    const hash = Buffer.from(hashBuffer).toString('hex').slice(0, 8);
    const base = originalName.replace(/\.[^.]+$/, '');
    const ext = originalName.split('.').pop();
    return `${base}-${hash}.${ext}`;
  }

  async uploadFile(buffer: Buffer, key: string, mimeType: string): Promise<string> {
    const hashedKey = await this.addHash(key);
    await this.client.send(
      new PutObjectCommand({ Bucket: this.bucket, Key: hashedKey, Body: buffer, ContentType: mimeType }),
    );
    return hashedKey;
  }

  async getFile(key: string): Promise<Buffer> {
    const { Body } = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
    if (!Body || !(Body instanceof Readable)) {
      throw new Error('File not found or invalid response');
    }
    return streamToBuffer(Body as Readable);
  }

  async deleteFile(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  async updateFile(buffer: Buffer, key: string, mimeType: string): Promise<string> {
    await this.deleteFile(key);
    return this.uploadFile(buffer, key, mimeType);
  }
}
