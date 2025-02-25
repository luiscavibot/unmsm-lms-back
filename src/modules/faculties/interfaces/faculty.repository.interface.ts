import { Faculty } from '../entities/faculty.entity';

export interface IFacultyRepository {
  create(faculty: Partial<Faculty>): Promise<Faculty>;
  findAll(): Promise<Faculty[]>;
  findOne(id: string): Promise<Faculty | null>;
  update(id: string, faculty: Partial<Faculty>): Promise<Faculty | null>;
  delete(id: string): Promise<void>;
}
