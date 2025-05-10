import { Semester } from '../entities/semester.entity';

export interface ISemesterRepository {
  create(semester: Partial<Semester>): Promise<Semester>;
  findAll(): Promise<Semester[]>;
  findOne(id: string): Promise<Semester | null>;
  update(id: string, semester: Partial<Semester>): Promise<Semester | null>;
  delete(id: string): Promise<void>;
  findByUserId(userId: string, currentYear?: number): Promise<Semester[]>;
}