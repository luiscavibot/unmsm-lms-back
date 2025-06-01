import { FileMetadata } from '../entities/file-metadata.entity';

export interface IFilesRepository {
  create(file: Express.Multer.File, userId: string, hashed: string): Promise<FileMetadata>;
  findAll(): Promise<FileMetadata[]>;
  findOne(id: number): Promise<FileMetadata | null>;
  findByHashedName(hashedName: string): Promise<FileMetadata | null>;
  remove(id: number): Promise<FileMetadata | null>;
  update(id: number, file: Express.Multer.File, userId: string): Promise<FileMetadata | null>;
}
