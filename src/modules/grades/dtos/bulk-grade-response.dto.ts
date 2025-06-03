import { ApiProperty } from '@nestjs/swagger';
import { Grade } from '../entities/grade.entity';

export class BulkGradeResponseDto {
  @ApiProperty({
    description: 'Calificaciones procesadas exitosamente',
    type: [Grade]
  })
  processed: Grade[];

  @ApiProperty({
    description: 'Total de calificaciones procesadas',
    example: 25
  })
  totalProcessed: number;

  @ApiProperty({
    description: 'Información del bloque académico',
    example: 'Bloque: THEORY - Grupo A'
  })
  blockInfo: string;

  @ApiProperty({
    description: 'Calificaciones con errores (si las hay)',
    type: [Object],
    required: false
  })
  errors?: any[];
}
