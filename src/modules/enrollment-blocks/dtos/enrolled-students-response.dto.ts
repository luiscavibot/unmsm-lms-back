import { ApiProperty } from '@nestjs/swagger';
import { AttendanceStatus } from 'src/modules/attendance/enums/attendance-status.enum';

export class EnrolledStudentDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'ID de la matrícula del estudiante',
    example: '456e7890-f12d-34e5-a678-426614174000',
  })
  enrollmentId: string;

  @ApiProperty({
    description: 'Nombre completo del estudiante',
    example: 'Sandoval Peña Gustavo Adolfo',
  })
  userName: string;

  @ApiProperty({
    description: 'Estado de asistencia del estudiante',
    enum: AttendanceStatus,
    example: AttendanceStatus.PRESENT,
    nullable: true,
  })
  attendanceStatus: AttendanceStatus | null;
}

export class EnrolledStudentsResponseDto {
  @ApiProperty({
    description: 'Fecha de la sesión de asistencia (formato YYYY-MM-DD)',
    example: '2025-05-27',
    nullable: true,
  })
  date: string | null;

  @ApiProperty({
    description: 'ID de la sesión de clase de donde se obtiene la asistencia',
    example: '789e0123-f45d-67e8-a901-426614174000',
    nullable: true,
  })
  classSessionId: string | null;

  @ApiProperty({
    description: 'Número total de estudiantes matriculados',
    example: 12,
  })
  studentNumber: number;

  @ApiProperty({
    description: 'Indica si la asistencia puede ser editada actualmente',
    example: true,
  })
  canEditAttendance: boolean;

  @ApiProperty({
    description: 'Mensaje informativo sobre el estado de la edición de asistencia',
    example: 'Puede registrar asistencia hasta las 23:59 de hoy',
    nullable: true,
  })
  attendanceStatusMessage: string | null;

  @ApiProperty({
    description: 'Tipo de mensaje para la interfaz de usuario (error, warning, info, success)',
    example: 'success',
    nullable: true,
    enum: ['error', 'warning', 'info', 'success'],
  })
  messageType: string | null;

  @ApiProperty({
    description: 'Lista de estudiantes matriculados',
    type: [EnrolledStudentDto],
  })
  students: EnrolledStudentDto[];
}
