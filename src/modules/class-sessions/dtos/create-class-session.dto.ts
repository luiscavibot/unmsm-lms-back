import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateClassSessionDto {
  @ApiProperty({
    description: 'ID of the course offering',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  programCourseId: string;

  @ApiProperty({
    description: 'Date of the class session',
    example: '2024-01-20'
  })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsNotEmpty()
  sessionDate: Date;

  @ApiProperty({
    description: 'Start time of the class session',
    example: '09:00'
  })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    description: 'End time of the class session',
    example: '11:00'
  })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({
    description: 'Virtual room URL for the class session',
    example: 'https://meet.google.com/abc-defg-hij'
  })
  @IsString()
  @IsNotEmpty()
  virtualRoomUrl: string;
}
