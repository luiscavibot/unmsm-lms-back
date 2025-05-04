import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { BlockType } from '../enums/block-type.enum';

export class CreateBlockDto {
  @IsNotEmpty()
  @IsUUID()
  courseOfferingId: string;

  @IsOptional()
  @IsUUID()
  blockAssignmentId?: string;

  @IsNotEmpty()
  @IsEnum(BlockType)
  type: BlockType;

  @IsOptional()
  @IsString()
  group?: string;
}