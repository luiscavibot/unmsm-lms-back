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
      relations: ['block', 'courseOffering'],
    });
  }

  async findByCompositeId(userId: string, blockId: string, courseOfferingId: string): Promise<BlockAssignment | null> {
    return await this.repository.findOne({
      where: { userId, blockId, courseOfferingId },
      relations: ['block', 'courseOffering'],
    });
  }

  async findByUserId(userId: string): Promise<BlockAssignment[]> {
    return await this.repository.find({
      where: { userId },
      relations: ['block', 'courseOffering'],
    });
  }

  async findByBlockId(blockId: string): Promise<BlockAssignment[]> {
    return await this.repository.find({
      where: { blockId },
      relations: ['block', 'courseOffering'],
    });
  }

  async findByCourseOfferingId(courseOfferingId: string): Promise<BlockAssignment[]> {
    return await this.repository.find({
      where: { courseOfferingId },
      relations: ['block', 'courseOffering'],
    });
  }

  async update(userId: string, blockId: string, courseOfferingId: string, blockAssignment: Partial<BlockAssignment>): Promise<BlockAssignment | null> {
    await this.repository.update(
      { userId, blockId, courseOfferingId },
      blockAssignment
    );
    return this.findByCompositeId(userId, blockId, courseOfferingId);
  }

  async delete(userId: string, blockId: string, courseOfferingId: string): Promise<void> {
    await this.repository.delete({ userId, blockId, courseOfferingId });
  }
}