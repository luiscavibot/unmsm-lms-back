import { ApiProperty } from '@nestjs/swagger';

export class StudentEvaluationDto {
  @ApiProperty({
    description: 'ID de la evaluación',
    example: 'zxcv-zxcv-zxcv',
  })
  evaluationId: string;

  @ApiProperty({
    description: 'Nota obtenida en la evaluación',
    example: 20,
  })
  score: number;
}

export class EnrolledStudentGradeDto {
  @ApiProperty({
    description: 'Nombre completo del estudiante',
    example: 'Luis Castillo',
  })
  userName: string;

  @ApiProperty({
    description: 'ID de la matrícula del estudiante',
    example: 'asdf-asdf',
  })
  enrollmentId: string;

  @ApiProperty({
    description: 'Promedio de notas del estudiante',
    example: 15,
  })
  averageScore: number;

  @ApiProperty({
    description: 'Evaluaciones del estudiante',
    type: [StudentEvaluationDto],
  })
  evaluations: StudentEvaluationDto[];
}

export class EnrolledStudentsGradesResponseDto {
  @ApiProperty({
    description: 'Número total de estudiantes matriculados',
    example: 12,
  })
  studentNumber: number;

  @ApiProperty({
    description: 'Lista de estudiantes matriculados con sus notas',
    type: [EnrolledStudentGradeDto],
  })
  students: EnrolledStudentGradeDto[];
}
