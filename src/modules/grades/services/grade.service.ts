import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Grade } from '../entities/grade.entity';
import { IGradeRepository } from '../interfaces/grade.repository.interface';
import { CreateGradeDto } from '../dtos/create-grade.dto';
import { UpdateGradeDto } from '../dtos/update-grade.dto';
import { BlockGradeDto } from '../dtos/block-grade.dto';
import { BlockGradeResponseDto, StudentAverageDto } from '../dtos/block-grade-response.dto';
import { GRADE_REPOSITORY } from '../tokens';
import { EnrollmentService } from '../../enrollments/services/enrollment.service';
import { EvaluationService } from '../../evaluations/services/evaluation.service';
import { BlockService } from '../../blocks/services/block.service';
import { EnrollmentBlockService } from '../../enrollment-blocks/services/enrollment-block.service';

@Injectable()
export class GradeService {
  constructor(
    @Inject(GRADE_REPOSITORY)
    private readonly gradeRepository: IGradeRepository,
    private readonly enrollmentService: EnrollmentService,
    private readonly evaluationService: EvaluationService,
    private readonly blockService: BlockService,
    private readonly enrollmentBlockService: EnrollmentBlockService,
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
   * Registra calificaciones por bloque académico y calcula promedios
   * @param blockGradeDto DTO con las calificaciones organizadas por estudiante y evaluación
   * @param userId ID del usuario que registra las calificaciones
   * @param rolName Rol del usuario que registra las calificaciones
   */
  async registerBlockGrades(blockGradeDto: BlockGradeDto, userId: string, rolName: string | null): Promise<BlockGradeResponseDto> {
    // 1. Validar el bloque
    const block = await this.blockService.findById(blockGradeDto.blockId);
    if (!block) {
      throw new NotFoundException(`Bloque con ID ${blockGradeDto.blockId} no encontrado`);
    }

    // 2. Validar permisos del usuario (solo profesores asignados al bloque pueden registrar notas)
    if (rolName !== 'TEACHER') {
      throw new ForbiddenException('Solo los profesores pueden registrar calificaciones');
    }

    // 3. Recopilar todos los IDs de evaluación para validarlos en conjunto
    const allEvaluationIds = new Set<string>();
    blockGradeDto.studentGrades.forEach(student => {
      student.gradeRecords.forEach(record => {
        allEvaluationIds.add(record.evaluationId);
      });
    });
    const evaluationIds = Array.from(allEvaluationIds);
    
    // 4. Validar que todas las evaluaciones existen y pertenecen al bloque
    for (const evaluationId of evaluationIds) {
      const evaluation = await this.evaluationService.findById(evaluationId);
      if (!evaluation) {
        throw new NotFoundException(`Evaluación con ID ${evaluationId} no encontrada`);
      }
      
      if (evaluation.blockId !== blockGradeDto.blockId) {
        throw new ForbiddenException(`La evaluación ${evaluationId} no pertenece al bloque especificado`);
      }
    }
    
    // 5. Procesar cada estudiante y sus calificaciones
    const gradeResults: Grade[] = [];
    const studentAverages: StudentAverageDto[] = [];
    
    for (const student of blockGradeDto.studentGrades) {
      // Validar que el estudiante está matriculado
      await this.enrollmentService.findOne(student.enrollmentId);
      
      // Procesar cada evaluación del estudiante
      for (const gradeRecord of student.gradeRecords) {
        // Buscar si ya existe una calificación para esta evaluación y estudiante
        const existingGrade = await this.gradeRepository.findByEvaluationAndEnrollment(
          gradeRecord.evaluationId,
          student.enrollmentId
        );
        
        let grade: Grade;
        
        if (existingGrade) {
          // Actualizar registro existente
          grade = await this.gradeRepository.update(
            existingGrade.id,
            { score: gradeRecord.score }
          ) as Grade;
        } else {
          // Crear nuevo registro
          grade = await this.gradeRepository.create({
            evaluationId: gradeRecord.evaluationId,
            enrollmentId: student.enrollmentId,
            score: gradeRecord.score
          });
        }
        
        gradeResults.push(grade);
      }
      
      // Calcular el promedio del bloque para este estudiante
      const blockAverage = await this.gradeRepository.calculateBlockAverage(
        blockGradeDto.blockId,
        student.enrollmentId
      );
      
      // Actualizar el promedio en la tabla enrollment_blocks
      await this.enrollmentBlockService.update(
        student.enrollmentId,
        blockGradeDto.blockId,
        { blockAverage }
      );
      
      // Obtener el courseOfferingId para calcular el promedio del curso
      const courseOfferingId = block.courseOfferingId;
      
      // Calcular el promedio del curso para este estudiante
      const courseAverage = await this.gradeRepository.calculateCourseAverage(
        courseOfferingId,
        student.enrollmentId
      );
      
      // Actualizar el promedio final en la tabla enrollment
      await this.enrollmentService.update(
        student.enrollmentId,
        { finalAverage: courseAverage }
      );
      
      // Guardar los promedios calculados para incluirlos en la respuesta
      studentAverages.push({
        enrollmentId: student.enrollmentId,
        blockAverage,
        courseAverage
      });
    }
    
    // 6. Preparar información del bloque para la respuesta
    let blockInfo = `Bloque: ${block.type}`;
    if (block.group) {
      blockInfo += ` - Grupo ${block.group}`;
    }
    
    // 7. Construir la respuesta con la información de las calificaciones y promedios
    return {
      grades: gradeResults,
      totalProcessed: gradeResults.length,
      blockInfo,
      studentAverages
    };
  }
}