import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from '../entities/grade.entity';
import { IGradeRepository } from '../interfaces/grade.repository.interface';

@Injectable()
export class TypeormGradesRepository implements IGradeRepository {
  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
  ) {}

  async create(grade: Partial<Grade>): Promise<Grade> {
    const newGrade = this.gradeRepository.create(grade);
    return this.gradeRepository.save(newGrade);
  }

  async findAll(): Promise<Grade[]> {
    return this.gradeRepository.find({
      relations: ['evaluation', 'enrollment'],
    });
  }

  async findOne(id: string): Promise<Grade | null> {
    return this.gradeRepository.findOne({
      where: { id },
      relations: ['evaluation', 'enrollment'],
    });
  }

  async findByEvaluationId(evaluationId: string): Promise<Grade[]> {
    return this.gradeRepository.find({
      where: { evaluationId },
      relations: ['evaluation', 'enrollment'],
    });
  }

  async findByEnrollmentId(enrollmentId: string): Promise<Grade[]> {
    return this.gradeRepository.find({
      where: { enrollmentId },
      relations: ['evaluation', 'enrollment'],
    });
  }

  async findByEvaluationAndEnrollment(
    evaluationId: string,
    enrollmentId: string,
  ): Promise<Grade | null> {
    return this.gradeRepository.findOne({
      where: { evaluationId, enrollmentId },
      relations: ['evaluation', 'enrollment'],
    });
  }

  async update(id: string, grade: Partial<Grade>): Promise<Grade | null> {
    await this.gradeRepository.update(id, grade);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.gradeRepository.delete(id);
  }

  /**
   * Encuentra todas las calificaciones para un conjunto de evaluaciones dentro de un bloque
   * @param blockId ID del bloque académico
   * @param evaluationIds IDs de las evaluaciones a buscar
   */
  async findByBlockIdAndEvaluationIds(blockId: string, evaluationIds: string[]): Promise<Grade[]> {
    return this.gradeRepository.createQueryBuilder('grade')
      .innerJoin('grade.evaluation', 'evaluation')
      .where('evaluation.blockId = :blockId', { blockId })
      .andWhere('grade.evaluationId IN (:...evaluationIds)', { evaluationIds })
      .leftJoinAndSelect('grade.evaluation', 'evaluationData')
      .leftJoinAndSelect('grade.enrollment', 'enrollmentData')
      .getMany();
  }

  /**
   * Encuentra todas las calificaciones de un estudiante en un bloque específico
   * @param blockId ID del bloque académico
   * @param enrollmentId ID de la matrícula del estudiante
   */
  async findByBlockIdAndEnrollmentId(blockId: string, enrollmentId: string): Promise<Grade[]> {
    return this.gradeRepository.createQueryBuilder('grade')
      .innerJoin('grade.evaluation', 'evaluation')
      .where('evaluation.blockId = :blockId', { blockId })
      .andWhere('grade.enrollmentId = :enrollmentId', { enrollmentId })
      .leftJoinAndSelect('grade.evaluation', 'evaluationData')
      .getMany();
  }

  /**
   * Calcula el promedio ponderado de un estudiante en un bloque específico
   * @param blockId ID del bloque académico
   * @param enrollmentId ID de la matrícula del estudiante
   */
  async calculateBlockAverage(blockId: string, enrollmentId: string): Promise<number> {
    // 1. Obtener todas las evaluaciones del bloque con sus pesos
    const evaluationsQuery = await this.gradeRepository.manager
      .createQueryBuilder()
      .select('evaluation.id', 'id')
      .addSelect('evaluation.weight', 'weight')
      .from('evaluations', 'evaluation')
      .where('evaluation.blockId = :blockId', { blockId })
      .getRawMany();

    if (!evaluationsQuery.length) {
      return 0;
    }

    // 2. Obtener todas las calificaciones del estudiante en esas evaluaciones
    const grades = await this.gradeRepository.createQueryBuilder('grade')
      .select('grade.score', 'score')
      .addSelect('grade.evaluationId', 'evaluationId')
      .where('grade.enrollmentId = :enrollmentId', { enrollmentId })
      .andWhere('grade.evaluationId IN (:...evaluationIds)', { 
        evaluationIds: evaluationsQuery.map(e => e.id) 
      })
      .getRawMany();

    // 3. Calcular el promedio ponderado
    let totalWeight = 0;
    let weightedSum = 0;

    evaluationsQuery.forEach(evaluation => {
      const grade = grades.find(g => g.evaluationId === evaluation.id);
      const score = grade ? parseFloat(grade.score) : 0; // Si no hay calificación, se considera 0
      weightedSum += score * parseFloat(evaluation.weight);
      totalWeight += parseFloat(evaluation.weight);
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  /**
   * Calcula el promedio general del estudiante en un curso completo
   * @param courseOfferingId ID de la oferta de curso
   * @param enrollmentId ID de la matrícula del estudiante
   */
  async calculateCourseAverage(courseOfferingId: string, enrollmentId: string): Promise<number> {
    // 1. Obtener todos los bloques del curso donde el estudiante está matriculado
    const enrollmentBlocksQuery = await this.gradeRepository.manager
      .createQueryBuilder()
      .select('eb.blockId', 'blockId')
      .select('eb.blockAverage', 'blockAverage')
      .from('enrollment_blocks', 'eb')
      .innerJoin('blocks', 'b', 'b.id = eb.blockId')
      .where('b.courseOfferingId = :courseOfferingId', { courseOfferingId })
      .andWhere('eb.enrollmentId = :enrollmentId', { enrollmentId })
      .getRawMany();

    if (!enrollmentBlocksQuery.length) {
      return 0;
    }

    // 2. Calcular el promedio simple de todos los bloques
    const blockAverages = enrollmentBlocksQuery.map(eb => 
      parseFloat(eb.blockAverage) || 0
    );
    
    const sum = blockAverages.reduce((acc, avg) => acc + avg, 0);
    return sum / blockAverages.length;
  }
}