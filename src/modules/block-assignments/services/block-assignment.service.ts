import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { BlockAssignment } from '../entities/block-assignment.entity';
import { CreateBlockAssignmentDto } from '../dtos/create-block-assignment.dto';
import { UpdateBlockAssignmentDto } from '../dtos/update-block-assignment.dto';
import { BLOCK_ASSIGNMENT_REPOSITORY } from '../tokens';
import { IBlockAssignmentRepository } from '../interfaces/block-assignment.repository.interface';
import { UserService } from '../../users/services/user.service';
import { TeacherRoleResponseDto } from '../dtos/teacher-role-response.dto';
import { BlockRolType } from '../enums/block-rol-type.enum';

@Injectable()
export class BlockAssignmentService {
  constructor(
    @Inject(BLOCK_ASSIGNMENT_REPOSITORY)
    private readonly blockAssignmentRepository: IBlockAssignmentRepository,
    private readonly userService: UserService,
  ) {}

  async create(createBlockAssignmentDto: CreateBlockAssignmentDto): Promise<BlockAssignment> {
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
      await this.userService.findOne(updateBlockAssignmentDto.userId);
    }
    
    return this.blockAssignmentRepository.update(userId, blockId, courseOfferingId, updateBlockAssignmentDto);
  }

  async remove(userId: string, blockId: string, courseOfferingId: string): Promise<void> {
    await this.findByCompositeId(userId, blockId, courseOfferingId);
    return this.blockAssignmentRepository.delete(userId, blockId, courseOfferingId);
  }

  async checkTeacherRole(userId: string, courseOfferingId: string, rolName: string | null): Promise<TeacherRoleResponseDto> {
    if (rolName !== 'TEACHER') {
      throw new ForbiddenException('Solo los profesores pueden consultar su rol en un curso');
    }

    // Obtener todas las asignaciones para esta oferta de curso
    const assignments = await this.blockAssignmentRepository.findByCourseOfferingId(courseOfferingId);
    
    // Buscar si el usuario tiene alguna asignación para esta oferta de curso
    const userAssignment = assignments.find(assignment => assignment.userId === userId);
    
    if (!userAssignment) {
      return {
        isAssigned: false,
        blockRol: null,
        message: 'El profesor no está asignado a este curso'
      };
    }
    
    // Retornar el rol del profesor en el curso
    return {
      isAssigned: true,
      blockRol: userAssignment.blockRol,
      message: userAssignment.blockRol === BlockRolType.RESPONSIBLE 
        ? 'El profesor es responsable de este curso' 
        : 'El profesor es colaborador de este curso'
    };
  }
}