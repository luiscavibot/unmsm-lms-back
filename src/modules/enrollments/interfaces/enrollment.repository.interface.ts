import { Enrollment } from '../entities/enrollment.entity';

export interface IEnrollmentRepository {
  create(enrollment: Enrollment): Promise<Enrollment>;
  findAll(): Promise<Enrollment[]>;
  findOne(id: string): Promise<Enrollment | null>;
  update(id: string, enrollment: Partial<Enrollment>): Promise<Enrollment | null>;
  delete(id: string): Promise<void>;
  findByUserIdAndBlockId(userId: string, blockId: string): Promise<Enrollment | null>;
}
