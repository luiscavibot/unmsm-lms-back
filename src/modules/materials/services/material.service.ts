import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Material } from '../entities/material.entity';
import { IMaterialRepository } from '../interfaces/material.repository.interface';
import { CreateMaterialDto } from '../dtos/create-material.dto';
import { UpdateMaterialDto } from '../dtos/update-material.dto';
import { MATERIAL_REPOSITORY } from '../tokens';
import { WeekService } from '../../weeks/services/week.service';
import { BlockService } from '../../blocks/services/block.service';
import { WeekWithMaterialsDto } from '../dtos/response-material.dto';
import { UserService } from '../../users/services/user.service';

@Injectable()
export class MaterialService {
  constructor(
    @Inject(MATERIAL_REPOSITORY)
    private readonly materialRepository: IMaterialRepository,
    private readonly weekService: WeekService,
    private readonly blockService: BlockService,
    private readonly userService: UserService,
  ) {}

  async create(createMaterialDto: CreateMaterialDto): Promise<Material> {
    await this.weekService.findById(createMaterialDto.weekId);
    
    // Verificar el usuario si se proporciona un ID
    if (createMaterialDto.uploadedById) {
      await this.userService.findOne(createMaterialDto.uploadedById);
    }
    
    return await this.materialRepository.create(createMaterialDto as Material);
  }

  async findAll(): Promise<Material[]> {
    return await this.materialRepository.findAll();
  }

  async findByWeekId(weekId: string): Promise<Material[]> {
    await this.weekService.findById(weekId);
    return await this.materialRepository.findByWeekId(weekId);
  }

  async findOne(id: string): Promise<Material> {
    const material = await this.materialRepository.findOne(id);
    if (!material) {
      throw new NotFoundException(`Material with ID ${id} not found`);
    }
    return material;
  }

  async update(id: string, updateMaterialDto: UpdateMaterialDto): Promise<Material | null> {
    await this.findOne(id);
    
    if (updateMaterialDto.weekId) {
      await this.weekService.findById(updateMaterialDto.weekId);
    }
    
    if (updateMaterialDto.uploadedById) {
      await this.userService.findOne(updateMaterialDto.uploadedById);
    }
    
    return await this.materialRepository.update(id, updateMaterialDto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.materialRepository.delete(id);
  }

  async findMaterialsByBlockId(blockId: string): Promise<WeekWithMaterialsDto[]> {
    await this.blockService.findById(blockId);
    return await this.materialRepository.findByBlockId(blockId);
  }
}
