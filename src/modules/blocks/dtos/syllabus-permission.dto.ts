export enum SyllabusAccessType {
  OWNER = 'owner',             // Es dueño del bloque (colaborador asignado a este bloque)
  RESPONSIBLE = 'responsible', // Es responsable del curso al que pertenece el bloque
  NO_ACCESS = 'no_access',     // No tiene acceso
}

export interface SyllabusPermissionResult {
  hasPermission: boolean;
  accessType: SyllabusAccessType;
  message: string;
}
