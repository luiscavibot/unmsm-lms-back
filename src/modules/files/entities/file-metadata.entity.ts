import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class FileMetadata {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'document.pdf' })
  @Column()
  originalName: string;

  @ApiProperty({ example: 'document-1a2b3c4d.pdf' })
  @Column()
  hashedName: string;

  @ApiProperty({ example: 'application/pdf' })
  @Column()
  mimeType: string;

  @ApiProperty({ example: 102400 })
  @Column('bigint')
  size: number;

  @ApiProperty({ example: 'user-id-123' })
  @Column()
  uploadedBy: string;

  @ApiProperty({ example: '2025-05-27T15:00:00Z' })
  @Column({ type: 'timestamp' })
  uploadDate: Date;
}
