import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProgramCourse } from '../entities/program-course.entity';
import { IProgramCourseRepository } from '../interfaces/program-course.repository.interface';

export class TypeormProgramCoursesRepository implements IProgramCourseRepository {
  constructor(
    @InjectRepository(ProgramCourse)
    private readonly programCourseRepository: Repository<ProgramCourse>,
  ) {}

  async create(programCourse: ProgramCourse): Promise<ProgramCourse> {
    return await this.programCourseRepository.save(programCourse);
  }

  async findAll(): Promise<ProgramCourse[]> {
    return await this.programCourseRepository.find({
      relations: ['program', 'course'],
    });
  }

  async findOne(id: string): Promise<ProgramCourse | null> {
    return await this.programCourseRepository.findOne({
      where: { id },
      relations: ['program', 'course'],
    });
  }

  async update(id: string, programCourse: Partial<ProgramCourse>): Promise<ProgramCourse | null> {
    await this.programCourseRepository.update(id, programCourse);
    return await this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.programCourseRepository.delete(id);
  }
}
