import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EnrollmentBlock } from '../entities/enrollment-block.entity';
import { IEnrollmentBlockRepository } from '../interfaces/enrollment-block.repository.interface';
import { CreateEnrollmentBlockDto } from '../dtos/create-enrollment-block.dto';
import { UpdateEnrollmentBlockDto } from '../dtos/update-enrollment-block.dto';
import { ENROLLMENT_BLOCK_REPOSITORY } from '../tokens';
import { BlockService } from 'src/modules/blocks/services/block.service';
import { EnrollmentService } from 'src/modules/enrollments/services/enrollment.service';

@Injectable()
export class EnrollmentBlockService {
  constructor(
    @Inject(ENROLLMENT_BLOCK_REPOSITORY)
    private readonly enrollmentBlockRepository: IEnrollmentBlockRepository,
    private readonly enrollmentService: EnrollmentService,
    private readonly blockService: BlockService,
  ) {}

  async create(createEnrollmentBlockDto: CreateEnrollmentBlockDto): Promise<EnrollmentBlock> {
    // Verificar que la inscripción existe
    await this.enrollmentService.findOne(createEnrollmentBlockDto.enrollmentId);
    
    // Verificar que el bloque existe
    await this.blockService.findById(createEnrollmentBlockDto.blockId);
    
    // Verificar si ya existe esta relación
    const existingEnrollmentBlock = await this.enrollmentBlockRepository.findOne(
      createEnrollmentBlockDto.enrollmentId,
      createEnrollmentBlockDto.blockId,
    );
    
    if (existingEnrollmentBlock) {
      throw new Error(`Ya existe una relación entre la inscripción ${createEnrollmentBlockDto.enrollmentId} y el bloque ${createEnrollmentBlockDto.blockId}`);
    }
    
    return await this.enrollmentBlockRepository.create(createEnrollmentBlockDto as EnrollmentBlock);
  }

  async findAll(): Promise<EnrollmentBlock[]> {
    return await this.enrollmentBlockRepository.findAll();
  }

  async findOne(enrollmentId: string, blockId: string): Promise<EnrollmentBlock> {
    const enrollmentBlock = await this.enrollmentBlockRepository.findOne(enrollmentId, blockId);
    if (!enrollmentBlock) {
      throw new NotFoundException(`EnrollmentBlock con enrollmentId: ${enrollmentId} y blockId: ${blockId} no encontrado`);
    }
    return enrollmentBlock;
  }

  async findByEnrollmentId(enrollmentId: string): Promise<EnrollmentBlock[]> {
    // Verificar que la inscripción existe
    await this.enrollmentService.findOne(enrollmentId);
    
    return await this.enrollmentBlockRepository.findByEnrollmentId(enrollmentId);
  }

  async findByBlockId(blockId: string): Promise<EnrollmentBlock[]> {
    // Verificar que el bloque existe
    await this.blockService.findById(blockId);
    
    return await this.enrollmentBlockRepository.findByBlockId(blockId);
  }

  async update(
    enrollmentId: string,
    blockId: string,
    updateEnrollmentBlockDto: UpdateEnrollmentBlockDto,
  ): Promise<EnrollmentBlock | null> {
    await this.findOne(enrollmentId, blockId);
    
    return await this.enrollmentBlockRepository.update(
      enrollmentId,
      blockId,
      updateEnrollmentBlockDto,
    );
  }

  async remove(enrollmentId: string, blockId: string): Promise<void> {
    await this.findOne(enrollmentId, blockId);
    await this.enrollmentBlockRepository.delete(enrollmentId, blockId);
  }
}