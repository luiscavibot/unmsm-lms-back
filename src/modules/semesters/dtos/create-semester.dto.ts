import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSemesterDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Nombre del semestre',
    example: '2023-1',
  })
  name: string;
}