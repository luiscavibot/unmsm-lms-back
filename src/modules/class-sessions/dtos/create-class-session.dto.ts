import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateClassSessionDto {
  @ApiProperty({
    description: 'ID del bloque al que pertenece la sesión de clase',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  blockId: string;

  @ApiProperty({
    description: 'ID de la semana a la que pertenece la sesión de clase',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  weekId: string;

  @ApiProperty({
    description: 'Fecha de la sesión de clase',
    example: '2024-01-20'
  })
  @Transform(({ value }) => {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
  })
  @IsDate()
  @IsNotEmpty()
  sessionDate: Date;

  @ApiProperty({
    description: 'Hora de inicio de la sesión de clase',
    example: '09:00'
  })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    description: 'Hora de finalización de la sesión de clase',
    example: '11:00'
  })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({
    description: 'URL de la sala virtual para la sesión de clase',
    example: 'https://meet.google.com/abc-defg-hij',
    required: false
  })
  @IsString()
  @IsOptional()
  virtualRoomUrl?: string;
}
