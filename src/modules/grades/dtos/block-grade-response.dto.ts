import { ApiProperty } from '@nestjs/swagger';
import { Grade } from '../entities/grade.entity';

export class StudentAverageDto {
  @ApiProperty({
    description: 'ID de la matrícula del estudiante',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  enrollmentId: string;

  @ApiProperty({
    description: 'Promedio del bloque para el estudiante',
    example: 16.5
  })
  blockAverage: number;

  @ApiProperty({
    description: 'Promedio del curso completo para el estudiante',
    example: 15.8
  })
  courseAverage: number;
}

export class BlockGradeResponseDto {
  @ApiProperty({
    description: 'Registros de calificaciones creados o actualizados',
    type: [Grade],
  })
  grades: Grade[];

  @ApiProperty({
    description: 'Número total de registros procesados',
    example: 25,
  })
  totalProcessed: number;

  @ApiProperty({
    description: 'Información del bloque',
    example: 'Bloque Teórico - Grupo A',
  })
  blockInfo: string;

  @ApiProperty({
    description: 'Promedios calculados por estudiante',
    type: [StudentAverageDto],
  })
  studentAverages: StudentAverageDto[];
}
