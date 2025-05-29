import { ApiProperty } from '@nestjs/swagger';
import { Attendance } from '../entities/attendance.entity';

export class BulkAttendanceResponseDto {
  @ApiProperty({
    description: 'Registros de asistencia creados o actualizados',
    type: [Attendance],
  })
  attendances: Attendance[];

  @ApiProperty({
    description: 'Número total de registros procesados',
    example: 25,
  })
  totalProcessed: number;

  @ApiProperty({
    description: 'Información de la sesión de clase',
    example: 'Sesión del 29 de mayo de 2025',
  })
  sessionInfo: string;
}
