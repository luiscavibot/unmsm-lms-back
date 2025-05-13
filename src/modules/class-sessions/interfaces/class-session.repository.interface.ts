import { ClassSession } from '../entities/class-session.entity';

export interface IClassSessionRepository {
  create(classSession: ClassSession): Promise<ClassSession>;
  findAll(): Promise<ClassSession[]>;
  findOne(id: string): Promise<ClassSession | null>;
  findByBlockId(blockId: string): Promise<ClassSession[]>;
  findByWeekId(weekId: string): Promise<ClassSession[]>;
  update(id: string, classSession: Partial<ClassSession>): Promise<ClassSession | null>;
  delete(id: string): Promise<void>;
}
