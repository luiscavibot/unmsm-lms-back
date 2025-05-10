import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BlockAssignment } from '../entities/block-assignment.entity';
import { CreateBlockAssignmentDto } from '../dtos/create-block-assignment.dto';
import { UpdateBlockAssignmentDto } from '../dtos/update-block-assignment.dto';
import { BLOCK_ASSIGNMENT_REPOSITORY } from '../tokens';
import { IBlockAssignmentRepository } from '../interfaces/block-assignment.repository.interface';
import { UserService } from '../../users/services/user.service';

@Injectable()
export class BlockAssignmentService {
  constructor(
    @Inject(BLOCK_ASSIGNMENT_REPOSITORY)
    private readonly blockAssignmentRepository: IBlockAssignmentRepository,
    private readonly userService: UserService,
  ) {}

  async create(createBlockAssignmentDto: CreateBlockAssignmentDto): Promise<BlockAssignment> {
    // Verificar que el usuario existe
    await this.userService.findOne(createBlockAssignmentDto.userId);
    
    return await this.blockAssignmentRepository.create(createBlockAssignmentDto);
  }

  async findAll(): Promise<BlockAssignment[]> {
    return await this.blockAssignmentRepository.findAll();
  }

  async findByCompositeId(userId: string, blockId: string, courseOfferingId: string): Promise<BlockAssignment> {
    const blockAssignment = await this.blockAssignmentRepository.findByCompositeId(userId, blockId, courseOfferingId);
    if (!blockAssignment) {
      throw new NotFoundException(`Asignación de bloque no encontrada`);
    }
    return blockAssignment;
  }

  async findByUserId(userId: string): Promise<BlockAssignment[]> {
    // Verificar que el usuario existe
    await this.userService.findOne(userId);
    
    return await this.blockAssignmentRepository.findByUserId(userId);
  }

  async findByBlockId(blockId: string): Promise<BlockAssignment[]> {
    return await this.blockAssignmentRepository.findByBlockId(blockId);
  }

  async findByCourseOfferingId(courseOfferingId: string): Promise<BlockAssignment[]> {
    return await this.blockAssignmentRepository.findByCourseOfferingId(courseOfferingId);
  }

  async update(userId: string, blockId: string, courseOfferingId: string, updateBlockAssignmentDto: UpdateBlockAssignmentDto): Promise<BlockAssignment | null> {
    await this.findByCompositeId(userId, blockId, courseOfferingId);
    
    if (updateBlockAssignmentDto.userId) {
      // Verificar que el usuario existe
      await this.userService.findOne(updateBlockAssignmentDto.userId);
    }
    
    return this.blockAssignmentRepository.update(userId, blockId, courseOfferingId, updateBlockAssignmentDto);
  }

  async remove(userId: string, blockId: string, courseOfferingId: string): Promise<void> {
    await this.findByCompositeId(userId, blockId, courseOfferingId);
    return this.blockAssignmentRepository.delete(userId, blockId, courseOfferingId);
  }
}