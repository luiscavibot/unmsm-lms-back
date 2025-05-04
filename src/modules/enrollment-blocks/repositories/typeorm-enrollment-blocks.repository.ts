import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnrollmentBlock } from '../entities/enrollment-block.entity';
import { IEnrollmentBlockRepository } from '../interfaces/enrollment-block.repository.interface';

@Injectable()
export class TypeormEnrollmentBlocksRepository implements IEnrollmentBlockRepository {
  constructor(
    @InjectRepository(EnrollmentBlock)
    private readonly enrollmentBlockRepository: Repository<EnrollmentBlock>,
  ) {}

  async create(enrollmentBlock: EnrollmentBlock): Promise<EnrollmentBlock> {
    return await this.enrollmentBlockRepository.save(enrollmentBlock);
  }

  async findAll(): Promise<EnrollmentBlock[]> {
    return await this.enrollmentBlockRepository.find({
      relations: ['enrollment', 'block'],
    });
  }

  async findOne(enrollmentId: string, blockId: string): Promise<EnrollmentBlock | null> {
    return await this.enrollmentBlockRepository.findOne({
      where: { enrollmentId, blockId },
      relations: ['enrollment', 'block'],
    });
  }

  async findByEnrollmentId(enrollmentId: string): Promise<EnrollmentBlock[]> {
    return await this.enrollmentBlockRepository.find({
      where: { enrollmentId },
      relations: ['enrollment', 'block'],
    });
  }

  async findByBlockId(blockId: string): Promise<EnrollmentBlock[]> {
    return await this.enrollmentBlockRepository.find({
      where: { blockId },
      relations: ['enrollment', 'block'],
    });
  }

  async update(
    enrollmentId: string,
    blockId: string,
    enrollmentBlock: Partial<EnrollmentBlock>,
  ): Promise<EnrollmentBlock | null> {
    await this.enrollmentBlockRepository.update(
      { enrollmentId, blockId },
      enrollmentBlock,
    );
    return await this.findOne(enrollmentId, blockId);
  }

  async delete(enrollmentId: string, blockId: string): Promise<void> {
    await this.enrollmentBlockRepository.delete({ enrollmentId, blockId });
  }
}