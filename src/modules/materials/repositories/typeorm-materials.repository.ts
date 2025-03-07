import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from '../entities/material.entity';
import { IMaterialRepository } from '../interfaces/material.repository.interface';

export class TypeormMaterialsRepository implements IMaterialRepository {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
  ) {}

  async create(material: Material): Promise<Material> {
    return await this.materialRepository.save(material);
  }

  async findAll(): Promise<Material[]> {
    return await this.materialRepository.find({
      relations: ['enrollment', 'classSession'],
    });
  }

  async findOne(id: string): Promise<Material | null> {
    return await this.materialRepository.findOne({
      where: { id },
      relations: ['enrollment', 'classSession'],
    });
  }

  async update(id: string, material: Partial<Material>): Promise<Material | null> {
    await this.materialRepository.update(id, material);
    return await this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.materialRepository.delete(id);
  }
}
