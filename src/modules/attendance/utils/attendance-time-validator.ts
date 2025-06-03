import { ClassSession } from '../../class-sessions/entities/class-session.entity';
import { BadRequestException } from '@nestjs/common';

export interface AttendanceTimeWindow {
  registrationStartTime: Date;
  registrationEndTime: Date;
  classStartTime: string;
  classEndTime: string;
  isWithinValidPeriod: boolean;
  statusMessage: string;
}

export class AttendanceTimeValidator {
  /**
   * Valida si el registro de asistencia está dentro del horario permitido
   * @param classSession Sesión de clase
   * @throws BadRequestException si el registro está fuera del horario permitido
   */
  static validate(classSession: ClassSession): void {
    const now = new Date();
    const timeWindow = this.getTimeWindow(classSession);
    
    // Verificar si la hora actual está dentro del rango permitido
    if (now < timeWindow.registrationStartTime) {
      const formattedTime = timeWindow.registrationStartTime.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
      throw new BadRequestException(
        `Aún no puede registrar asistencia. El registro estará disponible a partir de las ${formattedTime}`
      );
    }
    
    if (now > timeWindow.registrationEndTime) {
      throw new BadRequestException(
        'El período para registrar asistencia ha finalizado. Solo puede registrar asistencia hasta el final del día de la clase'
      );
    }
    
    // Verificar que la fecha actual corresponda al día de la clase
    const sessionDate = new Date(classSession.sessionDate);
    if (now.getFullYear() !== sessionDate.getFullYear() || 
        now.getMonth() !== sessionDate.getMonth() || 
        now.getDate() !== sessionDate.getDate()) {
      throw new BadRequestException(
        'Solo puede registrar asistencia durante el día de la clase'
      );
    }
  }
  
  /**
   * Verifica si una sesión de clase puede ser editada en base al horario
   * No lanza excepción, solo retorna un booleano
   * @param classSession Sesión de clase
   * @returns true si la sesión puede ser editada, false en caso contrario
   */
  static canEditAttendance(classSession: ClassSession): boolean {
    try {
      this.validate(classSession);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Obtiene la ventana de tiempo permitida para el registro de asistencia
   * @param classSession Sesión de clase
   * @returns Objeto con información sobre la ventana de tiempo
   */
  static getTimeWindow(classSession: ClassSession): AttendanceTimeWindow {
    const now = new Date();
    const sessionDate = new Date(classSession.sessionDate);
    
    // Extraer horas y minutos del startTime y endTime (formato "HH:MM:SS")
    const [startHours, startMinutes] = classSession.startTime.split(':').map(Number);
    const [endHours, endMinutes] = classSession.endTime.split(':').map(Number);
    
    // Crear objeto de fecha para el inicio y fin de la sesión
    const sessionStart = new Date(sessionDate);
    sessionStart.setHours(startHours, startMinutes, 0, 0);
    
    const sessionEnd = new Date(sessionDate);
    sessionEnd.setHours(endHours, endMinutes, 0, 0);
    
    // 10 minutos antes del inicio de la sesión
    const registrationStart = new Date(sessionStart);
    registrationStart.setMinutes(registrationStart.getMinutes() - 10);
    
    // Fin del día (23:59:59)
    const registrationEnd = new Date(sessionDate);
    registrationEnd.setHours(23, 59, 59, 999);
    
    // Determinar si está dentro del periodo válido
    const isWithinValidPeriod = now >= registrationStart && 
                               now <= registrationEnd && 
                               now.getDate() === sessionDate.getDate() &&
                               now.getMonth() === sessionDate.getMonth() &&
                               now.getFullYear() === sessionDate.getFullYear();
    
    // Crear mensaje de estado
    let statusMessage: string;
    if (now < registrationStart) {
      const formattedTime = registrationStart.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
      statusMessage = `El registro de asistencia se habilitará a las ${formattedTime} hrs el día de la clase seleccionada.`;
    } else if (now <= sessionStart) {
      statusMessage = 'Puede registrar asistencia ahora (antes del inicio de la clase)';
    } else if (now <= sessionEnd) {
      statusMessage = 'Puede registrar asistencia ahora (durante la clase)';
    } else if (now <= registrationEnd) {
      statusMessage = 'Puede registrar asistencia hasta las 23:59 de hoy';
    } else {
      statusMessage = 'El período para registrar asistencia ha finalizado';
    }
    
    return {
      registrationStartTime: registrationStart,
      registrationEndTime: registrationEnd,
      classStartTime: `${startHours.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}`,
      classEndTime: `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`,
      isWithinValidPeriod,
      statusMessage
    };
  }
}
