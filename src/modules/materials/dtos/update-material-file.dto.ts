import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { MaterialType } from '../enums/material-type.enum';

export class UpdateMaterialFileDto {
  @ApiProperty({
    description: 'Nuevo título para el material',
    example: 'Presentación actualizada Clase 1',
    required: false
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Nuevo tipo de material',
    enum: MaterialType,
    enumName: 'MaterialType',
    example: MaterialType.CLASS_SLIDES,
    required: false
  })
  @IsEnum(MaterialType)
  @IsOptional()
  type?: MaterialType;

  @ApiProperty({
    description: 'Nuevo archivo a subir (opcional)',
    type: 'string',
    format: 'binary',
    required: false
  })
  file?: Express.Multer.File;
}
