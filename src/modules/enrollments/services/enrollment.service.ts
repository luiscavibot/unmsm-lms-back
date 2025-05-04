import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Enrollment } from '../entities/enrollment.entity';
import { IEnrollmentRepository } from '../interfaces/enrollment.repository.interface';
import { CreateEnrollmentDto } from '../dtos/create-enrollment.dto';
import { UpdateEnrollmentDto } from '../dtos/update-enrollment.dto';
import { ENROLLMENT_REPOSITORY } from '../tokens';
import { UserService } from 'src/modules/users/services/user.service';
import { CourseOfferingService } from 'src/modules/course-offerings/services/course-offering.service';

@Injectable()
export class EnrollmentService {
  constructor(
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly userService: UserService,
    private readonly courseOfferingService: CourseOfferingService,
  ) {}

  async create(createEnrollmentDto: CreateEnrollmentDto): Promise<Enrollment> {
    await this.userService.findOne(createEnrollmentDto.userId);
    await this.courseOfferingService.findOne(createEnrollmentDto.courseOfferingId);
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
    if (updateEnrollmentDto.courseOfferingId) {
      await this.courseOfferingService.findOne(updateEnrollmentDto.courseOfferingId);
    }
    return await this.enrollmentRepository.update(id, updateEnrollmentDto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.enrollmentRepository.delete(id);
  }
}
