import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateEnrollmentDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'ID de la oferta de curso',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  programCourseId: string;
}
