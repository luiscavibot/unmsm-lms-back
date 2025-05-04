import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseOffering } from '../entities/course-offering.entity';
import { ICourseOfferingRepository } from '../interfaces/course-offering.repository.interface';

export class TypeormCourseOfferingsRepository implements ICourseOfferingRepository {
  constructor(
    @InjectRepository(CourseOffering)
    private readonly courseOfferingRepository: Repository<CourseOffering>,
  ) {}

  async create(courseOffering: CourseOffering): Promise<CourseOffering> {
    return await this.courseOfferingRepository.save(courseOffering);
  }

  async findAll(): Promise<CourseOffering[]> {
    return await this.courseOfferingRepository.find({
      relations: ['program', 'course'],
    });
  }

  async findOne(id: string): Promise<CourseOffering | null> {
    return await this.courseOfferingRepository.findOne({
      where: { id },
      relations: ['program', 'course'],
    });
  }

  async update(id: string, courseOffering: Partial<CourseOffering>): Promise<CourseOffering | null> {
    await this.courseOfferingRepository.update(id, courseOffering);
    return await this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.courseOfferingRepository.delete(id);
  }
}