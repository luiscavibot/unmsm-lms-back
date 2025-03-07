import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { ICourseRepository } from '../interfaces/course.repository.interface';

export class TypeormCoursesRepository implements ICourseRepository {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(course: Course): Promise<Course> {
    return await this.courseRepository.save(course);
  }

  async findAll(): Promise<Course[]> {
    return await this.courseRepository.find();
  }

  async findOne(id: string): Promise<Course | null> {
    return await this.courseRepository.findOne({
      where: { id },
    });
  }

  async update(id: string, course: Partial<Course>): Promise<Course | null> {
    await this.courseRepository.update(id, course);
    return await this.courseRepository.findOne({
      where: { id },
    });
  }

  async delete(id: string): Promise<void> {
    await this.courseRepository.delete(id);
  }
}
