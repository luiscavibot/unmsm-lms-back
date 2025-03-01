import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ProgramCourse } from '../entities/program-course.entity';
import { IProgramCourseRepository } from '../interfaces/program-course.repository.interface';
import { CreateProgramCourseDto } from '../dtos/create-program-course.dto';
import { UpdateProgramCourseDto } from '../dtos/update-program-course.dto';
import { PROGRAM_COURSE_REPOSITORY } from '../tokens';
import { ProgramService } from 'src/modules/programs/services/program.service';
import { CourseService } from 'src/modules/courses/services/course.service';

@Injectable()
export class ProgramCourseService {
  constructor(
    @Inject(PROGRAM_COURSE_REPOSITORY)
    private readonly programCourseRepository: IProgramCourseRepository,
    private readonly programService: ProgramService,
    private readonly courseService: CourseService
  ) {}

  async create(createProgramCourseDto: CreateProgramCourseDto): Promise<ProgramCourse> {
    await this.programService.findOne(createProgramCourseDto.programId);
    await this.courseService.findOne(createProgramCourseDto.courseId);
    return await this.programCourseRepository.create(createProgramCourseDto as ProgramCourse);
  }

  async findAll(): Promise<ProgramCourse[]> {
    return await this.programCourseRepository.findAll();
  }

  async findOne(id: string): Promise<ProgramCourse> {
    const programCourse = await this.programCourseRepository.findOne(id);
    if (!programCourse) {
      throw new NotFoundException(`ProgramCourse with ID ${id} not found`);
    }
    return programCourse;
  }

  async update(id: string, updateProgramCourseDto: UpdateProgramCourseDto): Promise<ProgramCourse | null> {
    await this.findOne(id);
    if (updateProgramCourseDto.programId) {
      await this.programService.findOne(updateProgramCourseDto.programId);
    }
    if (updateProgramCourseDto.courseId) {
      await this.courseService.findOne(updateProgramCourseDto.courseId);
    }
    return await this.programCourseRepository.update(id, updateProgramCourseDto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.programCourseRepository.delete(id);
  }
}
