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
    console.log(`[Grades Service] Iniciando procesamiento - ${new Date().toISOString()}`);
    
    // 1. Validar el bloque (blockId siempre viene del path param)
    const blockId: string = blockGradeDto.blockId as string; // Aseguramos que es string
    console.log(`[Grades Service] Validando bloque ${blockId}`);
    const block = await this.blockService.findById(blockId);
    if (!block) {
      throw new NotFoundException(`Bloque con ID ${blockId} no encontrado`);
    }

    // 2. Validar permisos del usuario (solo profesores asignados al bloque pueden registrar notas)
    if (rolName !== 'TEACHER') {
      throw new ForbiddenException('Solo los profesores pueden registrar calificaciones');
    }

    // 3. Recopilar todos los IDs de evaluación para validarlos en conjunto
    console.log(`[Grades Service] Recopilando IDs de evaluación`);
    const allEvaluationIds = new Set<string>();
    blockGradeDto.studentGrades.forEach(student => {
      student.gradeRecords.forEach(record => {
        allEvaluationIds.add(record.evaluationId);
      });
    });
    const evaluationIds = Array.from(allEvaluationIds);
    console.log(`[Grades Service] Total de evaluaciones: ${evaluationIds.length}`);
    
    // Cachés para almacenar las validaciones y evitar consultas repetidas
    const evaluationCache = new Map<string, any>();
    const enrollmentCache = new Map<string, any>();
    
    // 4. Validar que todas las evaluaciones existen y pertenecen al bloque
    console.log(`[Grades Service] Validando evaluaciones - ${new Date().toISOString()}`);
    const startValidateEvals = Date.now();
    
    // Validar evaluaciones en paralelo
    await Promise.all(evaluationIds.map(async (evaluationId) => {
      // Verificar si ya está en caché
      if (!evaluationCache.has(evaluationId)) {
        const evaluation = await this.evaluationService.findById(evaluationId);
        if (!evaluation) {
          throw new NotFoundException(`Evaluación con ID ${evaluationId} no encontrada`);
        }
        
        if (evaluation.blockId !== blockId) {
          throw new ForbiddenException(`La evaluación ${evaluationId} no pertenece al bloque especificado`);
        }
        
        evaluationCache.set(evaluationId, evaluation);
      }
    }));
    
    console.log(`[Grades Service] Validación de evaluaciones completada en ${Date.now() - startValidateEvals}ms`);
    
    // 5. Preparar todas las calificaciones para procesamiento masivo
    console.log(`[Grades Service] Preparando calificaciones para procesamiento masivo - ${new Date().toISOString()}`);
    const gradesToProcess: { enrollmentId: string; evaluationId: string; score: number; id?: string }[] = [];
    
    // Recopilar todos los enrollmentIds para validar y luego buscar calificaciones existentes
    const enrollmentIds: string[] = blockGradeDto.studentGrades.map(student => student.enrollmentId);
    console.log(`[Grades Service] Total de estudiantes: ${enrollmentIds.length}`);
    
    // Validar que todos los estudiantes están matriculados - en paralelo
    console.log(`[Grades Service] Validando matrículas - ${new Date().toISOString()}`);
    const startValidateEnrollments = Date.now();
    await Promise.all(enrollmentIds.map(async (enrollmentId) => {
      // Verificar si ya está en caché
      if (!enrollmentCache.has(enrollmentId)) {
        const enrollment = await this.enrollmentService.findOne(enrollmentId);
        enrollmentCache.set(enrollmentId, enrollment);
      }
    }));
    console.log(`[Grades Service] Validación de matrículas completada en ${Date.now() - startValidateEnrollments}ms`);
    
    // Buscar calificaciones existentes para optimizar la actualización
    console.log(`[Grades Service] Buscando calificaciones existentes - ${new Date().toISOString()}`);
    const startFindExisting = Date.now();
    const existingGrades = await this.gradeRepository.findByBlockIdAndEvaluationIds(
      blockId, 
      evaluationIds
    );
    console.log(`[Grades Service] Se encontraron ${existingGrades.length} calificaciones existentes - ${Date.now() - startFindExisting}ms`);
    
    // Crear un mapa para acceso rápido a las calificaciones existentes
    const existingGradesMap = new Map<string, Grade>();
    existingGrades.forEach(grade => {
      const key = `${grade.evaluationId}-${grade.enrollmentId}`;
      existingGradesMap.set(key, grade);
    });
    
    // Preparar las calificaciones para la operación masiva
    blockGradeDto.studentGrades.forEach(student => {
      student.gradeRecords.forEach(gradeRecord => {
        const key = `${gradeRecord.evaluationId}-${student.enrollmentId}`;
        const existingGrade = existingGradesMap.get(key);
        
        // Agregar a la lista para procesamiento masivo
        gradesToProcess.push({
          id: existingGrade?.id, // Si existe, incluir el ID para actualizar
          enrollmentId: student.enrollmentId,
          evaluationId: gradeRecord.evaluationId,
          score: gradeRecord.score
        });
      });
    });
    
    // 6. Procesar todas las calificaciones en una transacción
    console.log(`[Grades Service] Procesando ${gradesToProcess.length} calificaciones en transacción - ${new Date().toISOString()}`);
    const startBulkProcess = Date.now();
    const gradeResults = await this.gradeRepository.createOrUpdateMany(gradesToProcess);
    console.log(`[Grades Service] Procesamiento masivo completado en ${Date.now() - startBulkProcess}ms`);
    
    // 7. Calcular promedios y actualizar - OPTIMIZADO EN PARALELO
    console.log(`[Grades Service] Calculando promedios en paralelo - ${new Date().toISOString()}`);
    const startCalcAvg = Date.now();
    
    // Obtener el courseOfferingId para calcular el promedio del curso
    const courseOfferingId = block.courseOfferingId;
    
    // Cachés para los promedios calculados
    const blockAverageCache = new Map<string, number>();
    const courseAverageCache = new Map<string, number>();
    
    // Procesar todos los estudiantes en paralelo
    const averagePromises = enrollmentIds.map(async (enrollmentId) => {
      // Calcular el promedio del bloque para este estudiante
      const blockAverage = await this.gradeRepository.calculateBlockAverage(
        blockId,
        enrollmentId
      );
      blockAverageCache.set(enrollmentId, blockAverage);
      
      // Actualizar el promedio en la tabla enrollment_blocks
      await this.enrollmentBlockService.update(
        enrollmentId,
        blockId,
        { blockAverage }
      );
      
      // Calcular el promedio del curso para este estudiante
      const courseAverage = await this.gradeRepository.calculateCourseAverage(
        courseOfferingId,
        enrollmentId
      );
      courseAverageCache.set(enrollmentId, courseAverage);
      
      // Actualizar el promedio final en la tabla enrollment
      await this.enrollmentService.update(
        enrollmentId,
        { finalAverage: courseAverage }
      );
      
      // Retornar los promedios calculados para incluirlos en la respuesta
      return {
        enrollmentId,
        blockAverage,
        courseAverage
      };
    });
    
    // Esperar a que se completen todos los cálculos en paralelo
    const studentAverages = await Promise.all(averagePromises);
    
    console.log(`[Grades Service] Cálculo de promedios completado en ${Date.now() - startCalcAvg}ms`);
    
    // 8. Preparar información del bloque para la respuesta
    let blockInfo = `Bloque: ${block.type}`;
    if (block.group) {
      blockInfo += ` - Grupo ${block.group}`;
    }
    
    // 9. Construir la respuesta con la información de las calificaciones y promedios
    console.log(`[Grades Service] Procesamiento finalizado - ${new Date().toISOString()}`);
    return {
      grades: gradeResults,
      totalProcessed: gradeResults.length,
      blockInfo,
      studentAverages
    };
  }
}