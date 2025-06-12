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
    description: 'Fecha y hora de inicio de la sesión en formato ISO 8601',
    example: '2024-01-20T09:00:00Z'
  })
  @Transform(({ value }) => {
    if (value && typeof value === 'string') {
      // Validar formato ISO8601
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;
      if (!isoRegex.test(value)) {
        throw new Error('La fecha debe estar en formato ISO8601 (YYYY-MM-DDTHH:mm:ssZ)');
      }
      return new Date(value);
    }
    return value;
  })
  @IsDate()
  @IsNotEmpty()
  startDateTime: Date;

  @ApiProperty({
    description: 'Fecha y hora de fin de la sesión en formato ISO 8601',
    example: '2024-01-20T11:00:00Z'
  })
  @Transform(({ value }) => {
    if (value && typeof value === 'string') {
      // Validar formato ISO8601
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;
      if (!isoRegex.test(value)) {
        throw new Error('La fecha debe estar en formato ISO8601 (YYYY-MM-DDTHH:mm:ssZ)');
      }
      return new Date(value);
    }
    return value;
  })
  @IsDate()
  @IsNotEmpty()
  endDateTime: Date;

  @ApiProperty({
    description: 'URL de la sala virtual para la sesión de clase',
    example: 'https://meet.google.com/abc-defg-hij',
    required: false
  })
  @IsString()
  @IsOptional()
  virtualRoomUrl?: string;
}
