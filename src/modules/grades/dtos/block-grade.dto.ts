import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EvaluationGradeDto } from './evaluation-grade.dto';

export class StudentGradeDto {
  @ApiProperty({
    description: 'ID de la matrícula del estudiante',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  enrollmentId: string;

  @ApiProperty({
    description: 'Lista de calificaciones para diferentes evaluaciones',
    type: [EvaluationGradeDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvaluationGradeDto)
  gradeRecords: EvaluationGradeDto[];
}

export class BlockGradeDto {
  @ApiProperty({
    description: 'ID del bloque académico',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  blockId: string;

  @ApiProperty({
    description: 'Lista de estudiantes con sus calificaciones',
    type: [StudentGradeDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentGradeDto)
  studentGrades: StudentGradeDto[];
}
