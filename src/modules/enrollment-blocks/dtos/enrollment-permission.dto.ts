import { ApiProperty } from '@nestjs/swagger';

export enum EnrollmentAccessType {
  NO_ACCESS = 'no_access',
  OWNER = 'owner',
  RESPONSIBLE = 'responsible',
}

export class EnrollmentPermissionResult {
  @ApiProperty({
    description: 'Indica si el usuario tiene permiso para acceder a la información',
    example: true,
  })
  hasPermission: boolean;

  @ApiProperty({
    description: 'Tipo de acceso que tiene el usuario',
    enum: EnrollmentAccessType,
    example: EnrollmentAccessType.OWNER,
  })
  accessType: EnrollmentAccessType;

  @ApiProperty({
    description: 'Mensaje descriptivo sobre el permiso',
    example: 'Usuario es colaborador/responsable de este bloque',
  })
  message: string;
}
