import { ApiProperty } from '@nestjs/swagger';
import { AttendanceStatus } from '../enums/attendance-status.enum';

export class AttendanceDetailDto {
  @ApiProperty({
    description: 'Fecha de inicio de la sesión en formato ISO 8601 UTC',
    example: '2025-05-17T14:00:00Z'
  })
  startDateTime: string;

  @ApiProperty({
    description: 'Fecha de fin de la sesión en formato ISO 8601 UTC',
    example: '2025-05-17T16:00:00Z'
  })
  endDateTime: string;

  @ApiProperty({
    description: 'Estado de asistencia del estudiante',
    enum: AttendanceStatus,
    example: AttendanceStatus.PRESENT
  })
  status: AttendanceStatus;
}

export class WeekAttendanceDto {
  @ApiProperty({
    description: 'ID de la semana',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  weekId: string;

  @ApiProperty({
    description: 'Nombre de la semana',
    example: 'Semana 1'
  })
  weekName: string;

  @ApiProperty({
    description: 'Número de la semana',
    example: 1
  })
  weekNumber: number;

  @ApiProperty({
    description: 'Lista de asistencias para esta semana',
    type: [AttendanceDetailDto]
  })
  attendances: AttendanceDetailDto[];
}

export class AttendanceByWeekResponseDto {
  @ApiProperty({
    description: 'Porcentaje de asistencia general',
    example: '75%'
  })
  attendancePercentage: string;

  @ApiProperty({
    description: 'Lista de asistencias agrupadas por semana',
    type: [WeekAttendanceDto]
  })
  weeks: WeekAttendanceDto[];
}
