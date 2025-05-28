import { Grade } from '../entities/grade.entity';

export interface IGradeRepository {
  create(grade: Partial<Grade>): Promise<Grade>;
  findAll(): Promise<Grade[]>;
  findOne(id: string): Promise<Grade | null>;
  findByEvaluationId(evaluationId: string): Promise<Grade[]>;
  findByEnrollmentId(enrollmentId: string): Promise<Grade[]>;
  update(id: string, grade: Partial<Grade>): Promise<Grade | null>;
  delete(id: string): Promise<void>;
}
