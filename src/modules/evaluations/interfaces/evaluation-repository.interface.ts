import { Evaluation } from '../entities/evaluation.entity';

export interface EvaluationRepository {
  findAll(): Promise<Evaluation[]>;
  findById(id: string): Promise<Evaluation | null>;
  findByBlockId(blockId: string): Promise<Evaluation[]>;
  create(evaluation: Partial<Evaluation>): Promise<Evaluation>;
  update(id: string, evaluation: Partial<Evaluation>): Promise<Evaluation | null>;
  delete(id: string): Promise<void>;
}