import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Week } from '../entities/week.entity';
import { IWeekRepository } from '../interfaces/week.repository.interface';

@Injectable()
export class TypeormWeeksRepository implements IWeekRepository {
  constructor(
    @InjectRepository(Week)
    private readonly weekRepository: Repository<Week>,
  ) {}

  async findAll(): Promise<Week[]> {
    return this.weekRepository.find({
      relations: ['block'],
    });
  }

  async findById(id: string): Promise<Week | null> {
    return this.weekRepository.findOne({
      where: { id },
      relations: ['block'],
    });
  }

  async findByBlockId(blockId: string): Promise<Week[]> {
    return this.weekRepository.find({
      where: { blockId },
      relations: ['block'],
    });
  }

  async create(week: Week): Promise<Week> {
    const newWeek = this.weekRepository.create(week);
    return this.weekRepository.save(newWeek);
  }

  async update(id: string, week: Partial<Week>): Promise<Week | null> {
    await this.weekRepository.update(id, week);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.weekRepository.delete(id);
  }
}
