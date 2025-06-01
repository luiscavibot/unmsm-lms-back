import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsUrl } from 'class-validator';
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
    description: 'URL para materiales de tipo enlace externo',
    example: 'https://example.com/resource',
    required: false
  })
  @IsString()
  @IsUrl()
  @IsOptional()
  url?: string;

  @ApiProperty({
    description: 'Nuevo archivo a subir (opcional)',
    type: 'string',
    format: 'binary',
    required: false
  })
  file?: Express.Multer.File;
}
