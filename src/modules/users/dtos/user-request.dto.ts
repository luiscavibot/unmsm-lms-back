import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class FindUserQueryDto {
  @ApiPropertyOptional({
    description: 'Incluir información de roles',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  withRole?: boolean;
}

export class FindUsersQueryDto {
  @ApiPropertyOptional({
    description: 'Límite de resultados por página (máx. 100)',
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Token de paginación para la siguiente página',
    example: 'eyJ2IjoiMSIsInRva2VuIjoiaW50ZXJuYWwifQ==',
  })
  @IsOptional()
  @IsString()
  nextToken?: string;

  @ApiPropertyOptional({
    description: 'Incluir información de roles en la respuesta',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  withRole?: boolean;
}
