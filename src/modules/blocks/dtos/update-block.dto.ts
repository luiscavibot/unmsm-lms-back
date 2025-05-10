import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { BlockType } from '../enums/block-type.enum';

export class UpdateBlockDto {
  @IsOptional()
  @IsUUID()
  courseOfferingId?: string;

  @IsOptional()
  @IsEnum(BlockType)
  type?: BlockType;

  @IsOptional()
  @IsString()
  group?: string;
}