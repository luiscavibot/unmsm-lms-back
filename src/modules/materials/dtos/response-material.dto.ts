import { ApiProperty } from '@nestjs/swagger';
import { MaterialType } from '../enums/material-type.enum';

export class MaterialResponseDto {
  @ApiProperty({
    description: 'ID del material',
    example: 'unique-id',
  })
  materialId: string;

  @ApiProperty({
    description: 'Nombre del material',
    example: 'Clase 5: Redes de computadoras: Un enfoque descendente',
  })
  name: string;

  @ApiProperty({
    description: 'Tipo de material',
    enum: MaterialType,
    example: MaterialType.CLASS_RECORDING,
  })
  materialType: MaterialType;

  @ApiProperty({
    description: 'Fecha de subida',
    example: '2025-03-29',
  })
  uploadDate: string;

  @ApiProperty({
    description: 'ID del usuario que subió el material',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  uploadedById: string;

  @ApiProperty({
    description: 'Nombre del usuario que subió el material',
    example: 'Eduardo Romero',
  })
  uploadedByName: string;

  @ApiProperty({
    description: 'URL del material',
    example: 'https://www.material.com',
  })
  materialUrl: string;

  @ApiProperty({
    description: 'Extensión del archivo',
    example: 'pdf',
    nullable: true
  })
  fileExtension: string;
}

export class WeekWithMaterialsDto {
  @ApiProperty({
    description: 'ID de la semana',
    example: 'asdf-asdf',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre de la semana',
    example: 'Semana 2',
  })
  week: string;

  @ApiProperty({
    description: 'Número de la semana',
    example: 2,
  })
  weekNumber: number;

  @ApiProperty({
    description: 'Materiales de la semana',
    type: [MaterialResponseDto],
  })
  materials: MaterialResponseDto[];
}

export class GetMaterialsByBlockDto {
  @ApiProperty({
    description: 'Lista de semanas con sus materiales',
    type: [WeekWithMaterialsDto],
  })
  weeks: WeekWithMaterialsDto[];
}
