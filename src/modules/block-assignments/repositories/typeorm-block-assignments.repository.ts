import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockAssignment } from '../entities/block-assignment.entity';
import { IBlockAssignmentRepository } from '../interfaces/block-assignment.repository.interface';

@Injectable()
export class TypeormBlockAssignmentsRepository implements IBlockAssignmentRepository {
  constructor(
    @InjectRepository(BlockAssignment)
    private readonly repository: Repository<BlockAssignment>,
  ) {}

  async create(blockAssignment: Partial<BlockAssignment>): Promise<BlockAssignment> {
    const newBlockAssignment = this.repository.create(blockAssignment);
    return await this.repository.save(newBlockAssignment);
  }

  async findAll(): Promise<BlockAssignment[]> {
    return await this.repository.find({
      relations: ['user'],
    });
  }

  async findOne(id: string): Promise<BlockAssignment | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findByUserId(userId: string): Promise<BlockAssignment[]> {
    return await this.repository.find({
      where: { userId },
      relations: ['user'],
    });
  }

  async update(id: string, blockAssignment: Partial<BlockAssignment>): Promise<BlockAssignment | null> {
    await this.repository.update(id, blockAssignment);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}