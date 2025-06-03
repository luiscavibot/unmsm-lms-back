import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEvaluationDto {
  @IsOptional()
  @IsUUID()
  @ApiProperty({
    description: 'ID del bloque al que pertenece la evaluación',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  blockId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Título o nombre de la evaluación',
    example: 'Examen Final',
    required: false
  })
  title?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    description: 'Fecha de la evaluación en formato ISO (YYYY-MM-DD)',
    example: '2025-07-15',
    required: false
  })
  evaluationDate?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @Type(() => Number)
  @ApiProperty({
    description: 'Peso porcentual de la evaluación (0-100)',
    example: 35.0,
    minimum: 0,
    maximum: 100,
    required: false
  })
  weight?: number;
}