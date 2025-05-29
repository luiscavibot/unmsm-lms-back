import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class FindEnrolledStudentsQueryDto {
  @ApiPropertyOptional({
    description: 'Fecha para buscar la asistencia (formato YYYY-MM-DD)',
    example: '2025-05-15',
  })
  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  date?: Date;
}
