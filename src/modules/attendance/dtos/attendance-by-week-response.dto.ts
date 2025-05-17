import { ApiProperty } from '@nestjs/swagger';
import { AttendanceStatus } from '../enums/attendance-status.enum';

export class AttendanceDetailDto {
  @ApiProperty({
    description: 'Fecha de la sesión en formato dd/mm/yyyy',
    example: '17/05/2025'
  })
  date: string;

  @ApiProperty({
    description: 'Fecha de la sesión formateada (Día de la semana y fecha)',
    example: 'Viernes 17/05/2025'
  })
  formattedDate: string;

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
