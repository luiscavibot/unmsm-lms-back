import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ResumeUploadDto {
  @ApiProperty({
    description: 'ID del bloque al que está asociado el profesor',
    required: true,
    example: 'block-123',
  })
  @IsString()
  @IsNotEmpty()
  blockId: string;
}
