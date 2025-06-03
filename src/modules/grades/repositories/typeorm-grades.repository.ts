import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, DataSource } from 'typeorm';
import { Grade } from '../entities/grade.entity';
import { IGradeRepository } from '../interfaces/grade.repository.interface';

@Injectable()
export class TypeormGradesRepository implements IGradeRepository {
  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
    private readonly dataSource: DataSource
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
    try {
      // Consulta optimizada: obtener evaluaciones y calificaciones en una sola consulta SQL
      const result = await this.gradeRepository.manager
        .createQueryBuilder()
        .select('e.id', 'evaluationId')
        .addSelect('e.weight', 'weight')
        .addSelect('g.score', 'score')
        .from('evaluations', 'e')
        .leftJoin('grades', 'g', 'g.evaluationId = e.id AND g.enrollmentId = :enrollmentId', { enrollmentId })
        .where('e.blockId = :blockId', { blockId })
        .getRawMany();
      
      if (!result.length) {
        return 0;
      }
      
      // Calcular el promedio ponderado
      let totalWeight = 0;
      let weightedSum = 0;
      
      result.forEach(item => {
        const score = item.score ? parseFloat(item.score) : 0;
        const weight = parseFloat(item.weight);
        
        weightedSum += score * weight;
        totalWeight += weight;
      });
      
      return totalWeight > 0 ? weightedSum / totalWeight : 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calcula el promedio general del estudiante en un curso completo
   * @param courseOfferingId ID de la oferta de curso
   * @param enrollmentId ID de la matrícula del estudiante
   */
  async calculateCourseAverage(courseOfferingId: string, enrollmentId: string): Promise<number> {
    try {
      // Consulta optimizada: calcular el promedio directamente en SQL
      const result = await this.gradeRepository.manager
        .createQueryBuilder()
        .select('AVG(COALESCE(eb.blockAverage, 0))', 'courseAverage')
        .from('enrollment_blocks', 'eb')
        .innerJoin('blocks', 'b', 'b.id = eb.blockId')
        .where('b.courseOfferingId = :courseOfferingId', { courseOfferingId })
        .andWhere('eb.enrollmentId = :enrollmentId', { enrollmentId })
        .getRawOne();
      
      return result && result.courseAverage ? parseFloat(result.courseAverage) : 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Ejecuta operaciones dentro de una transacción para garantizar atomicidad
   * @param runInTransaction Función que ejecuta operaciones en la transacción
   */
  async withTransaction<T>(
    runInTransaction: (entityManager: EntityManager) => Promise<T>
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      const result = await runInTransaction(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Crea o actualiza múltiples calificaciones en una sola transacción
   * @param grades Array de calificaciones a crear o actualizar
   */
  async createOrUpdateMany(
    grades: {
      enrollmentId: string;
      evaluationId: string;
      score: number;
      id?: string;
    }[]
  ): Promise<Grade[]> {
    // Si no hay registros para guardar, retornar un array vacío
    if (!grades.length) {
      return [];
    }
    
    // Ejecutar en una transacción para garantizar atomicidad
    return await this.withTransaction(async (entityManager) => {
      // Convertir los objetos planos a entidades Grade
      const gradeEntities = grades.map(grade => {
        const entity = new Grade();
        if (grade.id) entity.id = grade.id;
        entity.enrollmentId = grade.enrollmentId;
        entity.evaluationId = grade.evaluationId;
        entity.score = grade.score;
        return entity;
      });
      
      // Usar el entityManager proporcionado por la transacción
      return await entityManager.save(Grade, gradeEntities);
    });
  }
}