import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({
    description: 'The name of the course',
    example: 'Matemática I',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The description of the course',
    example: 'Curso básico de matemáticas universitarias',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
