import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateProgramCourseDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'ID del programa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  programId: string;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'ID del curso',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  courseId: string;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({
    description: 'Fecha de inicio',
    example: '2021-06-15T00:00:00.000Z',
  })
  startDate: Date;

  @ApiProperty({
    description: 'Fecha de finalización',
    example: '2021-12-15T00:00:00.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: Date;
}
