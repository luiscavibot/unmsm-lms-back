import { Module } from '@nestjs/common';
import { FilesService } from './services/files.service';
import { FilesController } from './controllers/files.controller';
import { StorageModule } from 'src/common/storage/storage.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileMetadata } from './entities/file-metadata.entity';
import { FILES_REPOSITORY } from './tokens';
import { TypeormFilesRepository } from './repositories/typeorm-files.repository';

@Module({
  imports: [StorageModule, TypeOrmModule.forFeature([FileMetadata])],

  controllers: [FilesController],
  providers: [
    FilesService,
    {
      provide: FILES_REPOSITORY,
      useClass: TypeormFilesRepository,
    },
  ],
  exports: [FilesService],
})
export class FilesModule {}
