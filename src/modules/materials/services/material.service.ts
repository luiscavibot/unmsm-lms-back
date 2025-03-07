import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Material } from '../entities/material.entity';
import { IMaterialRepository } from '../interfaces/material.repository.interface';
import { CreateMaterialDto } from '../dtos/create-material.dto';
import { UpdateMaterialDto } from '../dtos/update-material.dto';
import { MATERIAL_REPOSITORY } from '../tokens';
import { EnrollmentService } from '../../enrollments/services/enrollment.service';
import { ClassSessionService } from '../../class-sessions/services/class-session.service';

@Injectable()
export class MaterialService {
  constructor(
    @Inject(MATERIAL_REPOSITORY)
    private readonly materialRepository: IMaterialRepository,
    private readonly enrollmentService: EnrollmentService,
    private readonly classSessionService: ClassSessionService,
  ) {}

  async create(createMaterialDto: CreateMaterialDto): Promise<Material> {
      await this.enrollmentService.findOne(createMaterialDto.enrollmentId);
      await this.classSessionService.findOne(createMaterialDto.classSessionId);
    return await this.materialRepository.create(createMaterialDto as Material);
  }

  async findAll(): Promise<Material[]> {
    return await this.materialRepository.findAll();
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
    if (updateMaterialDto.enrollmentId) {
      await this.enrollmentService.findOne(updateMaterialDto.enrollmentId);
    }
    if (updateMaterialDto.classSessionId) {
      await this.classSessionService.findOne(updateMaterialDto.classSessionId);
    }
    return await this.materialRepository.update(id, updateMaterialDto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.materialRepository.delete(id);
  }
}
