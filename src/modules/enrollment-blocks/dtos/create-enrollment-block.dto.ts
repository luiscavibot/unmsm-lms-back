import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateEnrollmentBlockDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'ID de la inscripción',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  enrollmentId: string;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'ID del bloque',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  blockId: string;
}