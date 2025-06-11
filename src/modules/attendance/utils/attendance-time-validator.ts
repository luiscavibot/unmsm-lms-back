import { ClassSession } from '../../class-sessions/entities/class-session.entity';
import { BadRequestException } from '@nestjs/common';

export interface AttendanceTimeWindow {
  registrationStartTime: Date;
  registrationEndTime: Date;
  classStartDateTime: Date;
  classEndDateTime: Date;
  isWithinValidPeriod: boolean;
  statusMessage: string;
  messageType: 'error' | 'warning' | 'info' | 'success';
}

export class AttendanceTimeValidator {
  /**
   * Valida si el registro de asistencia está dentro del horario permitido
   * @param classSession Sesión de clase
   * @param timezone Zona horaria del usuario (ej. 'America/Lima')
   * @throws BadRequestException si el registro está fuera del horario permitido
   */
  static validate(classSession: ClassSession, timezone: string = 'UTC'): void {
    const now = new Date();
    const timeWindow = this.getTimeWindow(classSession, timezone);

    // Verificar si la hora actual está dentro del rango permitido
    if (now < timeWindow.registrationStartTime) {
      const formattedTime = timeWindow.registrationStartTime.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timezone
      });
      throw new BadRequestException(
        `Aún no puede registrar asistencia. El registro estará disponible a partir de las ${formattedTime}`,
      );
    }

    if (now > timeWindow.registrationEndTime) {
      throw new BadRequestException(
        'El período para registrar asistencia ha finalizado. Solo puede registrar asistencia hasta el final del día de la clase',
      );
    }

    // Verificar que la fecha actual corresponda al día de la clase
    const sessionDate = timeWindow.classStartDateTime;
    //********************************************* */
    // if (
    //   now.getFullYear() !== sessionDate.getFullYear() ||
    //   now.getMonth() !== sessionDate.getMonth() ||
    //   now.getDate() !== sessionDate.getDate()
    // ) {
    //   throw new BadRequestException('Solo puede registrar asistencia durante el día de la clase');
    // }
    /********************************************* */
  }

  /**
   * Verifica si una sesión de clase puede ser editada en base al horario
   * No lanza excepción, solo retorna un booleano
   * @param classSession Sesión de clase
   * @param timezone Zona horaria del usuario (ej. 'America/Lima')
   * @returns true si la sesión puede ser editada, false en caso contrario
   */
  static canEditAttendance(classSession: ClassSession, timezone: string = 'UTC'): boolean {
    try {
      this.validate(classSession, timezone);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene la ventana de tiempo permitida para el registro de asistencia
   * @param classSession Sesión de clase
   * @param timezone Zona horaria del usuario (ej. 'America/Lima')
   * @returns Objeto con información sobre la ventana de tiempo
   */
  static getTimeWindow(classSession: ClassSession, timezone: string = 'UTC'): AttendanceTimeWindow {
    const now = new Date();
    
    // Convertimos fechas UTC a la zona horaria del usuario
    const sessionStart = new Date(classSession.startDateTime);
    const sessionEnd = new Date(classSession.endDateTime);

    // 10 minutos antes del inicio de la sesión, en la zona horaria del usuario
    const registrationStart = new Date(sessionStart);
    registrationStart.setMinutes(registrationStart.getMinutes() - 30);

    // Fin del día de la sesión (23:59:59) en la zona horaria del usuario
    const sessionDay = new Date(sessionStart);
    const registrationEnd = new Date(sessionDay);
    registrationEnd.setHours(23, 59, 59, 999);

    // Determinar si está dentro del periodo válido
    const isWithinValidPeriod = now >= registrationStart && now <= registrationEnd;

    // Crear mensaje de estado y tipo de mensaje
    let statusMessage: string;
    let messageType: 'error' | 'warning' | 'info' | 'success';

    console.log('timezone', timezone);

    if (now < registrationStart) {
      // Obtener únicamente la hora y minutos de registrationStart sin convertirlo
      const formattedTime = registrationStart.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timezone
      });      
      statusMessage = `El registro de asistencia se habilitará a las ${formattedTime} hrs el día de la clase seleccionada.`;
      messageType = 'info';
    } else if (now <= sessionStart) {
      statusMessage = 'Registro habilitado: Puede proceder con el ingreso de la asistencia de sus alumnos.';
      messageType = 'success';
    } else if (now <= sessionEnd) {
      statusMessage = 'Registro habilitado: Puede proceder con el ingreso de la asistencia de sus alumnos.';
      messageType = 'success';
    } else if (now <= registrationEnd) {
      statusMessage = 'Puede registrar asistencia hasta las 23:59 de hoy';
      messageType = 'warning';
    } else {
      statusMessage = 'El período para registrar asistencia ha finalizado';
      messageType = 'error';
    }

    return {
      registrationStartTime: registrationStart,
      registrationEndTime: registrationEnd,
      classStartDateTime: sessionStart,
      classEndDateTime: sessionEnd,
      isWithinValidPeriod,
      statusMessage,
      messageType,
    };
  }
}
