import { Inject, Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Attendance } from '../entities/attendance.entity';
import { IAttendanceRepository } from '../interfaces/attendance.repository.interface';
import { CreateAttendanceDto } from '../dtos/create-attendance.dto';
import { UpdateAttendanceDto } from '../dtos/update-attendance.dto';
import { ATTENDANCE_REPOSITORY } from '../tokens';
import { EnrollmentService } from '../../enrollments/services/enrollment.service';
import { ClassSessionService } from '../../class-sessions/services/class-session.service';
import { AttendanceByWeekResponseDto } from '../dtos/attendance-by-week-response.dto';
import { BlockService } from '../../blocks/services/block.service';
import { BulkAttendanceDto } from '../dtos/bulk-attendance.dto';
import { BulkAttendanceResponseDto } from '../dtos/bulk-attendance-response.dto';
import { BlockAssignmentService } from '../../block-assignments/services/block-assignment.service';
import { BlockRolType } from '../../block-assignments/enums/block-rol-type.enum';
import { AttendanceTimeValidator } from '../utils/attendance-time-validator';

@Injectable()
export class AttendanceService {
  constructor(
    @Inject(ATTENDANCE_REPOSITORY)
    private readonly attendanceRepository: IAttendanceRepository,
    private readonly enrollmentService: EnrollmentService,
    private readonly classSessionService: ClassSessionService,
    private readonly blockService: BlockService,
    private readonly blockAssignmentService: BlockAssignmentService,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    await this.enrollmentService.findOne(createAttendanceDto.enrollmentId);
    await this.classSessionService.findOne(createAttendanceDto.classSessionId);
    return await this.attendanceRepository.create(createAttendanceDto as Attendance);
  }

  async findAll(): Promise<Attendance[]> {
    return await this.attendanceRepository.findAll();
  }

  async findOne(id: string): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne(id);
    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }
    return attendance;
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance | null> {
    await this.findOne(id);
    if (updateAttendanceDto.enrollmentId) {
      await this.enrollmentService.findOne(updateAttendanceDto.enrollmentId);
    }
    if (updateAttendanceDto.classSessionId) {
      await this.classSessionService.findOne(updateAttendanceDto.classSessionId);
    }
    return await this.attendanceRepository.update(id, updateAttendanceDto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.attendanceRepository.delete(id);
  }

  async findAttendancesByBlockId(blockId: string, userId?: string, timezone: string = 'UTC'): Promise<AttendanceByWeekResponseDto> {
    // Verificar que el bloque existe
    await this.blockService.findById(blockId);
    
    // Si se proporciona un userId, buscar la matrícula correspondiente
    let enrollmentId: string | undefined;
    if (userId) {
      try {
        const enrollment = await this.enrollmentService.findByUserIdAndBlockId(userId, blockId);
        if (enrollment) {
          enrollmentId = enrollment.id;
        } else {
          // Si no hay matrícula pero se proporcionó un userId, devolvemos un resultado vacío
          // ya que el usuario no está matriculado en este bloque
          return {
            attendancePercentage: '0%',
            weeks: [],
          };
        }
      } catch (error) {
        console.error('Error al buscar la matrícula:', error);
        // En caso de error, continuamos sin filtrar por enrollmentId
      }
    }
    console.log('Buscando asistencias para el bloque:', blockId, 'con enrollmentId:', enrollmentId);
    
    return await this.attendanceRepository.findAttendancesByBlockId(blockId, enrollmentId);
  }

  /**
   * Registra la asistencia de múltiples estudiantes para una sesión de clase específica
   * @param bulkAttendanceDto DTO con la información de asistencias
   * @param userId ID del usuario que registra la asistencia
   * @param rolName Rol del usuario que registra la asistencia
   * @returns Información de las asistencias procesadas
   */
  async registerBulkAttendance(bulkAttendanceDto: BulkAttendanceDto, userId: string, rolName: string | null, timezone: string = 'UTC'): Promise<BulkAttendanceResponseDto> {
    try {
      // 1. Validar la sesión de clase
      const classSession = await this.classSessionService.findOne(bulkAttendanceDto.classSessionId);
      
      if (!classSession) {
        throw new NotFoundException(`Sesión de clase con ID ${bulkAttendanceDto.classSessionId} no encontrada`);
      }
      
      // Validar que el registro de asistencia esté dentro del horario permitido
      // Solo se permite registrar desde 10 minutos antes de la clase hasta el final del día
      AttendanceTimeValidator.validate(classSession, timezone);
      
      // 2. Validar permisos del usuario (solo profesores asignados al bloque pueden registrar asistencia)
      if (rolName !== 'TEACHER') {
        throw new ForbiddenException('Solo los profesores pueden registrar asistencia');
      }
      
      const blockAssignments = await this.blockAssignmentService.findByBlockId(classSession.blockId);
      
      const isTeacherAssigned = blockAssignments.some(
        assignment => assignment.userId === userId
      );
      
      const isResponsible = blockAssignments.some(
        assignment => assignment.userId === userId && assignment.blockRol === BlockRolType.RESPONSIBLE
      );
      
      if (!isTeacherAssigned && !isResponsible) {
        throw new ForbiddenException('No tiene permisos para registrar asistencia en este bloque');
      }
      
      // 3. Procesar los registros de asistencia en lote dentro de una transacción
      return await this.attendanceRepository.withTransaction(async () => {
        // Extraer IDs de matrícula de los registros
        const enrollmentIds = bulkAttendanceDto.attendanceRecords.map(record => record.enrollmentId);
        
        // Validar que hay registros para procesar
        if (enrollmentIds.length === 0) {
          throw new BadRequestException('No se han proporcionado registros de asistencia');
        }
        
        // Obtener registros de asistencia existentes para esta sesión y estos estudiantes (en una sola consulta)
        const existingAttendances = await this.attendanceRepository.findManyByClassSessionAndEnrollments(
          bulkAttendanceDto.classSessionId,
          enrollmentIds
        );
        
        // Preparar los datos para la operación de lote
        const attendancesToSave = bulkAttendanceDto.attendanceRecords.map(record => {
          const existingAttendance = existingAttendances.get(record.enrollmentId);
          
          if (existingAttendance) {
            // Si existe, actualizamos el estado manteniendo el ID
            return {
              id: existingAttendance.id,
              enrollmentId: record.enrollmentId,
              classSessionId: bulkAttendanceDto.classSessionId,
              status: record.status,
              attendanceDate: new Date()
            };
          } else {
            // Si no existe, creamos un nuevo registro
            return {
              enrollmentId: record.enrollmentId,
              classSessionId: bulkAttendanceDto.classSessionId,
              status: record.status,
              attendanceDate: new Date()
            };
          }
        });
        
        // Crear o actualizar todos los registros en una sola operación
        const attendanceResults = await this.attendanceRepository.createOrUpdateMany(attendancesToSave);
        
        // Obtener información de la sesión para la respuesta
        let sessionInfo = 'Sesión de clase';
        if (classSession.startDateTime) {
          const sessionDate = new Date(classSession.startDateTime);
          
          // Simplemente usar la fecha en formato ISO para que el frontend la formatee
          sessionInfo = `Sesión del ${sessionDate.toISOString().split('T')[0]}`;
        }
        
        return {
          attendances: attendanceResults,
          totalProcessed: attendanceResults.length,
          sessionInfo
        };
      });
    } catch (error) {
      throw error;
    }
  }
}
