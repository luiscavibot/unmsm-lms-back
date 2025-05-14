import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Material } from '../entities/material.entity';
import { IMaterialRepository } from '../interfaces/material.repository.interface';
import { CreateMaterialDto } from '../dtos/create-material.dto';
import { UpdateMaterialDto } from '../dtos/update-material.dto';
import { MATERIAL_REPOSITORY } from '../tokens';
import { EnrollmentService } from '../../enrollments/services/enrollment.service';
import { WeekService } from '../../weeks/services/week.service';

@Injectable()
export class MaterialService {
  constructor(
    @Inject(MATERIAL_REPOSITORY)
    private readonly materialRepository: IMaterialRepository,
    private readonly enrollmentService: EnrollmentService,
    private readonly weekService: WeekService,
  ) {}

  async create(createMaterialDto: CreateMaterialDto): Promise<Material> {
      await this.enrollmentService.findOne(createMaterialDto.enrollmentId);
      await this.weekService.findById(createMaterialDto.weekId);
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
    if (updateMaterialDto.enrollmentId) {
      await this.enrollmentService.findOne(updateMaterialDto.enrollmentId);
    }
    if (updateMaterialDto.weekId) {
      await this.weekService.findById(updateMaterialDto.weekId);
    }
    return await this.materialRepository.update(id, updateMaterialDto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.materialRepository.delete(id);
  }
}
