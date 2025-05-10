import { Course } from '../entities/course.entity';
import { CoursesByProgramTypeDto } from '../dtos/courses-by-program-type.dto';
import { CoursesByProgramTypeResponseDto } from '../dtos/courses-by-program-type-response.dto';

export interface ICourseRepository {
  create(course: Course): Promise<Course>;
  findAll(): Promise<Course[]>;
  findOne(id: string): Promise<Course | null>;
  update(id: string, course: Partial<Course>): Promise<Course | null>;
  delete(id: string): Promise<void>;
  findCoursesByProgramType(userId: string, filters: CoursesByProgramTypeDto): Promise<CoursesByProgramTypeResponseDto>;
}
