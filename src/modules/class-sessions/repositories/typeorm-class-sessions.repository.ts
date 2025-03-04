import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassSession } from '../entities/class-session.entity';
import { IClassSessionRepository } from '../interfaces/class-session.repository.interface';

export class TypeormClassSessionsRepository implements IClassSessionRepository {
  constructor(
    @InjectRepository(ClassSession)
    private readonly classSessionRepository: Repository<ClassSession>,
  ) {}

  async create(classSession: ClassSession): Promise<ClassSession> {
    return await this.classSessionRepository.save(classSession);
  }

  async findAll(): Promise<ClassSession[]> {
    return await this.classSessionRepository.find({
      relations: ['programCourse'],
    });
  }

  async findOne(id: string): Promise<ClassSession | null> {
    return await this.classSessionRepository.findOne({
      where: { id },
      relations: ['programCourse'],
    });
  }

  async update(id: string, classSession: Partial<ClassSession>): Promise<ClassSession | null> {
    await this.classSessionRepository.update(id, classSession);
    return await this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.classSessionRepository.delete(id);
  }
}
