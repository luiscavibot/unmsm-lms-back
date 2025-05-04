import { CourseOffering } from '../entities/course-offering.entity';

export interface ICourseOfferingRepository {
  create(courseOffering: CourseOffering): Promise<CourseOffering>;
  findAll(): Promise<CourseOffering[]>;
  findOne(id: string): Promise<CourseOffering | null>;
  update(id: string, courseOffering: Partial<CourseOffering>): Promise<CourseOffering | null>;
  delete(id: string): Promise<void>;
}