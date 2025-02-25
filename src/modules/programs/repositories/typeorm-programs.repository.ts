import { InjectRepository } from '@nestjs/typeorm';
import { Program } from '../entities/program.entity';
import { Repository } from 'typeorm';
import { IProgramRepository } from '../interfaces/program.repository.interface';

export class TypeormProgramsRepository implements IProgramRepository {
  constructor(
    @InjectRepository(Program)
    private readonly programRepository: Repository<Program>,
  ) {}

  async create(program: Partial<Program>): Promise<Program> {
    return await this.programRepository.save(program);
  }

  async findAll(): Promise<Program[]> {
    return await this.programRepository.find({
      relations: ['faculty'],
    });
  }

  async findOne(id: string): Promise<Program | null> {
    return await this.programRepository.findOne({
      where: { id },
      relations: ['faculty'],
    });
  }

  async update(id: string, program: Partial<Program>): Promise<Program | null> {
    await this.programRepository.update(id, program);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.programRepository.delete(id);
  }
}