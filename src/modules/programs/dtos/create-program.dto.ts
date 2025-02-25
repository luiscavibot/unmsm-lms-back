import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ProgramType } from '../enums/program-type.enum';

export class CreateProgramDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Nombre del programa',
    example: 'Diplomado en Bioinformática Aplicada a Salud Pública',
  })
  name: string;

  @IsEnum(ProgramType)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Tipo de programa',
    enum: ProgramType,
    example: ProgramType.POSGRADO_DIPLOMADO,
  })
  type: ProgramType;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    description: 'ID de la facultad',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  facultyId: string;
}