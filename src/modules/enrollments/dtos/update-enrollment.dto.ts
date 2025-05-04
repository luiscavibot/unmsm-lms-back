import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { CreateEnrollmentDto } from './create-enrollment.dto';

export class UpdateEnrollmentDto extends PartialType(CreateEnrollmentDto) {
  @IsOptional()
  @IsNumber()
  @ApiProperty({
    description: 'Promedio final del curso',
    example: 18.5,
    required: false,
  })
  finalAverage?: number;
}
