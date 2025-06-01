import { Injectable } from '@nestjs/common';
import { IFilesRepository } from '../interfaces/files.repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { FileMetadata } from '../entities/file-metadata.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TypeormFilesRepository implements IFilesRepository {
  constructor(
    @InjectRepository(FileMetadata)
    private readonly fileMetadataRepository: Repository<FileMetadata>,
  ) {}

  async create(file: Express.Multer.File, userId: string, hashed: string): Promise<FileMetadata> {
    const fileMetadata = this.fileMetadataRepository.create({
      originalName: file.originalname,
      hashedName: hashed,
      mimeType: file.mimetype,
      size: file.size,
      uploadedBy: userId,
      uploadDate: new Date(),
    });

    return this.fileMetadataRepository.save(fileMetadata);
  }

  async findAll(): Promise<FileMetadata[]> {
    return this.fileMetadataRepository.find();
  }

  async findOne(id: number): Promise<FileMetadata | null> {
    return this.fileMetadataRepository.findOne({ where: { id } });
  }

  async findByHashedName(hashedName: string): Promise<FileMetadata | null> {
    return this.fileMetadataRepository.findOne({ where: { hashedName } });
  }

  async remove(id: number): Promise<FileMetadata | null> {
    const file = await this.findOne(id);
    if (file) {
      await this.fileMetadataRepository.delete(id);
      return file;
    }
    return null;
  }

  async update(id: number, file: Express.Multer.File, userId: string): Promise<FileMetadata | null> {
    const existingFile = await this.findOne(id);
    if (!existingFile) {
      return null;
    }

    existingFile.originalName = file.originalname;
    existingFile.hashedName = file.filename;
    existingFile.mimeType = file.mimetype;
    existingFile.size = file.size;
    existingFile.uploadDate = new Date();
    existingFile.uploadedBy = userId;

    return this.fileMetadataRepository.save(existingFile);
  }
}
