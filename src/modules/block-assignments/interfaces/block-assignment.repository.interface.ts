import { BlockAssignment } from '../entities/block-assignment.entity';

export interface IBlockAssignmentRepository {
  create(blockAssignment: Partial<BlockAssignment>): Promise<BlockAssignment>;
  findAll(): Promise<BlockAssignment[]>;
  findByCompositeId(userId: string, blockId: string, courseOfferingId: string): Promise<BlockAssignment | null>;
  findByUserId(userId: string): Promise<BlockAssignment[]>;
  findByBlockId(blockId: string): Promise<BlockAssignment[]>;
  findByCourseOfferingId(courseOfferingId: string): Promise<BlockAssignment[]>;
  update(userId: string, blockId: string, courseOfferingId: string, blockAssignment: Partial<BlockAssignment>): Promise<BlockAssignment | null>;
  delete(userId: string, blockId: string, courseOfferingId: string): Promise<void>;
}