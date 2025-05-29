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

  async findAttendancesByBlockId(blockId: string): Promise<AttendanceByWeekResponseDto> {
    await this.blockService.findById(blockId);
    return await this.attendanceRepository.findAttendancesByBlockId(blockId);
  }

  /**
   * Registra la asistencia de múltiples estudiantes para una sesión de clase específica
   * @param bulkAttendanceDto DTO con la información de asistencias
   * @param userId ID del usuario que registra la asistencia
   * @param rolName Rol del usuario que registra la asistencia
   */
  async registerBulkAttendance(bulkAttendanceDto: BulkAttendanceDto, userId: string, rolName: string | null): Promise<BulkAttendanceResponseDto> {
    // 1. Validar la sesión de clase
    const classSession = await this.classSessionService.findOne(bulkAttendanceDto.classSessionId);
    
    if (!classSession) {
      throw new NotFoundException(`Sesión de clase con ID ${bulkAttendanceDto.classSessionId} no encontrada`);
    }
    
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
    
    // 3. Procesar cada registro de asistencia
    const attendanceResults: Attendance[] = [];
    
    for (const record of bulkAttendanceDto.attendanceRecords) {
      // Validar que el estudiante está matriculado en el bloque
      await this.enrollmentService.findOne(record.enrollmentId);
      
      // Buscar si ya existe un registro de asistencia para este estudiante en esta sesión
      const existingAttendance = await this.attendanceRepository.findByEnrollmentAndSession(
        record.enrollmentId,
        bulkAttendanceDto.classSessionId
      );
      
      let attendance: Attendance;
      
      if (existingAttendance) {
        // Actualizar registro existente
        attendance = await this.attendanceRepository.update(
          existingAttendance.id,
          { status: record.status }
        ) as Attendance;
      } else {
        // Crear nuevo registro
        attendance = await this.attendanceRepository.create({
          enrollmentId: record.enrollmentId,
          classSessionId: bulkAttendanceDto.classSessionId,
          status: record.status,
          attendanceDate: new Date()
        } as Attendance);
      }
      
      attendanceResults.push(attendance);
    }
    
    // Formatear la fecha de la sesión para la respuesta
    let sessionInfo = 'Sesión de clase';
    if (classSession.sessionDate) {
      const sessionDate = new Date(classSession.sessionDate);
      try {
        sessionInfo = `Sesión del ${sessionDate.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })}`;
      } catch (e) {
        // Si hay un error al formatear la fecha, usar un formato simple
        sessionInfo = `Sesión del ${sessionDate.toISOString().split('T')[0]}`;
      }
    }
    
    // Construir la respuesta
    return {
      attendances: attendanceResults,
      totalProcessed: attendanceResults.length,
      sessionInfo
    };
  }
}
