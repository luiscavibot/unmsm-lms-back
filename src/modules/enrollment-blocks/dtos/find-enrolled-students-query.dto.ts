import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsOptional, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class FindEnrolledStudentsQueryDto {
  @ApiPropertyOptional({
    description: 'Fecha para buscar la asistencia (formato estricto ISO 8601)',
    example: '2025-05-15T00:00:00Z',
  })
  @Transform(({ value }) => {
    if (!value) return undefined;
    const cleanValue = typeof value === 'string' ? value.replace(/['"]/g, '') : value;
    
    // Regex para validar formato ISO8601
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;
    if (!isoRegex.test(cleanValue)) {
      throw new Error('La fecha debe estar en formato ISO8601 (YYYY-MM-DDTHH:mm:ssZ)');
    }
    
    return new Date(cleanValue);
  })
  @IsOptional()
  @IsDate()
  date?: Date;
}
