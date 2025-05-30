import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Grade } from '../entities/grade.entity';
import { IGradeRepository } from '../interfaces/grade.repository.interface';
import { CreateGradeDto } from '../dtos/create-grade.dto';
import { UpdateGradeDto } from '../dtos/update-grade.dto';
import { BulkGradeDto } from '../dtos/bulk-grade.dto';
import { BulkGradeResponseDto } from '../dtos/bulk-grade-response.dto';
import { GRADE_REPOSITORY } from '../tokens';
import { EnrollmentService } from '../../enrollments/services/enrollment.service';
import { EvaluationService } from '../../evaluations/services/evaluation.service';

@Injectable()
export class GradeService {
  constructor(
    @Inject(GRADE_REPOSITORY)
    private readonly gradeRepository: IGradeRepository,
    private readonly enrollmentService: EnrollmentService,
    private readonly evaluationService: EvaluationService,
  ) {}

  async create(createGradeDto: CreateGradeDto): Promise<Grade> {
    // Verificar que la evaluación existe si se proporciona evaluationId
    if (createGradeDto.evaluationId) {
      await this.evaluationService.findById(createGradeDto.evaluationId);
    }
    
    // Verificar que la inscripción existe si se proporciona enrollmentId
    if (createGradeDto.enrollmentId) {
      await this.enrollmentService.findOne(createGradeDto.enrollmentId);
    }
    
    return await this.gradeRepository.create(createGradeDto);
  }

  async findAll(): Promise<Grade[]> {
    return await this.gradeRepository.findAll();
  }

  async findOne(id: string): Promise<Grade> {
    const grade = await this.gradeRepository.findOne(id);
    if (!grade) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }
    return grade;
  }

  async findByEvaluationId(evaluationId: string): Promise<Grade[]> {
    // Verificar que la evaluación existe
    await this.evaluationService.findById(evaluationId);
    
    return await this.gradeRepository.findByEvaluationId(evaluationId);
  }

  async findByEnrollmentId(enrollmentId: string): Promise<Grade[]> {
    // Verificar que la inscripción existe
    await this.enrollmentService.findOne(enrollmentId);
    
    return await this.gradeRepository.findByEnrollmentId(enrollmentId);
  }

  async update(id: string, updateGradeDto: UpdateGradeDto): Promise<Grade | null> {
    const grade = await this.gradeRepository.findOne(id);
    if (!grade) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }
    return await this.gradeRepository.update(id, updateGradeDto);
  }

  async remove(id: string): Promise<void> {
    const grade = await this.gradeRepository.findOne(id);
    if (!grade) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }
    await this.gradeRepository.delete(id);
  }

  /**
   * Registra las calificaciones de múltiples estudiantes para una evaluación específica
   * @param bulkGradeDto DTO con la información de calificaciones
   * @param userId ID del usuario que registra las calificaciones
   * @param rolName Rol del usuario que registra las calificaciones
   */
  async registerBulkGrades(bulkGradeDto: BulkGradeDto, userId: string, rolName: string | null): Promise<BulkGradeResponseDto> {
    // 1. Validar la evaluación
    const evaluation = await this.evaluationService.findById(bulkGradeDto.evaluationId);
    
    if (!evaluation) {
      throw new NotFoundException(`Evaluación con ID ${bulkGradeDto.evaluationId} no encontrada`);
    }
    
    // 2. Validar permisos del usuario (solo profesores asignados al bloque pueden registrar notas)
    if (rolName !== 'TEACHER') {
      throw new ForbiddenException('Solo los profesores pueden registrar calificaciones');
    }
    
    // 3. Procesar cada registro de calificación
    const gradeResults: Grade[] = [];
    
    for (const record of bulkGradeDto.gradeRecords) {
      // Validar que el estudiante está matriculado
      await this.enrollmentService.findOne(record.enrollmentId);
      
      // Buscar si ya existe un registro de calificación para este estudiante en esta evaluación
      const existingGrade = await this.gradeRepository.findByEvaluationAndEnrollment(
        bulkGradeDto.evaluationId,
        record.enrollmentId
      );
      
      let grade: Grade;
      
      if (existingGrade) {
        // Actualizar registro existente
        grade = await this.gradeRepository.update(
          existingGrade.id,
          { score: record.score }
        ) as Grade;
      } else {
        // Crear nuevo registro
        grade = await this.gradeRepository.create({
          evaluationId: bulkGradeDto.evaluationId,
          enrollmentId: record.enrollmentId,
          score: record.score
        });
      }
      
      gradeResults.push(grade);
    }
    
    // 4. Preparar información de la evaluación para la respuesta
    let evaluationInfo = `Evaluación: ${evaluation.title}`;
    
    if (evaluation.evaluationDate) {
      try {
        const evaluationDate = new Date(evaluation.evaluationDate);
        evaluationInfo = `${evaluation.title} - ${evaluationDate.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })}`;
      } catch (e) {
        // Si hay un error al formatear la fecha, usar un formato simple
        evaluationInfo = `${evaluation.title} - ${evaluation.evaluationDate.toISOString().split('T')[0]}`;
      }
    }
    
    // Construir la respuesta
    return {
      grades: gradeResults,
      totalProcessed: gradeResults.length,
      evaluationInfo
    };
  }
}