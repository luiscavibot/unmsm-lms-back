import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class EvaluationGradeDto {
  @ApiProperty({
    description: 'ID de la evaluación',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  evaluationId: string;

  @ApiProperty({
    description: 'Puntuación de la calificación',
    example: 16.5,
    minimum: 0,
    maximum: 20
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(20)
  @Type(() => Number)
  score: number;
}
