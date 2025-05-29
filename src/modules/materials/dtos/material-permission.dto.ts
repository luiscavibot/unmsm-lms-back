export enum MaterialAccessType {
  OWNER = 'owner',         // Propietario del material (profesor asignado al bloque)
  RESPONSIBLE = 'responsible', // Responsable del curso
  NO_ACCESS = 'no_access',     // Sin acceso
}

export interface MaterialPermissionResult {
  hasPermission: boolean;
  accessType: MaterialAccessType;
  message: string;
}
