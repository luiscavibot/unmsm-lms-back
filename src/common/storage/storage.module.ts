import { Module } from '@nestjs/common';
import { S3Service } from './services/s3-storage.service';
import { IStorageService } from './interfaces/storage.service.interface';

@Module({
  exports: [
    {
      provide: IStorageService,
      useClass: S3Service,
    },
  ],
  providers: [
    {
      provide: IStorageService,
      useClass: S3Service,
    },
    S3Service,
  ],
})
export class StorageModule {}
