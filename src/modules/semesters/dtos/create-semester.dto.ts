import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Matches, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSemesterDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[IVX]+$/, { message: 'El nombre debe ser un número romano válido (I, II, III, IV, etc.)' })
  @ApiProperty({
    description: 'Número romano del semestre',
    example: 'I',
  })
  name: string;

  @IsNotEmpty()
  @IsInt()
  @Min(2000)
  @Max(2100)
  @Type(() => Number)
  @ApiProperty({
    description: 'Año al que pertenece el semestre',
    example: 2025,
    type: Number,
  })
  year: number;
}