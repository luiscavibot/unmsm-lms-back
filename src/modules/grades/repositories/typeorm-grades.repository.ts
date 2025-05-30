import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from '../entities/grade.entity';
import { IGradeRepository } from '../interfaces/grade.repository.interface';

@Injectable()
export class TypeormGradesRepository implements IGradeRepository {
  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
  ) {}

  async create(grade: Partial<Grade>): Promise<Grade> {
    const newGrade = this.gradeRepository.create(grade);
    return this.gradeRepository.save(newGrade);
  }

  async findAll(): Promise<Grade[]> {
    return this.gradeRepository.find({
      relations: ['evaluation', 'enrollment'],
    });
  }

  async findOne(id: string): Promise<Grade | null> {
    return this.gradeRepository.findOne({
      where: { id },
      relations: ['evaluation', 'enrollment'],
    });
  }

  async findByEvaluationId(evaluationId: string): Promise<Grade[]> {
    return this.gradeRepository.find({
      where: { evaluationId },
      relations: ['evaluation', 'enrollment'],
    });
  }

  async findByEnrollmentId(enrollmentId: string): Promise<Grade[]> {
    return this.gradeRepository.find({
      where: { enrollmentId },
      relations: ['evaluation', 'enrollment'],
    });
  }

  async findByEvaluationAndEnrollment(
    evaluationId: string,
    enrollmentId: string,
  ): Promise<Grade | null> {
    return this.gradeRepository.findOne({
      where: { evaluationId, enrollmentId },
      relations: ['evaluation', 'enrollment'],
    });
  }

  async update(id: string, grade: Partial<Grade>): Promise<Grade | null> {
    await this.gradeRepository.update(id, grade);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.gradeRepository.delete(id);
  }
}