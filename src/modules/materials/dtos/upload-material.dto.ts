import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { MaterialType } from '../enums/material-type.enum';

export class UploadMaterialDto {
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
    description: 'Archivo a subir',
    type: 'string',
    format: 'binary',
  })
  file: Express.Multer.File;
}
