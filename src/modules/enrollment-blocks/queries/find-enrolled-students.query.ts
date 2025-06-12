import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { EnrollmentBlock } from '../entities/enrollment-block.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { ClassSession } from '../../class-sessions/entities/class-session.entity';
import { UserService } from '../../users/services/user.service';
import { EnrolledStudentDto, EnrolledStudentsResponseDto } from '../dtos/enrolled-students-response.dto';
import { AttendanceStatus } from '../../attendance/enums/attendance-status.enum';

@Injectable()
export class FindEnrolledStudentsQuery {
  constructor(
    @InjectRepository(EnrollmentBlock)
    private readonly enrollmentBlockRepository: Repository<EnrollmentBlock>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(ClassSession)
    private readonly classSessionRepository: Repository<ClassSession>,
    private readonly userService: UserService,
  ) {}

  /**
   * Encuentra todos los estudiantes matriculados en un bloque específico y su asistencia
   * @param blockId ID del bloque
   * @param date Fecha opcional para buscar la asistencia
   */
  async execute(blockId: string, date?: Date): Promise<EnrolledStudentsResponseDto> {
    // 1. Obtener todas las matrículas para este bloque
    const enrollmentBlocks = await this.enrollmentBlockRepository.find({
      where: { blockId },
      relations: ['enrollment'],
    });

    // Preparar la respuesta
    const result: EnrolledStudentsResponseDto = {
      startDateTime: null,
      endDateTime: null,
      classSessionId: null,
      studentNumber: 0,
      canEditAttendance: false,
      attendanceStatusMessage: null,
      messageType: null,
      students: [],
    };

    // Si no hay matrículas, devolver array vacío
    if (!enrollmentBlocks || enrollmentBlocks.length === 0) {
      return result;
    }

    // Extraer los enrollmentIds para usar en consultas posteriores
    const enrollmentIds = enrollmentBlocks.map((eb) => eb.enrollmentId);

    // 2. Obtener información de todos los enrollments de una vez
    const enrollments = await this.enrollmentRepository.find({
      where: { id: In(enrollmentIds) },
    });

    // Crear un mapa de enrollmentId -> userId para acceso rápido
    const enrollmentToUserMap = new Map<string, string>();
    enrollments.forEach((enrollment) => {
      enrollmentToUserMap.set(enrollment.id, enrollment.userId);
    });

    // 3. Encontrar la sesión de clase apropiada para la asistencia
    let classSessions: { id: string; startDateTime: Date; endDateTime: Date }[] = [];

    if (date) {
      try {
        // Con la validación previa, date ya debe ser un objeto Date válido en formato ISO
        // Solo verificamos que sea válido para evitar errores
        if (!(date instanceof Date) || isNaN(date.getTime())) {
          throw new Error('Formato de fecha no válido');
        }
        
        // Formatear la fecha para asegurar consistencia en la comparación
        const formattedDate = date.toISOString().split('T')[0];
        
        // Si se proporciona una fecha, buscar sesiones en esa fecha
        classSessions = await this.classSessionRepository
          .createQueryBuilder('classSession')
          .select(['classSession.id', 'classSession.startDateTime', 'classSession.endDateTime'])
          .where('classSession.blockId = :blockId', { blockId })
          .andWhere('DATE(classSession.startDateTime) = DATE(:date)', { date: formattedDate })
          .orderBy('classSession.startDateTime', 'ASC')
          .getMany();
        
      } catch (error) {
        console.error('Error al procesar la fecha para la consulta:', error);
        // En caso de error, no filtrar por fecha
        classSessions = [];
      }
    } else {
      // Si no se proporciona fecha, buscar la sesión más cercana a la fecha actual
      const now = new Date();
      const nowFormatted = now.toISOString().split('T')[0]; // Gets YYYY-MM-DD

      // Primero, intentar encontrar la sesión más cercana en el futuro
      let futureSessions = await this.classSessionRepository
        .createQueryBuilder('classSession')
        .select(['classSession.id', 'classSession.startDateTime', 'classSession.endDateTime'])
        .where('classSession.blockId = :blockId', { blockId })
        .andWhere('DATE(classSession.startDateTime) >= :now', { now: nowFormatted })
        .orderBy('classSession.startDateTime', 'ASC')
        .limit(1)
        .getMany();

      console.log('futureSessions', futureSessions);

      // Si no hay sesiones futuras, buscar la más reciente en el pasado
      if (!futureSessions || futureSessions.length === 0) {
        classSessions = await this.classSessionRepository
          .createQueryBuilder('classSession')
          .select(['classSession.id', 'classSession.startDateTime', 'classSession.endDateTime'])
          .where('classSession.blockId = :blockId', { blockId })
          .orderBy('classSession.startDateTime', 'DESC')
          .limit(1)
          .getMany();
      } else {
        classSessions = futureSessions;
      }
    }

    // Si no hay sesiones, devolvemos respuesta sin cargar estudiantes
    const classSessionId = classSessions.length > 0 ? classSessions[0].id : null;
    
    // Agregar el ID de la sesión de clase a los metadatos
    result.classSessionId = classSessionId;

    // Si no se encontraron sesiones para la fecha proporcionada explícitamente, retornar sin estudiantes
    if (date && !classSessionId) {
      try {
        // Obtener la fecha en formato ISO para el mensaje
        const dateStr = date instanceof Date 
          ? date.toISOString().split('T')[0]
          : new Date(date).toISOString().split('T')[0];
        
        // Actualizar mensaje para indicar que no hay clases en la fecha solicitada
        // Enviar la fecha sin formatear para que el frontend la formatee según la localización del usuario
        result.attendanceStatusMessage = `No hay sesiones de clase programadas para la fecha ${dateStr}`;
      } catch (e) {
        // Si hay error al formatear la fecha, usar mensaje genérico
        result.attendanceStatusMessage = `No hay sesiones de clase programadas para la fecha solicitada`;
      }
      
      result.messageType = 'info'; // Añadimos tipo de mensaje informativo
      result.studentNumber = enrollmentIds.length; // Solo indicamos cuántos estudiantes hay matriculados
      return result; // Retornamos sin cargar la lista de estudiantes
    }

    // Guardar la fecha de la sesión para incluirla en los metadatos
    if (classSessions.length > 0 && classSessions[0].startDateTime) {
      try {
        // Convertir a objeto Date si no lo es ya
        let dateValue;
        if (typeof classSessions[0].startDateTime === 'string') {
          dateValue = new Date(classSessions[0].startDateTime);
        } else if (classSessions[0].startDateTime instanceof Date) {
          dateValue = classSessions[0].startDateTime;
        } else {
          // Si es un objeto pero no es una fecha, intentar convertirlo
          dateValue = new Date(String(classSessions[0].startDateTime));
        }

        // Verificar que la fecha sea válida
        if (!isNaN(dateValue.getTime())) {
          // Agregar startDateTime y endDateTime en formato ISO
          result.startDateTime = dateValue.toISOString();
          
          // Procesar endDateTime
          if (classSessions[0].endDateTime) {
            let endDateValue;
            if (typeof classSessions[0].endDateTime === 'string') {
              endDateValue = new Date(classSessions[0].endDateTime);
            } else if (classSessions[0].endDateTime instanceof Date) {
              endDateValue = classSessions[0].endDateTime;
            } else {
              endDateValue = new Date(String(classSessions[0].endDateTime));
            }
            
            if (!isNaN(endDateValue.getTime())) {
              result.endDateTime = endDateValue.toISOString();
            }
          }
        } else {
          console.error('Invalid date value after conversion');
        }
      } catch (e) {
        console.error('Error formatting date:', e);
        // En caso de error, intentar un enfoque más simple
        try {
          const startDate = new Date(String(classSessions[0].startDateTime));
          result.startDateTime = startDate.toISOString();
          
          if (classSessions[0].endDateTime) {
            const endDate = new Date(String(classSessions[0].endDateTime));
            result.endDateTime = endDate.toISOString();
          }
        } catch (innerError) {
          console.error('Failed fallback date formatting:', innerError);
        }
      }
    }

    // 4. Obtener la asistencia para la sesión encontrada si existe
    const attendanceMap = new Map<string, AttendanceStatus>();

    if (classSessionId) {
      const attendances = await this.attendanceRepository.find({
        where: {
          classSessionId,
          enrollmentId: In(enrollmentIds),
        },
      });

      attendances.forEach((attendance) => {
        attendanceMap.set(attendance.enrollmentId, attendance.status);
      });
    }

    // 5. Construir la respuesta final con la información de los usuarios
    // Preparar los datos para consulta en paralelo
    const studentDataPromises: Promise<EnrolledStudentDto>[] = [];
    
    // Crear un array de promesas para consultar la información de los usuarios en paralelo
    for (const enrollmentBlock of enrollmentBlocks) {
      const enrollmentId = enrollmentBlock.enrollmentId;
      const userId = enrollmentToUserMap.get(enrollmentId);
      
      if (userId) {
        // Para cada estudiante, crear una promesa que resuelve a un EnrolledStudentDto
        const studentPromise = this.userService.findOne(userId)
          .then(user => {
            // Si se obtiene el usuario correctamente, crear el DTO con su nombre
            return {
              userId,
              enrollmentId,  // Agregar el enrollmentId al DTO
              userName: user.name,
              attendanceStatus: attendanceMap.get(enrollmentId) || null,
            } as EnrolledStudentDto;
          })
          .catch(error => {
            // Si hay un error, registrarlo y devolver un DTO con información mínima
            console.error(`Error al obtener información del usuario ${userId}:`, error);
            return {
              userId,
              enrollmentId,  // Agregar el enrollmentId al DTO
              userName: `Usuario ${userId.substring(0, 8)}...`, // ID parcial para identificación
              attendanceStatus: attendanceMap.get(enrollmentId) || null,
            } as EnrolledStudentDto;
          });
        
        studentDataPromises.push(studentPromise);
      }
    }
    
    // Esperar a que todas las promesas se resuelvan en paralelo
    result.students = await Promise.all(studentDataPromises);
    
    // Actualizar el número de estudiantes en los metadatos
    result.studentNumber = result.students.length;

    return result;
  }
}
