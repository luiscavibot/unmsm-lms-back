import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFacultyDto {
  @ApiProperty({
    description: 'The name of the faculty',
    example: 'Facultad de Ciencias Biológicas',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
