import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from '../entities/enrollment.entity';
import { IEnrollmentRepository } from '../interfaces/enrollment.repository.interface';

export class TypeormEnrollmentsRepository implements IEnrollmentRepository {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}

  async create(enrollment: Enrollment): Promise<Enrollment> {
    return await this.enrollmentRepository.save(enrollment);
  }

  async findAll(): Promise<Enrollment[]> {
    return await this.enrollmentRepository.find({
      relations: ['courseOffering'],
    });
  }

  async findOne(id: string): Promise<Enrollment | null> {
    return await this.enrollmentRepository.findOne({
      where: { id },
      relations: ['courseOffering'],
    });
  }

  async update(id: string, enrollment: Partial<Enrollment>): Promise<Enrollment | null> {
    await this.enrollmentRepository.update(id, enrollment);
    return await this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.enrollmentRepository.delete(id);
  }

  async findByUserIdAndBlockId(userId: string, blockId: string): Promise<Enrollment | null> {
    return await this.enrollmentRepository.createQueryBuilder('enrollment')
      .innerJoin('enrollment.courseOffering', 'courseOffering')
      .innerJoin('blocks', 'block', 'block.courseOfferingId = courseOffering.id AND block.id = :blockId', { blockId })
      .where('enrollment.userId = :userId', { userId })
      .getOne();
  }
}
