import { ApiProperty } from '@nestjs/swagger';
import { Grade } from '../entities/grade.entity';

export class BulkGradeResponseDto {
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
    description: 'Información de la evaluación',
    example: 'Examen Parcial - 29/05/2025',
  })
  evaluationInfo: string;
}
