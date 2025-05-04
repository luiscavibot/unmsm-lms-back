import { Block } from '../entities/block.entity';

export interface BlockRepository {
  findAll(): Promise<Block[]>;
  findById(id: string): Promise<Block | null>;
  findByCourseOfferingId(courseOfferingId: string): Promise<Block[]>;
  findByBlockAssignmentId(blockAssignmentId: string): Promise<Block[]>;
  create(block: Partial<Block>): Promise<Block>;
  update(id: string, block: Partial<Block>): Promise<Block | null>;
  delete(id: string): Promise<void>;
}