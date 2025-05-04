import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { BlockRolType } from '../enums/block-rol-type.enum';

export class CreateBlockAssignmentDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @IsNotEmpty()
  @IsEnum(BlockRolType)
  @ApiProperty({
    description: 'Rol del bloque',
    enum: BlockRolType,
    example: BlockRolType.RESPONSIBLE,
  })
  blockRol: BlockRolType;
}