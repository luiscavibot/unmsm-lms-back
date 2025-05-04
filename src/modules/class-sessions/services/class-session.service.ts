import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClassSession } from '../entities/class-session.entity';
import { IClassSessionRepository } from '../interfaces/class-session.repository.interface';
import { CreateClassSessionDto } from '../dtos/create-class-session.dto';
import { UpdateClassSessionDto } from '../dtos/update-class-session.dto';
import { CLASS_SESSION_REPOSITORY } from '../tokens';
import { CourseOfferingService } from 'src/modules/course-offerings/services/course-offering.service';

@Injectable()
export class ClassSessionService {
  constructor(
    @Inject(CLASS_SESSION_REPOSITORY)
    private readonly classSessionRepository: IClassSessionRepository,
    private readonly courseOfferingService: CourseOfferingService
  ) {}

  async create(createClassSessionDto: CreateClassSessionDto): Promise<ClassSession> {
    await this.courseOfferingService.findOne(createClassSessionDto.programCourseId);
    return await this.classSessionRepository.create(createClassSessionDto as ClassSession);
  }

  async findAll(): Promise<ClassSession[]> {
    return await this.classSessionRepository.findAll();
  }

  async findOne(id: string): Promise<ClassSession> {
    const classSession = await this.classSessionRepository.findOne(id);
    if (!classSession) {
      throw new NotFoundException(`ClassSession with ID ${id} not found`);
    }
    return classSession;
  }

  async update(id: string, updateClassSessionDto: UpdateClassSessionDto): Promise<ClassSession | null> {
    await this.findOne(id);
    if (updateClassSessionDto.programCourseId) {
      await this.courseOfferingService.findOne(updateClassSessionDto.programCourseId);
    }
    return await this.classSessionRepository.update(id, updateClassSessionDto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.classSessionRepository.delete(id);
  }
}
