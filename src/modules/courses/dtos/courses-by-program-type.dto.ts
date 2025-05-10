import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CourseOfferingStatus } from '../../course-offerings/enums/course-offering-status.enum';
import { ProgramType } from '../../programs/enums/program-type.enum';

export class CoursesByProgramTypeDto {
  @IsOptional()
  @IsEnum(CourseOfferingStatus)
  @ApiProperty({
    description: 'Estado de las ofertas de curso',
    enum: CourseOfferingStatus,
    example: CourseOfferingStatus.CURRENT,
    required: false
  })
  status?: CourseOfferingStatus;

  @IsOptional()
  @IsEnum(ProgramType)
  @ApiProperty({
    description: 'Tipo de programa',
    enum: ProgramType,
    example: ProgramType.PosgradoDiplomado,
    required: false
  })
  programType?: ProgramType;

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    description: 'ID del semestre',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  semester?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({
    description: 'Página actual para paginación',
    example: 1,
    default: 1,
    required: false
  })
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({
    description: 'Cantidad de elementos por página',
    example: 20,
    default: 20,
    required: false
  })
  limit?: number = 20;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Palabra clave para búsqueda',
    example: 'Bioinformática',
    required: false
  })
  keyword?: string;
}
