import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateWeekDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'ID del bloque al que pertenece la semana',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  blockId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Nombre de la semana',
    example: 'Semana 1',
  })
  name: string;
}
