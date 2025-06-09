import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { BlockRolType } from '../enums/block-rol-type.enum';

export class CreateBlockAssignmentDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'ID del bloque',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  blockId: string;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'ID de la oferta de curso',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  courseOfferingId: string;

  @IsNotEmpty()
  @IsEnum(BlockRolType)
  @ApiProperty({
    description: 'Rol del bloque',
    enum: BlockRolType,
    example: BlockRolType.RESPONSIBLE,
  })
  blockRol: BlockRolType;
}
