import { IsDateString, IsNotEmpty, IsNumber, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEvaluationDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'ID del bloque al que pertenece la evaluación',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true
  })
  blockId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Título o nombre de la evaluación',
    example: 'Examen Parcial',
    required: true
  })
  title: string;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({
    description: 'Fecha de la evaluación en formato ISO (YYYY-MM-DD)',
    example: '2025-06-15',
    required: true
  })
  evaluationDate: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @Type(() => Number)
  @ApiProperty({
    description: 'Peso porcentual de la evaluación (0-100)',
    example: 25.5,
    minimum: 0,
    maximum: 100,
    required: true
  })
  weight: number;
}