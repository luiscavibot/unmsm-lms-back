import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Enrollment } from '../entities/enrollment.entity';
import { IEnrollmentRepository } from '../interfaces/enrollment.repository.interface';
import { CreateEnrollmentDto } from '../dtos/create-enrollment.dto';
import { UpdateEnrollmentDto } from '../dtos/update-enrollment.dto';
import { ENROLLMENT_REPOSITORY } from '../tokens';
import { UserService } from 'src/modules/users/services/user.service';
import { ProgramCourseService } from 'src/modules/program-courses/services/program-course.service';

@Injectable()
export class EnrollmentService {
  constructor(
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly userService: UserService,
    private readonly programCourseService: ProgramCourseService,
  ) {}

  async create(createEnrollmentDto: CreateEnrollmentDto): Promise<Enrollment> {
    await this.userService.findOne(createEnrollmentDto.userId);
    await this.programCourseService.findOne(createEnrollmentDto.programCourseId);
    return await this.enrollmentRepository.create(createEnrollmentDto as Enrollment);
  }

  async findAll(): Promise<Enrollment[]> {
    return await this.enrollmentRepository.findAll();
  }

  async findOne(id: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.findOne(id);
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }
    return enrollment;
  }

  async update(id: string, updateEnrollmentDto: UpdateEnrollmentDto): Promise<Enrollment | null> {
    await this.findOne(id);
    if (updateEnrollmentDto.userId) {
      await this.userService.findOne(updateEnrollmentDto.userId);
    }
    if (updateEnrollmentDto.programCourseId) {
      await this.programCourseService.findOne(updateEnrollmentDto.programCourseId);
    }
    return await this.enrollmentRepository.update(id, updateEnrollmentDto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.enrollmentRepository.delete(id);
  }
}
