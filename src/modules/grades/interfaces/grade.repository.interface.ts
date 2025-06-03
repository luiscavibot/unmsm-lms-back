import { Grade } from '../entities/grade.entity';

export interface IGradeRepository {
  create(grade: Partial<Grade>): Promise<Grade>;
  findAll(): Promise<Grade[]>;
  findOne(id: string): Promise<Grade | null>;
  findByEvaluationId(evaluationId: string): Promise<Grade[]>;
  findByEnrollmentId(enrollmentId: string): Promise<Grade[]>;
  findByEvaluationAndEnrollment(evaluationId: string, enrollmentId: string): Promise<Grade | null>;
  update(id: string, grade: Partial<Grade>): Promise<Grade | null>;
  delete(id: string): Promise<void>;
  
  // Nuevos métodos para el manejo de matriz de calificaciones
  findByBlockIdAndEvaluationIds(blockId: string, evaluationIds: string[]): Promise<Grade[]>;
  findByBlockIdAndEnrollmentId(blockId: string, enrollmentId: string): Promise<Grade[]>;
  calculateBlockAverage(blockId: string, enrollmentId: string): Promise<number>;
  calculateCourseAverage(courseOfferingId: string, enrollmentId: string): Promise<number>;
  createOrUpdateMany(
    grades: {
      enrollmentId: string;
      evaluationId: string;
      score: number;
      id?: string;
    }[]
  ): Promise<Grade[]>;
  withTransaction<T>(
    runInTransaction: (entityManager: any) => Promise<T>
  ): Promise<T>;
}
