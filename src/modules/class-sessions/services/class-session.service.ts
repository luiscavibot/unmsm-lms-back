import { Inject, Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ClassSession } from '../entities/class-session.entity';
import { IClassSessionRepository } from '../interfaces/class-session.repository.interface';
import { CreateClassSessionDto } from '../dtos/create-class-session.dto';
import { UpdateClassSessionDto } from '../dtos/update-class-session.dto';
import { CLASS_SESSION_REPOSITORY } from '../tokens';
import { BlockService } from 'src/modules/blocks/services/block.service';
import { WeekService } from 'src/modules/weeks/services/week.service';
import { ClassDayInfo, ClassDaysResponseDto } from '../dtos/class-days-response.dto';
import { ClassSessionPermissionResult, ClassSessionAccessType } from '../dtos/class-session-permission.dto';
import { BlockAssignmentService } from 'src/modules/block-assignments/services/block-assignment.service';
import { BlockRolType } from 'src/modules/block-assignments/enums/block-rol-type.enum';

@Injectable()
export class ClassSessionService {
  private readonly TEACHER_ROLE = 'TEACHER';
  
  constructor(
    @Inject(CLASS_SESSION_REPOSITORY)
    private readonly classSessionRepository: IClassSessionRepository,
    private readonly blockService: BlockService,
    private readonly weekService: WeekService,
    private readonly blockAssignmentService: BlockAssignmentService
  ) {}

  async create(createClassSessionDto: CreateClassSessionDto): Promise<ClassSession> {
    // Verificar que el bloque existe
    await this.blockService.findById(createClassSessionDto.blockId);
    
    // Verificar que la semana existe
    await this.weekService.findById(createClassSessionDto.weekId);
    
    return await this.classSessionRepository.create(createClassSessionDto as ClassSession);
  }

  async findAll(): Promise<ClassSession[]> {
    return await this.classSessionRepository.findAll();
  }

  async findByBlockId(blockId: string): Promise<ClassSession[]> {
    // Verificar que el bloque existe
    await this.blockService.findById(blockId);
    
    return await this.classSessionRepository.findByBlockId(blockId);
  }

  async findByWeekId(weekId: string): Promise<ClassSession[]> {
    // Verificar que la semana existe
    await this.weekService.findById(weekId);
    
    return await this.classSessionRepository.findByWeekId(weekId);
  }

  async findOne(id: string): Promise<ClassSession> {
    const classSession = await this.classSessionRepository.findOne(id);
    if (!classSession) {
      throw new NotFoundException(`ClassSession with ID ${id} not found`);
    }
    return classSession;
  }

  async update(id: string, updateClassSessionDto: UpdateClassSessionDto): Promise<ClassSession | null> {
    await this.findOne(id);
    
    if (updateClassSessionDto.blockId) {
      await this.blockService.findById(updateClassSessionDto.blockId);
    }
    
    if (updateClassSessionDto.weekId) {
      await this.weekService.findById(updateClassSessionDto.weekId);
    }
    
    return await this.classSessionRepository.update(id, updateClassSessionDto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.classSessionRepository.delete(id);
  }

  async checkClassSessionPermissions(userId: string, rolName: string | null, blockId: string): Promise<ClassSessionPermissionResult> {
    // 1. Validar que el usuario sea profesor
    if (rolName !== this.TEACHER_ROLE) {
      return {
        hasPermission: false,
        accessType: ClassSessionAccessType.NO_ACCESS,
        message: 'Solo los profesores pueden acceder a la información de días de clase'
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
        accessType: ClassSessionAccessType.NO_ACCESS,
        message: 'No hay profesores asignados a este bloque'
      };
    }

    // 4. Buscar si el usuario actual está asignado a este bloque
    const userAssignment = blockAssignments.find(assignment => assignment.userId === userId);
    
    if (userAssignment) {
      return {
        hasPermission: true,
        accessType: ClassSessionAccessType.OWNER,
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
        accessType: ClassSessionAccessType.RESPONSIBLE,
        message: 'Usuario es responsable de la oferta de curso'
      };
    }

    // 6. Si no se cumple ninguna de las condiciones anteriores, no tiene permisos
    return {
      hasPermission: false,
      accessType: ClassSessionAccessType.NO_ACCESS,
      message: 'Usuario no tiene permisos para acceder a la información de días de clase de este bloque'
    };
  }

  async getClassDaysForDatepicker(blockId: string, userId?: string, rolName?: string | null): Promise<ClassDaysResponseDto> {
    // Verificar que el bloque existe
    await this.blockService.findById(blockId);
    
    // Si se proporciona un userId y rolName, verificar permisos
    if (userId && rolName !== undefined) {
      const permissionResult = await this.checkClassSessionPermissions(userId, rolName, blockId);
      if (!permissionResult.hasPermission) {
        throw new ForbiddenException(permissionResult.message);
      }
    }
    
    // Obtener todas las sesiones de clase para este bloque
    const classSessions = await this.classSessionRepository.findByBlockId(blockId);
    
    // Formatear la respuesta para el datepicker
    const classDays: ClassDayInfo[] = classSessions.map(session => {
      // Asegurar que la fecha esté en formato YYYY-MM-DD
      const date = new Date(session.sessionDate);
      const formattedDate = date.toISOString().split('T')[0];
      
      return {
        date: formattedDate,
        startTime: session.startTime,
        endTime: session.endTime,
        sessionId: session.id,
        virtualRoomUrl: session.virtualRoomUrl
      };
    });
    
    // Ordenar por fecha
    classDays.sort((a, b) => a.date.localeCompare(b.date));
    
    return { classDays };
  }
}
