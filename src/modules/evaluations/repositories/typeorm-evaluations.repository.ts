import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluationRepository } from '../interfaces/evaluation-repository.interface';
import { Evaluation } from '../entities/evaluation.entity';

@Injectable()
export class TypeormEvaluationsRepository implements EvaluationRepository {
  constructor(
    @InjectRepository(Evaluation)
    private readonly evaluationRepository: Repository<Evaluation>,
  ) {}

  async findAll(): Promise<Evaluation[]> {
    return this.evaluationRepository.find({
      relations: ['block'],
    });
  }

  async findById(id: string): Promise<Evaluation | null> {
    return this.evaluationRepository.findOne({
      where: { id },
      relations: ['block'],
    });
  }

  async findByBlockId(blockId: string): Promise<Evaluation[]> {
    return this.evaluationRepository.find({
      where: { blockId },
      relations: ['block'],
    });
  }

  async create(evaluation: Partial<Evaluation>): Promise<Evaluation> {
    const newEvaluation = this.evaluationRepository.create(evaluation);
    return this.evaluationRepository.save(newEvaluation);
  }

  async update(id: string, evaluation: Partial<Evaluation>): Promise<Evaluation | null> {
    await this.evaluationRepository.update(id, evaluation);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.evaluationRepository.delete(id);
  }
}