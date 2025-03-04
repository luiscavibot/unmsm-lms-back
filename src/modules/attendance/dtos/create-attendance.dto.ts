import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { AttendanceStatus } from '../enums/attendance-status.enum';

export class CreateAttendanceDto {
  @ApiProperty({
    description: 'ID of the enrollment',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  enrollmentId: string;

  @ApiProperty({
    description: 'ID of the class session',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  classSessionId: string;

  @ApiProperty({
    description: 'Status of attendance',
    enum: AttendanceStatus,
    example: AttendanceStatus.PRESENT
  })
  @IsEnum(AttendanceStatus)
  @IsNotEmpty()
  status: AttendanceStatus;
}
