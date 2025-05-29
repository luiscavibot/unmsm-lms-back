import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from '../entities/material.entity';
import { IMaterialRepository } from '../interfaces/material.repository.interface';
import { MaterialType } from '../enums/material-type.enum';
import { UserService } from 'src/modules/users/services/user.service';

@Injectable()
export class TypeormMaterialsRepository implements IMaterialRepository {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
    private readonly userService: UserService,
  ) {}

  async create(material: Material): Promise<Material> {
    return await this.materialRepository.save(material);
  }

  async findAll(): Promise<Material[]> {
    return await this.materialRepository.find({
      relations: ['week'],
    });
  }

  async findOne(id: string): Promise<Material | null> {
    return await this.materialRepository.findOne({
      where: { id },
      relations: ['week'],
    });
  }

  async findByWeekId(weekId: string): Promise<Material[]> {
    return await this.materialRepository.find({
      where: { weekId },
      relations: ['week'],
    });
  }

  async findByBlockId(blockId: string): Promise<any[]> {
    try {
      const query = this.materialRepository
        .createQueryBuilder('material')
        .innerJoin('material.week', 'week')
        .innerJoin('week.block', 'block')
        .where('block.id = :blockId', { blockId })
        .select([
          'week.id as weekId',
          'week.number as weekNumber',
          'material.id as materialId',
          'material.title as name',
          'material.type as materialType',
          'material.date as uploadDate',
          'material.uploadedById as uploadedById',
          'material.fileUrl as materialUrl',
        ])
        .orderBy('week.number', 'DESC')
        .addOrderBy('material.title', 'ASC');

      const materialsData = await query.getRawMany();

      // Procesar los datos para el formato de respuesta requerido
      const weekMap = new Map();

      for (const item of materialsData) {
        if (!weekMap.has(item.weekId)) {
          const weekName = `Semana ${item.weekNumber}`;
          weekMap.set(item.weekId, {
            id: item.weekId,
            week: weekName,
            weekNumber: item.weekNumber,
            materials: [],
          });
        }

        const week = weekMap.get(item.weekId);

        // Extraer el nombre del archivo de la URL
        let materialName = '';
        if (item.materialUrl) {
          const urlParts = item.materialUrl.split('/');
          materialName = urlParts[urlParts.length - 1];
        }

        // Formatear la fecha
        const uploadDate = item.uploadDate ? new Date(item.uploadDate).toISOString().split('T')[0] : '';

        const userName = await this.userService.findOne(item.uploadedById);

        week.materials.push({
          materialId: item.materialId,
          name: item.name,
          materialType: item.materialType,
          uploadDate: uploadDate,
          uploadedById: item.uploadedById,
          uploadedByName: userName.name,
          materialUrl: item.materialUrl,
          materialName: materialName,
        });
      }

      // Convertir el mapa a un array
      return Array.from(weekMap.values());
    } catch (error) {
      console.error('Error in findByBlockId:', error);
      throw error;
    }
  }

  async update(id: string, material: Partial<Material>): Promise<Material | null> {
    await this.materialRepository.update(id, material);
    return await this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.materialRepository.delete(id);
  }
}
