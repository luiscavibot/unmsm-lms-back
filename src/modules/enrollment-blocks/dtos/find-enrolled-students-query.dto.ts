import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsOptional } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class FindEnrolledStudentsQueryDto {
  @ApiPropertyOptional({
    description: 'Fecha para buscar la asistencia (formato YYYY-MM-DD)',
    example: '2025-05-15',
  })
  @Transform(({ value }) => {
    if (!value) return undefined;
    const cleanValue = typeof value === 'string' ? value.replace(/['"]/g, '') : value;
    try {
      return new Date(cleanValue);
    } catch (error) {
      return undefined;
    }
  })
  @IsOptional()
  @IsDate()
  date?: Date;
}
