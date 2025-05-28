import { Injectable, Inject } from '@nestjs/common';
import { FileMetadata } from '../entities/file-metadata.entity';
import { IStorageService } from 'src/common/storage/interfaces/storage.service.interface';
import { IFilesRepository } from '../interfaces/files.repository.interface';
import { FILES_REPOSITORY } from '../tokens';

@Injectable()
export class FilesService {
  constructor(
    @Inject(IStorageService) private readonly storageService: IStorageService,
    @Inject(FILES_REPOSITORY)
    private readonly filesRepository: IFilesRepository,
  ) {}
  private sanitizePath(path: string): string {
    const trimmed = path.replace(/^\/+|\/+$/g, '');
    return trimmed.replace(/\/{2,}/g, '/');
  }

  async upload(file: Express.Multer.File, userId: string, path = '') {
    const cleanPath = path ? this.sanitizePath(path) : '';
    const key = cleanPath ? `${cleanPath}/${file.originalname}` : file.originalname;
    const hashed = await this.storageService.uploadFile(file.buffer, key, file.mimetype);
    return this.filesRepository.create(file, userId, hashed);
  }

  async findAll(): Promise<FileMetadata[]> {
    return this.filesRepository.findAll();
  }

  async findOne(id: number): Promise<FileMetadata | null> {
    return this.filesRepository.findOne(id);
  }
  async remove(id: number): Promise<FileMetadata | null> {
    const file = await this.filesRepository.remove(id);
    if (file) {
      await this.storageService.deleteFile(file.hashedName);
    }
    return file;
  }
  async update(id: number, file: Express.Multer.File, userId: string): Promise<FileMetadata | null> {
    const existingFile = await this.filesRepository.update(id, file, userId);
    if (existingFile) {
      await this.storageService.updateFile(file.buffer, existingFile.hashedName, file.mimetype);
    }
    return existingFile;
  }
}
