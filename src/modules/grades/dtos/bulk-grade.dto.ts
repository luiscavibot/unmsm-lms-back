import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsUUID, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class GradeRecordDto {
  @ApiProperty({
    description: 'ID de la matrícula del estudiante',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  enrollmentId: string;

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

export class BulkGradeDto {
  @ApiProperty({
    description: 'ID de la evaluación para la cual se registran las notas',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  evaluationId: string;

  @ApiProperty({
    description: 'Lista de registros de notas',
    type: [GradeRecordDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GradeRecordDto)
  gradeRecords: GradeRecordDto[];
}
