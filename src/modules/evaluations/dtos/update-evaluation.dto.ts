import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateEvaluationDto {
  @IsOptional()
  @IsUUID()
  blockId?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  evaluationDate?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @Type(() => Number)
  weight?: number;
}