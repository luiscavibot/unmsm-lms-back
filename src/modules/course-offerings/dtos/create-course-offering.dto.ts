import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { CourseOfferingStatus } from '../enums/course-offering-status.enum';

export class CreateCourseOfferingDto {
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

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty({
    description: 'Fecha de finalización',
    example: '2021-12-15T00:00:00.000Z',
  })
  endDate: Date;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Módulo al que pertenece',
    example: 'Módulo 1',
    required: false
  })
  module?: string;

  @IsOptional()
  @IsEnum(CourseOfferingStatus)
  @ApiProperty({
    description: 'Estado de la oferta de curso',
    enum: CourseOfferingStatus,
    example: CourseOfferingStatus.UNSTARTED,
    default: CourseOfferingStatus.UNSTARTED,
    required: false
  })
  status?: CourseOfferingStatus;
}