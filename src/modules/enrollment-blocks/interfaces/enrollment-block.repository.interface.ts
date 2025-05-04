import { EnrollmentBlock } from '../entities/enrollment-block.entity';

export interface IEnrollmentBlockRepository {
  create(enrollmentBlock: EnrollmentBlock): Promise<EnrollmentBlock>;
  findAll(): Promise<EnrollmentBlock[]>;
  findOne(enrollmentId: string, blockId: string): Promise<EnrollmentBlock | null>;
  findByEnrollmentId(enrollmentId: string): Promise<EnrollmentBlock[]>;
  findByBlockId(blockId: string): Promise<EnrollmentBlock[]>;
  update(enrollmentId: string, blockId: string, enrollmentBlock: Partial<EnrollmentBlock>): Promise<EnrollmentBlock | null>;
  delete(enrollmentId: string, blockId: string): Promise<void>;
}