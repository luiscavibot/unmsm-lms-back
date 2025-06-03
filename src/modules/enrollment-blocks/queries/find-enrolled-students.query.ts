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
      date: null,
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
    let classSessions: { id: string; sessionDate: Date }[] = [];

    if (date) {
      try {
        // Asegurarse de que date sea un objeto Date válido
        const validDate = date instanceof Date && !isNaN(date.getTime()) 
          ? date 
          : new Date(date);
        
        // Formatear la fecha para asegurar consistencia en la comparación
        const formattedDate = validDate.toISOString().split('T')[0];
        
        // Si se proporciona una fecha, buscar sesiones en esa fecha
        classSessions = await this.classSessionRepository
          .createQueryBuilder('classSession')
          .select(['classSession.id', 'classSession.sessionDate'])
          .where('classSession.blockId = :blockId', { blockId })
          .andWhere('DATE(classSession.sessionDate) = DATE(:date)', { date: formattedDate })
          .orderBy('classSession.sessionDate', 'ASC')
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

      console.log('now', now);

      // Primero, intentar encontrar la sesión más cercana en el futuro
      let futureSessions = await this.classSessionRepository
        .createQueryBuilder('classSession')
        .select(['classSession.id', 'classSession.sessionDate'])
        .where('classSession.blockId = :blockId', { blockId })
        .andWhere('DATE(classSession.sessionDate) >= :now', { now: nowFormatted })
        .orderBy('classSession.sessionDate', 'ASC')
        .limit(1)
        .getMany();

      console.log('futureSessions', futureSessions);

      // Si no hay sesiones futuras, buscar la más reciente en el pasado
      if (!futureSessions || futureSessions.length === 0) {
        classSessions = await this.classSessionRepository
          .createQueryBuilder('classSession')
          .select(['classSession.id', 'classSession.sessionDate'])
          .where('classSession.blockId = :blockId', { blockId })
          .orderBy('classSession.sessionDate', 'DESC')
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
        // Formatear la fecha para el mensaje
        const formattedDate = date instanceof Date 
          ? date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
          : new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
        
        // Actualizar mensaje para indicar que no hay clases en la fecha solicitada
        result.attendanceStatusMessage = `No hay sesiones de clase programadas para el ${formattedDate}`;
      } catch (e) {
        // Si hay error al formatear la fecha, usar mensaje genérico
        result.attendanceStatusMessage = `No hay sesiones de clase programadas para la fecha solicitada`;
      }
      
      result.messageType = 'info'; // Añadimos tipo de mensaje informativo
      result.studentNumber = enrollmentIds.length; // Solo indicamos cuántos estudiantes hay matriculados
      return result; // Retornamos sin cargar la lista de estudiantes
    }

    // Guardar la fecha de la sesión para incluirla en los metadatos
    if (classSessions.length > 0 && classSessions[0].sessionDate) {
      try {
        // Convertir a objeto Date si no lo es ya
        let dateValue;
        if (typeof classSessions[0].sessionDate === 'string') {
          dateValue = new Date(classSessions[0].sessionDate);
        } else if (classSessions[0].sessionDate instanceof Date) {
          dateValue = classSessions[0].sessionDate;
        } else {
          // Si es un objeto pero no es una fecha, intentar convertirlo
          dateValue = new Date(String(classSessions[0].sessionDate));
        }

        // Verificar que la fecha sea válida
        if (!isNaN(dateValue.getTime())) {
          // Formatear como YYYY-MM-DD
          const year = dateValue.getFullYear();
          const month = String(dateValue.getMonth() + 1).padStart(2, '0');
          const day = String(dateValue.getDate()).padStart(2, '0');
          result.date = `${year}-${month}-${day}`;
        } else {
          console.error('Invalid date value after conversion');
        }
      } catch (e) {
        console.error('Error formatting date:', e);
        // En caso de error, intentar un enfoque más simple
        try {
          const simpleDate = new Date(String(classSessions[0].sessionDate));
          result.date = simpleDate.toISOString().split('T')[0];
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
