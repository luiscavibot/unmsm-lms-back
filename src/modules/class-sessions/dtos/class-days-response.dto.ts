import { ApiProperty } from '@nestjs/swagger';

export class ClassDayInfo {
  @ApiProperty({
    description: 'Fecha de la sesión de clase en formato ISO',
    example: '2024-05-20'
  })
  date: string;

  @ApiProperty({
    description: 'Hora de inicio de la sesión de clase',
    example: '09:00'
  })
  startTime: string;

  @ApiProperty({
    description: 'Hora de finalización de la sesión de clase',
    example: '11:00'
  })
  endTime: string;

  @ApiProperty({
    description: 'ID de la sesión de clase',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  sessionId: string;

  @ApiProperty({
    description: 'URL de la sala virtual (si está disponible)',
    example: 'https://meet.google.com/abc-defg-hij',
    required: false
  })
  virtualRoomUrl?: string;
}

export class ClassDaysResponseDto {
  @ApiProperty({
    description: 'Información de los días de clase para un bloque específico',
    type: [ClassDayInfo]
  })
  classDays: ClassDayInfo[];
}
