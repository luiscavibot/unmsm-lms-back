import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockRepository } from '../interfaces/block-repository.interface';
import { Block } from '../entities/block.entity';

@Injectable()
export class TypeormBlocksRepository implements BlockRepository {
  constructor(
    @InjectRepository(Block)
    private readonly blockRepository: Repository<Block>,
  ) {}

  async findAll(): Promise<Block[]> {
    return this.blockRepository.find({
      relations: ['courseOffering', 'blockAssignment'],
    });
  }

  async findById(id: string): Promise<Block | null> {
    return this.blockRepository.findOne({
      where: { id },
      relations: ['courseOffering', 'blockAssignment'],
    });
  }

  async findByCourseOfferingId(courseOfferingId: string): Promise<Block[]> {
    return this.blockRepository.find({
      where: { courseOfferingId },
      relations: ['courseOffering', 'blockAssignment'],
    });
  }

  async findByBlockAssignmentId(blockAssignmentId: string): Promise<Block[]> {
    return this.blockRepository.find({
      where: { blockAssignmentId },
      relations: ['courseOffering', 'blockAssignment'],
    });
  }

  async create(block: Partial<Block>): Promise<Block> {
    const newBlock = this.blockRepository.create(block);
    return this.blockRepository.save(newBlock);
  }

  async update(id: string, block: Partial<Block>): Promise<Block | null> {
    await this.blockRepository.update(id, block);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.blockRepository.delete(id);
  }
}