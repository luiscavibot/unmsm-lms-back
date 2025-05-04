import { BlockAssignment } from '../entities/block-assignment.entity';

export interface IBlockAssignmentRepository {
  create(blockAssignment: Partial<BlockAssignment>): Promise<BlockAssignment>;
  findAll(): Promise<BlockAssignment[]>;
  findOne(id: string): Promise<BlockAssignment | null>;
  findByUserId(userId: string): Promise<BlockAssignment[]>;
  update(id: string, blockAssignment: Partial<BlockAssignment>): Promise<BlockAssignment | null>;
  delete(id: string): Promise<void>;
}