import { ApiProperty } from '@nestjs/swagger';

export class EvaluationGradeDto {
  @ApiProperty({ description: 'Nombre de la evaluación', example: 'Examen Parcial' })
  name: string;

  @ApiProperty({ description: 'Peso de la evaluación en porcentaje', example: 25 })
  weight: number;

  @ApiProperty({ description: 'Fecha de la evaluación', example: '22/05/2025' })
  evaluationDate: string;

  @ApiProperty({ description: 'Nota obtenida', example: 16.5 })
  grade: number;
}

export class StudentGradesResponseDto {
  @ApiProperty({ description: 'Promedio ponderado de las notas', example: 15.75 })
  averageGrade: number;

  @ApiProperty({ type: [EvaluationGradeDto], description: 'Lista de evaluaciones con sus notas' })
  evaluations: EvaluationGradeDto[];
}
