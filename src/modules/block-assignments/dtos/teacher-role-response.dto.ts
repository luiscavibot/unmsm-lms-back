import { ApiProperty } from '@nestjs/swagger';
import { BlockRolType } from '../enums/block-rol-type.enum';

export class TeacherRoleResponseDto {
  @ApiProperty({
    description: 'Indica si el profesor está asignado al curso',
    example: true,
  })
  isAssigned: boolean;

  @ApiProperty({
    description: 'El rol del profesor en el curso (responsable o colaborador)',
    enum: BlockRolType,
    example: BlockRolType.RESPONSIBLE,
    nullable: true,
  })
  blockRol: BlockRolType | null;

  @ApiProperty({
    description: 'Mensaje descriptivo sobre la asignación',
    example: 'Profesor es responsable de este curso',
  })
  message: string;
}
