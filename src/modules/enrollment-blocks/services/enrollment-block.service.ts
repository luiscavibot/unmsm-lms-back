import { Inject, Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { EnrollmentBlock } from '../entities/enrollment-block.entity';
import { IEnrollmentBlockRepository } from '../interfaces/enrollment-block.repository.interface';
import { CreateEnrollmentBlockDto } from '../dtos/create-enrollment-block.dto';
import { UpdateEnrollmentBlockDto } from '../dtos/update-enrollment-block.dto';
import { ENROLLMENT_BLOCK_REPOSITORY } from '../tokens';
import { BlockService } from 'src/modules/blocks/services/block.service';
import { EnrollmentService } from 'src/modules/enrollments/services/enrollment.service';
import { FindEnrolledStudentsQuery } from '../queries/find-enrolled-students.query';
import { EnrolledStudentsResponseDto } from '../dtos/enrolled-students-response.dto';
import { BlockAssignmentService } from 'src/modules/block-assignments/services/block-assignment.service';
import { EnrollmentPermissionResult, EnrollmentAccessType } from '../dtos/enrollment-permission.dto';
import { BlockRolType } from 'src/modules/block-assignments/enums/block-rol-type.enum';
import { FindEnrolledStudentsGradesQuery } from '../queries/find-enrolled-students-grades.query';
import { EnrolledStudentsGradesResponseDto } from '../dtos/enrolled-students-grades-response.dto';
import { AttendanceTimeValidator } from 'src/modules/attendance/utils/attendance-time-validator';
import { ClassSessionService } from 'src/modules/class-sessions/services/class-session.service';

@Injectable()
export class EnrollmentBlockService {
  constructor(
    @Inject(ENROLLMENT_BLOCK_REPOSITORY)
    private readonly enrollmentBlockRepository: IEnrollmentBlockRepository,
    private readonly enrollmentService: EnrollmentService,
    private readonly blockService: BlockService,
    private readonly findEnrolledStudentsQuery: FindEnrolledStudentsQuery,
    private readonly blockAssignmentService: BlockAssignmentService,
    private readonly findEnrolledStudentsGradesQuery: FindEnrolledStudentsGradesQuery,
    private readonly classSessionService: ClassSessionService,
  ) {}

  async create(createEnrollmentBlockDto: CreateEnrollmentBlockDto): Promise<EnrollmentBlock> {
    // Verificar que la inscripción existe
    await this.enrollmentService.findOne(createEnrollmentBlockDto.enrollmentId);
    
    // Verificar que el bloque existe
    await this.blockService.findById(createEnrollmentBlockDto.blockId);
    
    // Verificar si ya existe esta relación
    const existingEnrollmentBlock = await this.enrollmentBlockRepository.findOne(
      createEnrollmentBlockDto.enrollmentId,
      createEnrollmentBlockDto.blockId,
    );
    
    if (existingEnrollmentBlock) {
      throw new Error(`Ya existe una relación entre la inscripción ${createEnrollmentBlockDto.enrollmentId} y el bloque ${createEnrollmentBlockDto.blockId}`);
    }
    
    return await this.enrollmentBlockRepository.create(createEnrollmentBlockDto as EnrollmentBlock);
  }

  async findAll(): Promise<EnrollmentBlock[]> {
    return await this.enrollmentBlockRepository.findAll();
  }

  async findOne(enrollmentId: string, blockId: string): Promise<EnrollmentBlock> {
    const enrollmentBlock = await this.enrollmentBlockRepository.findOne(enrollmentId, blockId);
    if (!enrollmentBlock) {
      throw new NotFoundException(`EnrollmentBlock con enrollmentId: ${enrollmentId} y blockId: ${blockId} no encontrado`);
    }
    return enrollmentBlock;
  }

  async findByEnrollmentId(enrollmentId: string): Promise<EnrollmentBlock[]> {
    // Verificar que la inscripción existe
    await this.enrollmentService.findOne(enrollmentId);
    
    return await this.enrollmentBlockRepository.findByEnrollmentId(enrollmentId);
  }

  async findByBlockId(blockId: string): Promise<EnrollmentBlock[]> {
    // Verificar que el bloque existe
    await this.blockService.findById(blockId);
    
    return await this.enrollmentBlockRepository.findByBlockId(blockId);
  }

  async update(
    enrollmentId: string,
    blockId: string,
    updateEnrollmentBlockDto: UpdateEnrollmentBlockDto,
  ): Promise<EnrollmentBlock | null> {
    await this.findOne(enrollmentId, blockId);
    
    return await this.enrollmentBlockRepository.update(
      enrollmentId,
      blockId,
      updateEnrollmentBlockDto,
    );
  }

  async remove(enrollmentId: string, blockId: string): Promise<void> {
    await this.findOne(enrollmentId, blockId);
    await this.enrollmentBlockRepository.delete(enrollmentId, blockId);
  }

  /**
   * Verifica si un usuario tiene permisos para acceder a la información de estudiantes matriculados en un bloque
   * @param userId ID del usuario que realiza la solicitud
   * @param rolName Nombre del rol del usuario
   * @param blockId ID del bloque al que se intenta acceder
   */
  async checkEnrollmentPermissions(userId: string, rolName: string | null, blockId: string): Promise<EnrollmentPermissionResult> {
    // 1. Validar que el usuario sea profesor
    const TEACHER_ROLE = 'TEACHER';
    if (rolName !== TEACHER_ROLE) {
      return {
        hasPermission: false,
        accessType: EnrollmentAccessType.NO_ACCESS,
        message: 'Solo los profesores pueden acceder a la lista de estudiantes matriculados'
      };
    }

    // 2. Buscar el bloque para obtener su courseOfferingId
    const block = await this.blockService.findById(blockId);
    if (!block.courseOfferingId) {
      throw new BadRequestException('El bloque no tiene una oferta de curso asociada');
    }

    // 3. Buscar todas las asignaciones para este bloque
    const blockAssignments = await this.blockAssignmentService.findByBlockId(blockId);
    if (!blockAssignments || blockAssignments.length === 0) {
      return {
        hasPermission: false,
        accessType: EnrollmentAccessType.NO_ACCESS,
        message: 'No hay profesores asignados a este bloque'
      };
    }

    // 4. Buscar si el usuario actual está asignado a este bloque
    const userAssignment = blockAssignments.find(assignment => assignment.userId === userId);
    
    if (userAssignment) {
      return {
        hasPermission: true,
        accessType: EnrollmentAccessType.OWNER,
        message: 'Usuario es colaborador/responsable de este bloque'
      };
    }

    // 5. Si el usuario no está asignado directamente, verificar si es responsable
    // de otro bloque del mismo courseOffering
    const courseOfferingAssignments = 
      await this.blockAssignmentService.findByCourseOfferingId(block.courseOfferingId);
    
    const isResponsible = courseOfferingAssignments.some(
      assignment => assignment.userId === userId && assignment.blockRol === BlockRolType.RESPONSIBLE
    );

    if (isResponsible) {
      return {
        hasPermission: true,
        accessType: EnrollmentAccessType.RESPONSIBLE,
        message: 'Usuario es responsable de la oferta de curso'
      };
    }

    // 6. Si no se cumple ninguna de las condiciones anteriores, no tiene permisos
    return {
      hasPermission: false,
      accessType: EnrollmentAccessType.NO_ACCESS,
      message: 'Usuario no tiene permisos para acceder a la lista de estudiantes de este bloque'
    };
  }

  /**
   * Encuentra todos los estudiantes matriculados en un bloque específico y su asistencia
   * @param blockId ID del bloque
   * @param date Fecha opcional para buscar la asistencia
   * @param userId ID del usuario que realiza la solicitud
   * @param rolName Nombre del rol del usuario
   */
  async findEnrolledStudents(blockId: string, date?: Date, userId?: string, rolName?: string | null): Promise<EnrolledStudentsResponseDto> {
    // Verificar que el bloque existe
    await this.blockService.findById(blockId);
    
    // Si se proporciona un userId y rolName, verificar permisos
    if (userId && rolName !== undefined) {
      const permissionResult = await this.checkEnrollmentPermissions(userId, rolName, blockId);
      if (!permissionResult.hasPermission) {
        throw new ForbiddenException(permissionResult.message);
      }
    }
    
    // Usar el query object para obtener los estudiantes matriculados
    const result = await this.findEnrolledStudentsQuery.execute(blockId, date);
    
    // Verificar si la asistencia puede ser editada (solo si hay una sesión de clase disponible)
    if (result.classSessionId) {
      try {
        // Buscar la sesión de clase relacionada
        const classSession = await this.classSessionService.findOne(result.classSessionId);
        if (classSession) {
          // Verificar si la asistencia puede ser editada según las reglas de tiempo
          const timeWindow = AttendanceTimeValidator.getTimeWindow(classSession);
          result.canEditAttendance = timeWindow.isWithinValidPeriod;
          result.attendanceStatusMessage = timeWindow.statusMessage;
        } else {
          result.canEditAttendance = false;
          result.attendanceStatusMessage = 'No se encontró la sesión de clase relacionada';
        }
      } catch (error) {
        result.canEditAttendance = false;
        result.attendanceStatusMessage = 'Error al verificar el estado de la edición de asistencia';
        console.error('Error al verificar el estado de la edición de asistencia:', error);
      }
    } else {
      result.canEditAttendance = false;
      result.attendanceStatusMessage = 'No hay sesión de clase asociada para registrar asistencia';
    }
    
    return result;
  }

  /**
   * Encuentra todos los estudiantes matriculados en un bloque específico y sus notas
   * @param blockId ID del bloque
   * @param userId ID del usuario que realiza la solicitud
   * @param rolName Nombre del rol del usuario
   */
  async findEnrolledStudentsGrades(blockId: string, userId?: string, rolName?: string | null): Promise<EnrolledStudentsGradesResponseDto> {
    // Verificar que el bloque existe
    await this.blockService.findById(blockId);
    
    // Si se proporciona un userId y rolName, verificar permisos
    if (userId && rolName !== undefined) {
      const permissionResult = await this.checkEnrollmentPermissions(userId, rolName, blockId);
      if (!permissionResult.hasPermission) {
        throw new ForbiddenException(permissionResult.message);
      }
    }
    
    // Usar el query object para obtener los estudiantes matriculados con sus notas
    return await this.findEnrolledStudentsGradesQuery.execute(blockId);
  }
}