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

  async findOne(id: string): Promise<BlockAssignment> {
    const blockAssignment = await this.blockAssignmentRepository.findOne(id);
    if (!blockAssignment) {
      throw new NotFoundException(`Asignación de bloque con id ${id} no encontrada`);
    }
    return blockAssignment;
  }

  async findByUserId(userId: string): Promise<BlockAssignment[]> {
    // Verificar que el usuario existe
    await this.userService.findOne(userId);
    
    return await this.blockAssignmentRepository.findByUserId(userId);
  }

  async update(id: string, updateBlockAssignmentDto: UpdateBlockAssignmentDto): Promise<BlockAssignment | null> {
    await this.findOne(id);
    
    if (updateBlockAssignmentDto.userId) {
      // Verificar que el usuario existe
      await this.userService.findOne(updateBlockAssignmentDto.userId);
    }
    
    return this.blockAssignmentRepository.update(id, updateBlockAssignmentDto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    return this.blockAssignmentRepository.delete(id);
  }
}