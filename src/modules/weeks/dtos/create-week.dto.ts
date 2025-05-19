import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWeekDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'ID del bloque al que pertenece la semana',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  blockId: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(99)
  @Type(() => Number)
  @ApiProperty({
    description: 'Número de la semana (1-99)',
    example: 1,
    type: Number,
  })
  number: number;
}
