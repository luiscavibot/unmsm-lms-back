import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateEnrollmentBlockDto {
  @IsOptional()
  @IsNumber()
  @ApiProperty({
    description: 'Promedio del bloque',
    example: 18.5,
    required: false,
  })
  blockAverage?: number;
}