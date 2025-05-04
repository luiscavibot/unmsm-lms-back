import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CourseOffering } from '../entities/course-offering.entity';
import { ICourseOfferingRepository } from '../interfaces/course-offering.repository.interface';
import { CreateCourseOfferingDto } from '../dtos/create-course-offering.dto';
import { UpdateCourseOfferingDto } from '../dtos/update-course-offering.dto';
import { COURSE_OFFERING_REPOSITORY } from '../tokens';
import { ProgramService } from 'src/modules/programs/services/program.service';
import { CourseService } from 'src/modules/courses/services/course.service';
import { SemesterService } from 'src/modules/semesters/services/semester.service';

@Injectable()
export class CourseOfferingService {
  constructor(
    @Inject(COURSE_OFFERING_REPOSITORY)
    private readonly courseOfferingRepository: ICourseOfferingRepository,
    private readonly programService: ProgramService,
    private readonly courseService: CourseService,
    private readonly semesterService: SemesterService
  ) {}

  async create(createCourseOfferingDto: CreateCourseOfferingDto): Promise<CourseOffering> {
    await this.programService.findOne(createCourseOfferingDto.programId);
    await this.courseService.findOne(createCourseOfferingDto.courseId);
    await this.semesterService.findOne(createCourseOfferingDto.semesterId);
    return await this.courseOfferingRepository.create(createCourseOfferingDto as CourseOffering);
  }

  async findAll(): Promise<CourseOffering[]> {
    return await this.courseOfferingRepository.findAll();
  }

  async findOne(id: string): Promise<CourseOffering> {
    const courseOffering = await this.courseOfferingRepository.findOne(id);
    if (!courseOffering) {
      throw new NotFoundException(`CourseOffering with ID ${id} not found`);
    }
    return courseOffering;
  }

  async update(id: string, updateCourseOfferingDto: UpdateCourseOfferingDto): Promise<CourseOffering | null> {
    await this.findOne(id);
    if (updateCourseOfferingDto.programId) {
      await this.programService.findOne(updateCourseOfferingDto.programId);
    }
    if (updateCourseOfferingDto.courseId) {
      await this.courseService.findOne(updateCourseOfferingDto.courseId);
    }
    if (updateCourseOfferingDto.semesterId) {
      await this.semesterService.findOne(updateCourseOfferingDto.semesterId);
    }
    return await this.courseOfferingRepository.update(id, updateCourseOfferingDto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.courseOfferingRepository.delete(id);
  }
}