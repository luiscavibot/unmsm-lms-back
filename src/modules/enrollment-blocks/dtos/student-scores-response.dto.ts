import { ApiProperty } from '@nestjs/swagger';

export class StudentScoreDto {
  @ApiProperty({ description: 'ID del usuario' })
  userId: string;

  @ApiProperty({ description: 'Nombre del estudiante' })
  nombre: string;

  @ApiProperty({ description: 'Nota del bloque de teoría', nullable: true })
  theoryScore: number | null;

  @ApiProperty({ description: 'Nota del bloque de práctica', nullable: true })
  practiceScore: number | null;

  @ApiProperty({ description: 'Nota final del curso' })
  finalScore: number;
}

export class CourseStatisticsDto {
  @ApiProperty({ description: 'Promedio general del curso' })
  averageCourse: number;

  @ApiProperty({ description: 'Nota más alta del curso' })
  highScore: number;

  @ApiProperty({ description: 'Nota más baja del curso' })
  lowScore: number;

  @ApiProperty({ description: 'Desviación estándar' })
  standardDeviation: number;

  @ApiProperty({ description: 'Número de estudiantes aprobados' })
  passedStudents: number;

  @ApiProperty({ description: 'Número de estudiantes desaprobados' })
  failedStudents: number;
}

export class StudentScoresResponseDto {
  @ApiProperty({ description: 'Lista de estudiantes con sus calificaciones', type: [StudentScoreDto] })
  students: StudentScoreDto[];

  @ApiProperty({ description: 'Estadísticas generales del curso', type: CourseStatisticsDto })
  meta: CourseStatisticsDto;
}
