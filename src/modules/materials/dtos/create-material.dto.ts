import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsOptional, IsEnum } from 'class-validator';
import { MaterialType } from '../enums/material-type.enum';

export class CreateMaterialDto {
  @ApiProperty({
    description: 'ID de la semana',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  weekId: string;

  @ApiProperty({
    description: 'Título del material',
    example: 'Presentación Clase 1',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Tipo de material',
    enum: MaterialType,
    enumName: 'MaterialType',
    example: MaterialType.CLASS_SLIDES,
  })
  @IsEnum(MaterialType)
  @IsNotEmpty()
  type: MaterialType;

  @ApiProperty({
    description: 'URL del archivo',
    example: 'https://storage.googleapis.com/materials/file.pdf',
  })
  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @ApiProperty({
    description: 'ID del usuario que subió el material',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  uploadedById?: string;
}
