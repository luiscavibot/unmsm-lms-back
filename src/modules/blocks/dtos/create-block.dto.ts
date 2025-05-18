import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { BlockType } from '../enums/block-type.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBlockDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'ID de la oferta de curso a la que pertenece el bloque',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  courseOfferingId: string;

  @IsNotEmpty()
  @IsEnum(BlockType)
  @ApiProperty({
    description: 'Tipo de bloque',
    enum: BlockType,
    example: BlockType.THEORY,
  })
  type: BlockType;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Grupo al que pertenece el bloque',
    example: 'I',
    required: false,
  })
  group?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Número de aula donde se dicta el bloque',
    example: '301',
    required: false,
  })
  classroomNumber?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'URL del sílabo del curso',
    example: 'https://ejemplo.com/silabo.pdf',
    required: false,
  })
  syllabusUrl?: string;
}
