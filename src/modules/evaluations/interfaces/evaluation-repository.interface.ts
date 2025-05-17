import { Evaluation } from '../entities/evaluation.entity';
import { StudentGradesResponseDto } from '../dtos/student-grades-response.dto';

export interface EvaluationRepository {
  findAll(): Promise<Evaluation[]>;
  findById(id: string): Promise<Evaluation | null>;
  findByBlockId(blockId: string): Promise<Evaluation[]>;
  findStudentGradesByBlockId(blockId: string, userId: string): Promise<StudentGradesResponseDto>;
  create(evaluation: Partial<Evaluation>): Promise<Evaluation>;
  update(id: string, evaluation: Partial<Evaluation>): Promise<Evaluation | null>;
  delete(id: string): Promise<void>;
}