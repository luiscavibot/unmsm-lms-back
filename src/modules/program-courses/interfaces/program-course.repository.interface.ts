import { ProgramCourse } from '../entities/program-course.entity';

export interface IProgramCourseRepository {
  create(programCourse: ProgramCourse): Promise<ProgramCourse>;
  findAll(): Promise<ProgramCourse[]>;
  findOne(id: string): Promise<ProgramCourse | null>;
  update(id: string, programCourse: Partial<ProgramCourse>): Promise<ProgramCourse | null>;
  delete(id: string): Promise<void>;
}
