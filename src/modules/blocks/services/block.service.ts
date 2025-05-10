import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BlockRepository } from '../interfaces/block-repository.interface';
import { BLOCK_REPOSITORY } from '../tokens/index';
import { Block } from '../entities/block.entity';
import { CreateBlockDto } from '../dtos/create-block.dto';
import { UpdateBlockDto } from '../dtos/update-block.dto';

@Injectable()
export class BlockService {
  constructor(
    @Inject(BLOCK_REPOSITORY)
    private readonly blockRepository: BlockRepository,
  ) {}

  async findAll(): Promise<Block[]> {
    return this.blockRepository.findAll();
  }

  async findById(id: string): Promise<Block> {
    const block = await this.blockRepository.findById(id);
    if (!block) {
      throw new NotFoundException(`Block with ID ${id} not found`);
    }
    return block;
  }

  async findByCourseOfferingId(courseOfferingId: string): Promise<Block[]> {
    return this.blockRepository.findByCourseOfferingId(courseOfferingId);
  }

  async create(createBlockDto: CreateBlockDto): Promise<Block> {
    return this.blockRepository.create(createBlockDto);
  }

  async update(id: string, updateBlockDto: UpdateBlockDto): Promise<Block> {
    const updatedBlock = await this.blockRepository.update(id, updateBlockDto);
    if (!updatedBlock) {
      throw new NotFoundException(`Block with ID ${id} not found`);
    }
    return updatedBlock;
  }

  async delete(id: string): Promise<void> {
    const block = await this.blockRepository.findById(id);
    if (!block) {
      throw new NotFoundException(`Block with ID ${id} not found`);
    }
    await this.blockRepository.delete(id);
  }
}