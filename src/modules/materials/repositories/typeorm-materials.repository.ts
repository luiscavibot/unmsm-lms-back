import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from '../entities/material.entity';
import { IMaterialRepository } from '../interfaces/material.repository.interface';
import { MaterialType } from '../enums/material-type.enum';

@Injectable()
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
      relations: ['week', 'uploadedBy'],
    });
  }

  async findOne(id: string): Promise<Material | null> {
    return await this.materialRepository.findOne({
      where: { id },
      relations: ['week', 'uploadedBy'],
    });
  }

  async findByWeekId(weekId: string): Promise<Material[]> {
    return await this.materialRepository.find({
      where: { weekId },
      relations: ['week', 'uploadedBy'],
    });
  }

  async findByBlockId(blockId: string): Promise<any[]> {
    const query = this.materialRepository.createQueryBuilder('material')
      .innerJoin('material.week', 'week')
      .innerJoin('week.block', 'block')
      .leftJoin('material.uploadedBy', 'user')
      .where('block.id = :blockId', { blockId })
      .select([
        'week.id as weekId',
        'week.name as weekName',
        'material.id as materialId',
        'material.title as name',
        'material.type as materialType',
        'material.date as uploadDate',
        'material.uploadedById as uploadedById',
        'user.firstName as userFirstName',
        'user.lastName as userLastName',
        'material.fileUrl as materialUrl'
      ])
      .orderBy('week.name', 'ASC')
      .addOrderBy('material.title', 'ASC');

    const materialsData = await query.getRawMany();
    
    // Procesar los datos para el formato de respuesta requerido
    const weekMap = new Map();
    
    for (const item of materialsData) {
      if (!weekMap.has(item.weekId)) {
        weekMap.set(item.weekId, {
          id: item.weekId,
          week: item.weekName,
          materials: []
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
      
      week.materials.push({
        materialId: item.materialId,
        name: item.name,
        materialType: item.materialType,
        uploadDate: uploadDate,
        uploadedById: item.uploadedById,
        uploadedByName: item.userFirstName && item.userLastName 
          ? `${item.userFirstName} ${item.userLastName}` 
          : '',
        materialUrl: item.materialUrl,
        materialName: materialName
      });
    }
    
    // Convertir el mapa a un array
    return Array.from(weekMap.values());
  }

  async update(id: string, material: Partial<Material>): Promise<Material | null> {
    await this.materialRepository.update(id, material);
    return await this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.materialRepository.delete(id);
  }
}
