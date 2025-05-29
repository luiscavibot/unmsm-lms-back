import { ApiProperty } from '@nestjs/swagger';

export enum ClassSessionAccessType {
  NO_ACCESS = 'no_access',
  OWNER = 'owner',
  RESPONSIBLE = 'responsible',
}

export class ClassSessionPermissionResult {
  @ApiProperty({
    description: 'Indica si el usuario tiene permiso para acceder a la información',
    example: true,
  })
  hasPermission: boolean;

  @ApiProperty({
    description: 'Tipo de acceso que tiene el usuario',
    enum: ClassSessionAccessType,
    example: ClassSessionAccessType.OWNER,
  })
  accessType: ClassSessionAccessType;

  @ApiProperty({
    description: 'Mensaje descriptivo sobre el permiso',
    example: 'Usuario es colaborador/responsable de este bloque',
  })
  message: string;
}
