import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
    private readonly config: ConfigService,
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
        .addOrderBy('material.date', 'DESC');

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

        // Extraer la extensión del archivo de la URL
        let fileExtension = '';
        if (item.materialUrl && item.materialType !== MaterialType.EXTERNAL_LINK) {
          // Si el URL contiene un punto, extraemos la extensión
          if (item.materialUrl.includes('.')) {
            const urlParts = item.materialUrl.split('.');
            fileExtension = urlParts[urlParts.length - 1];
          }
        }

        // Formatear la fecha
        const uploadDate = item.uploadDate ? new Date(item.uploadDate).toISOString().split('T')[0] : '';

        const userName = await this.userService.findOne(item.uploadedById);

        // Construir la URL del material según el tipo
        let materialUrl = item.materialUrl;
        if (item.materialType !== MaterialType.EXTERNAL_LINK && materialUrl) {
          const cdnUrl = this.config.get<string>('S3_CDN_URL') || this.config.get<string>('STORAGE_DOMAIN');
          materialUrl = `${cdnUrl}${materialUrl}`;
        }

        // Para cada semana, verificar si este es el primer material (el más reciente)
        // porque los resultados ya están ordenados por fecha desc
        const isFirstMaterialInWeek = week.materials.length === 0;
        
        // Calcular si el material es reciente (dentro de los últimos 7 días)
        const isRecent = item.uploadDate ? 
          (new Date().getTime() - new Date(item.uploadDate).getTime()) / (1000 * 60 * 60 * 24) <= 7 : 
          false;
        
        // Determinar las etiquetas según las condiciones
        const labels = (isFirstMaterialInWeek && isRecent) ? ['RECENT'] : [];

        week.materials.push({
          materialId: item.materialId,
          name: item.name,
          materialType: item.materialType,
          uploadDate: uploadDate,
          uploadedById: item.uploadedById,
          uploadedByName: userName.name,
          materialUrl: materialUrl,
          fileExtension: fileExtension,
          labels: labels,
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
