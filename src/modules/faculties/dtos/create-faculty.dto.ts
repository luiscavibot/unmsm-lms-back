import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFacultyDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The name of the faculty',
    example: 'Facultad de Ciencias Biológicas',
  })
  name: string;
}
