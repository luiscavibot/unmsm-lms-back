import { Inject, Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { EvaluationRepository } from '../interfaces/evaluation-repository.interface';
import { EVALUATION_REPOSITORY } from '../tokens/index';
import { Evaluation } from '../entities/evaluation.entity';
import { CreateEvaluationDto } from '../dtos/create-evaluation.dto';
import { UpdateEvaluationDto } from '../dtos/update-evaluation.dto';
import { StudentGradesResponseDto } from '../dtos/student-grades-response.dto';
import { BlockAssignmentService } from '../../block-assignments/services/block-assignment.service';
import { BlockRolType } from '../../block-assignments/enums/block-rol-type.enum';

@Injectable()
export class EvaluationService {
  constructor(
    @Inject(EVALUATION_REPOSITORY)
    private readonly evaluationRepository: EvaluationRepository,
    private readonly blockAssignmentService: BlockAssignmentService,
  ) {}

  async findAll(): Promise<Evaluation[]> {
    return this.evaluationRepository.findAll();
  }

  async findById(id: string): Promise<Evaluation> {
    const evaluation = await this.evaluationRepository.findById(id);
    if (!evaluation) {
      throw new NotFoundException(`Evaluation with ID ${id} not found`);
    }
    return evaluation;
  }

  async findByBlockId(blockId: string): Promise<Evaluation[]> {
    return this.evaluationRepository.findByBlockId(blockId);
  }

  async create(createEvaluationDto: CreateEvaluationDto): Promise<Evaluation> {
    const evaluationData: Partial<Evaluation> = {
      ...createEvaluationDto,
      evaluationDate: new Date(createEvaluationDto.evaluationDate)
    };
    return this.evaluationRepository.create(evaluationData);
  }
  
  async checkTeacherPermission(userId: string, rolName: string | null, blockId: string): Promise<boolean> {
    // 1. Validar que el usuario sea profesor
    if (rolName !== 'TEACHER') {
      throw new ForbiddenException('Solo los profesores pueden crear o modificar evaluaciones');
    }

    // 2. Buscar todas las asignaciones para este bloque
    const blockAssignments = await this.blockAssignmentService.findByBlockId(blockId);
    if (!blockAssignments || blockAssignments.length === 0) {
      throw new BadRequestException('No hay profesores asignados a este bloque');
    }

    // 3. Verificar si el usuario está asignado a este bloque
    const userAssignment = blockAssignments.find(assignment => assignment.userId === userId);
    if (userAssignment) {
      return true; // El usuario es colaborador o responsable del bloque
    }

    // 4. Si no está asignado directamente al bloque, verificar si es responsable de la oferta de curso
    // Para esto necesitamos obtener primero la oferta de curso asociada al bloque
    if (blockAssignments.length > 0) {
      const courseOfferingId = blockAssignments[0].courseOfferingId;
      const courseOfferingAssignments = await this.blockAssignmentService.findByCourseOfferingId(courseOfferingId);

      const isResponsible = courseOfferingAssignments.some(
        assignment => assignment.userId === userId && assignment.blockRol === BlockRolType.RESPONSIBLE
      );

      if (isResponsible) {
        return true; // El usuario es responsable de la oferta de curso
      }
    }

    throw new ForbiddenException('No tiene permisos para crear o modificar evaluaciones en este bloque');
  }

  async createWithPermission(createEvaluationDto: CreateEvaluationDto, userId: string, rolName: string | null): Promise<Evaluation> {
    // Verificar permisos del profesor
    await this.checkTeacherPermission(userId, rolName, createEvaluationDto.blockId);
    
    // Crear la evaluación
    const evaluationData: Partial<Evaluation> = {
      ...createEvaluationDto,
      evaluationDate: new Date(createEvaluationDto.evaluationDate)
    };
    
    return this.evaluationRepository.create(evaluationData);
  }

  async update(id: string, updateEvaluationDto: UpdateEvaluationDto): Promise<Evaluation> {
    // Crear un objeto vacío del tipo correcto
    const evaluationData: Partial<Evaluation> = {};
    
    // Copiar manualmente cada propiedad, haciendo la conversión cuando sea necesario
    if (updateEvaluationDto.blockId !== undefined) {
      evaluationData.blockId = updateEvaluationDto.blockId;
    }
    
    if (updateEvaluationDto.title !== undefined) {
      evaluationData.title = updateEvaluationDto.title;
    }
    
    if (updateEvaluationDto.evaluationDate !== undefined) {
      evaluationData.evaluationDate = new Date(updateEvaluationDto.evaluationDate);
    }
    
    if (updateEvaluationDto.weight !== undefined) {
      evaluationData.weight = updateEvaluationDto.weight;
    }
    
    const updatedEvaluation = await this.evaluationRepository.update(id, evaluationData);
    if (!updatedEvaluation) {
      throw new NotFoundException(`Evaluation with ID ${id} not found`);
    }
    return updatedEvaluation;
  }

  async updateWithPermission(id: string, updateEvaluationDto: UpdateEvaluationDto, userId: string, rolName: string | null): Promise<Evaluation> {
    // Primero obtenemos la evaluación para conocer su blockId
    const evaluation = await this.findById(id);
    
    // Verificar permisos del profesor en el bloque actual
    await this.checkTeacherPermission(userId, rolName, evaluation.blockId);
    
    // Si se está cambiando el bloque, verificar permisos en el nuevo bloque también
    if (updateEvaluationDto.blockId !== undefined && updateEvaluationDto.blockId !== evaluation.blockId) {
      await this.checkTeacherPermission(userId, rolName, updateEvaluationDto.blockId);
    }
    
    // Crear un objeto vacío del tipo correcto
    const evaluationData: Partial<Evaluation> = {};
    
    // Copiar manualmente cada propiedad, haciendo la conversión cuando sea necesario
    if (updateEvaluationDto.blockId !== undefined) {
      evaluationData.blockId = updateEvaluationDto.blockId;
    }
    
    if (updateEvaluationDto.title !== undefined) {
      evaluationData.title = updateEvaluationDto.title;
    }
    
    if (updateEvaluationDto.evaluationDate !== undefined) {
      evaluationData.evaluationDate = new Date(updateEvaluationDto.evaluationDate);
    }
    
    if (updateEvaluationDto.weight !== undefined) {
      evaluationData.weight = updateEvaluationDto.weight;
    }
    
    const updatedEvaluation = await this.evaluationRepository.update(id, evaluationData);
    if (!updatedEvaluation) {
      throw new NotFoundException(`Evaluation with ID ${id} not found`);
    }
    
    return updatedEvaluation;
  }

  async delete(id: string): Promise<void> {
    const evaluation = await this.evaluationRepository.findById(id);
    if (!evaluation) {
      throw new NotFoundException(`Evaluation with ID ${id} not found`);
    }
    await this.evaluationRepository.delete(id);
  }

  async deleteWithPermission(id: string, userId: string, rolName: string | null): Promise<void> {
    // Primero obtenemos la evaluación para conocer su blockId
    const evaluation = await this.findById(id);
    
    // Verificar permisos del profesor
    await this.checkTeacherPermission(userId, rolName, evaluation.blockId);
    
    // Eliminar la evaluación
    await this.evaluationRepository.delete(id);
  }

  async findStudentGradesByBlockId(blockId: string, userId: string): Promise<StudentGradesResponseDto> {
    try {
      return await this.evaluationRepository.findStudentGradesByBlockId(blockId, userId);
    } catch (error) {
      throw new NotFoundException(`No se pudieron encontrar las notas para el bloque ${blockId} y el usuario ${userId}: ${error.message}`);
    }
  }
}