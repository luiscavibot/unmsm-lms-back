import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
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
    example: 'Grupo 1',
    required: false,
  })
  group?: string;
}