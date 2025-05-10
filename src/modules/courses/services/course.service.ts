import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Course } from '../entities/course.entity';
import { ICourseRepository } from '../interfaces/course.repository.interface';
import { CreateCourseDto } from '../dtos/create-course.dto';
import { UpdateCourseDto } from '../dtos/update-course.dto';
import { COURSE_REPOSITORY } from '../tokens';
import { CoursesByProgramTypeDto } from '../dtos/courses-by-program-type.dto';
import { CoursesByProgramTypeResponseDto } from '../dtos/courses-by-program-type-response.dto';

@Injectable()
export class CourseService {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    return await this.courseRepository.create(createCourseDto as Course);
  }

  async findAll(): Promise<Course[]> {
    return await this.courseRepository.findAll();
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne(id);
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course | null> {
    await this.findOne(id);
    return await this.courseRepository.update(id, updateCourseDto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.courseRepository.delete(id);
  }
  
  async findCoursesByProgramType(userId: string, filters: CoursesByProgramTypeDto): Promise<CoursesByProgramTypeResponseDto> {
    return await this.courseRepository.findCoursesByProgramType(userId, filters);
  }
}
