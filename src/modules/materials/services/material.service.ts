import { Inject, Injectable, NotFoundException, Logger, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Material } from '../entities/material.entity';
import { IMaterialRepository } from '../interfaces/material.repository.interface';
import { CreateMaterialDto } from '../dtos/create-material.dto';
import { UpdateMaterialDto } from '../dtos/update-material.dto';
import { MATERIAL_REPOSITORY } from '../tokens';
import { WeekService } from '../../weeks/services/week.service';
import { BlockService } from '../../blocks/services/block.service';
import { WeekWithMaterialsDto } from '../dtos/response-material.dto';
import { UserService } from '../../users/services/user.service';
import { IStorageService } from '../../../common/storage/interfaces/storage.service.interface';
import { UploadMaterialDto } from '../dtos/upload-material.dto';
import { MaterialAccessType, MaterialPermissionResult } from '../dtos/material-permission.dto';
import { BlockRolType } from '../../block-assignments/enums/block-rol-type.enum';
import { BlockAssignmentService } from '../../block-assignments/services/block-assignment.service';
import { UpdateMaterialFileDto } from '../dtos/update-material-file.dto';
import { FilesService } from '../../files/services/files.service';
import { MaterialType } from '../enums/material-type.enum';

@Injectable()
export class MaterialService {
  private readonly logger = new Logger(MaterialService.name);
  private readonly MATERIALS_PATH_PREFIX = 'materials';
  private readonly TEACHER_ROLE = 'TEACHER';
  
  constructor(
    @Inject(MATERIAL_REPOSITORY)
    private readonly materialRepository: IMaterialRepository,
    private readonly weekService: WeekService,
    private readonly blockService: BlockService,
    private readonly userService: UserService,
    @Inject(IStorageService)
    private readonly storageService: IStorageService,
    private readonly blockAssignmentService: BlockAssignmentService,
    private readonly filesService: FilesService,
  ) {}

  async create(createMaterialDto: CreateMaterialDto): Promise<Material> {
    await this.weekService.findById(createMaterialDto.weekId);
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

  async findMaterialsByBlockId(blockId: string, userId?: string, rolName?: string | null): Promise<WeekWithMaterialsDto[]> {
    await this.blockService.findById(blockId);
    
    // Si es STUDENT, mantener la lógica actual (traer solo semanas con materiales)
    if (rolName === 'STUDENT') {
      const materials = await this.materialRepository.findByBlockId(blockId);
      // Ordenar por número de semana en orden descendente para estudiantes
      return materials.sort((a, b) => b.weekNumber - a.weekNumber);
    } 
    // Si es TEACHER, traer todas las semanas aunque no tengan materiales
    else if (rolName === 'TEACHER') {
      const weeks = await this.weekService.findByBlockId(blockId);
      const materialsData = await this.materialRepository.findByBlockId(blockId);
      
      // Crear un mapa con los datos de materiales existentes
      const materialsMap = new Map();
      materialsData.forEach(weekWithMaterials => {
        materialsMap.set(weekWithMaterials.id, weekWithMaterials);
      });
      
      // Incluir todas las semanas, tengan o no materiales
      const result: WeekWithMaterialsDto[] = [];
      weeks.forEach(week => {
        // Si ya tenemos esta semana con materiales, la usamos
        if (materialsMap.has(week.id)) {
          result.push(materialsMap.get(week.id));
        } else {
          // Si no tiene materiales, crear una entrada vacía para la semana
          result.push({
            id: week.id,
            week: `Semana ${week.number}`,
            weekNumber: week.number,
            materials: []
          });
        }
      });
      
      // Ordenar por número de semana en orden ASCENDENTE para profesores
      return result.sort((a, b) => a.weekNumber - b.weekNumber);
    } 
    // Para otros roles o sin rol, usar la lógica por defecto
    else {
      const materials = await this.materialRepository.findByBlockId(blockId);
      // Ordenar por defecto como si fuera estudiante
      return materials.sort((a, b) => b.weekNumber - a.weekNumber);
    }
  }

  async checkMaterialPermissions(userId: string, rolName: string | null, weekId: string): Promise<MaterialPermissionResult> {
    this.logger.log(`Verificando permisos para el usuario ${userId} con rol ${rolName} en la semana ${weekId}`);
    
    // 1. Validar que el usuario sea profesor
    if (rolName !== this.TEACHER_ROLE) {
      return {
        hasPermission: false,
        accessType: MaterialAccessType.NO_ACCESS,
        message: 'Solo los profesores pueden manipular los materiales'
      };
    }

    // 2. Buscar la semana y obtener su blockId
    const week = await this.weekService.findById(weekId);
    if (!week.blockId) {
      throw new BadRequestException('La semana no tiene un bloque asociado');
    }

    // 3. Buscar el bloque y obtener su courseOfferingId
    const block = await this.blockService.findById(week.blockId);
    if (!block.courseOfferingId) {
      throw new BadRequestException('El bloque no tiene una oferta de curso asociada');
    }

    // 4. Buscar todas las asignaciones para este bloque
    const blockAssignments = await this.blockAssignmentService.findByBlockId(week.blockId);
    if (!blockAssignments || blockAssignments.length === 0) {
      return {
        hasPermission: false,
        accessType: MaterialAccessType.NO_ACCESS,
        message: 'No hay asignaciones para este bloque'
      };
    }

    console.log('Block Assignments:', blockAssignments);

    // 5. Buscar si el usuario actual está asignado a este bloque
    const userAssignment = blockAssignments.find(assignment => assignment.userId === userId);

    console.log('User Assignment:', userAssignment);
    
    if (userAssignment) {
      return {
        hasPermission: true,
        accessType: MaterialAccessType.OWNER,
        message: 'Usuario es colaborador/responsable de este bloque'
      };
    }

    // 6. Si el usuario no está asignado directamente, verificar si es responsable
    // de otro bloque del mismo courseOffering
    const courseOfferingAssignments = 
      await this.blockAssignmentService.findByCourseOfferingId(block.courseOfferingId);
    
    const isResponsible = courseOfferingAssignments.some(
      assignment => assignment.userId === userId && assignment.blockRol === BlockRolType.RESPONSIBLE
    );

    if (isResponsible) {
      return {
        hasPermission: true,
        accessType: MaterialAccessType.RESPONSIBLE,
        message: 'Usuario es responsable de la oferta de curso'
      };
    }

    // 7. Si no se cumple ninguna de las condiciones anteriores, no tiene permisos
    return {
      hasPermission: false,
      accessType: MaterialAccessType.NO_ACCESS,
      message: 'Usuario no tiene permisos para manipular los materiales de este bloque'
    };
  }

  async uploadMaterial(
    uploadMaterialDto: UploadMaterialDto, 
    file: Express.Multer.File | undefined, 
    userId: string, 
    rolName: string | null
  ): Promise<Material> {
    this.logger.log(`Subiendo material para la semana ${uploadMaterialDto.weekId} por el usuario ${userId}`);
    
    // Verificar permisos
    const permissionResult = await this.checkMaterialPermissions(userId, rolName, uploadMaterialDto.weekId);
    if (!permissionResult.hasPermission) {
      throw new ForbiddenException(permissionResult.message);
    }

    // Verificar que la semana existe
    const week = await this.weekService.findById(uploadMaterialDto.weekId);
    
    // Validar que el tipo de material sea coherente con lo que se está subiendo
    if (uploadMaterialDto.url && uploadMaterialDto.type !== MaterialType.EXTERNAL_LINK) {
      throw new BadRequestException('Si se proporciona una URL, el tipo de material debe ser obligatoriamente enlace externo');
    }

    if (file && uploadMaterialDto.type === MaterialType.EXTERNAL_LINK) {
      throw new BadRequestException('No se puede subir un archivo para materiales de tipo enlace externo. Proporcione una URL en su lugar.');
    }
    
    try {
      let fileUrl = '';
      
      // Si es un enlace externo, usar directamente la URL
      if (uploadMaterialDto.type === MaterialType.EXTERNAL_LINK) {
        // Para enlaces externos, el campo fileUrl contiene directamente la URL
        fileUrl = uploadMaterialDto.url || '';
        
        if (!fileUrl) {
          throw new BadRequestException('La URL es requerida para materiales de tipo enlace externo');
        }
      } else {
        // Si no es un enlace externo, debe haber un archivo para subir
        if (!file) {
          throw new BadRequestException('El archivo es requerido para este tipo de material');
        }
        
        // Construir la ruta para el material
        const path = `${this.MATERIALS_PATH_PREFIX}/weeks/${uploadMaterialDto.weekId}`;
        
        // Subir el archivo usando el servicio de files
        const fileMetadata = await this.filesService.upload(file, userId, path);
        fileUrl = fileMetadata.hashedName;
      }
      
      // Crear el material en la base de datos
      const createMaterialDto: CreateMaterialDto = {
        weekId: uploadMaterialDto.weekId,
        title: uploadMaterialDto.title,
        type: uploadMaterialDto.type,
        fileUrl: fileUrl,
        uploadedById: userId
      };
      
      return await this.create(createMaterialDto);
    } catch (error) {
      this.logger.error(`Error al subir material para la semana ${uploadMaterialDto.weekId}: ${error.message}`);
      throw new BadRequestException(`Error al subir el material: ${error.message}`);
    }
  }

  async deleteFile(id: string, userId: string, rolName: string | null): Promise<void> {
    this.logger.log(`Eliminando archivo del material ${id} por el usuario ${userId}`);
    
    // Buscar el material
    const material = await this.findOne(id);
    
    // Verificar permisos
    const permissionResult = await this.checkMaterialPermissions(userId, rolName, material.weekId);
    if (!permissionResult.hasPermission) {
      throw new ForbiddenException(permissionResult.message);
    }
    
    // Verificar que el material tiene un archivo o URL
    if (!material.fileUrl) {
      throw new NotFoundException(`Archivo o URL para el material con ID ${id} no encontrado`);
    }
    
    try {
      // Si es un enlace externo, solo eliminar el registro en la base de datos
      if (material.type === MaterialType.EXTERNAL_LINK) {
        this.logger.log(`El material ${id} es un enlace externo, solo se eliminará el registro`);
      } else {
        // Es un archivo, eliminar de S3 y files
        // Buscar el archivo en la tabla files por su hashedName
        const fileMetadata = await this.filesService.findByHashedName(material.fileUrl);
        
        // Si se encuentra el archivo en la tabla files, usar filesService para eliminarlo
        if (fileMetadata) {
          await this.filesService.remove(fileMetadata.id);
        } else {
          // Como fallback, intentar eliminar directamente del storage si no se encuentra en files
          await this.storageService.deleteFile(material.fileUrl);
        }
      }
      
      // Eliminar el registro del material en la base de datos
      await this.remove(id);
    } catch (error) {
      this.logger.error(`Error al eliminar archivo del material ${id}: ${error.message}`);
      throw new BadRequestException(`Error al eliminar el archivo: ${error.message}`);
    }
  }

  async updateMaterialFile(
    id: string,
    updateMaterialFileDto: UpdateMaterialFileDto,
    file: Express.Multer.File | undefined,
    userId: string,
    rolName: string | null
  ): Promise<Material> {
    this.logger.log(`Actualizando material ${id} por el usuario ${userId}`);
    
    // Buscar el material existente
    const existingMaterial = await this.findOne(id);
    
    // Verificar permisos
    const permissionResult = await this.checkMaterialPermissions(userId, rolName, existingMaterial.weekId);
    if (!permissionResult.hasPermission) {
      throw new ForbiddenException(permissionResult.message);
    }
    
    // Preparar objeto para actualización
    const updateData: UpdateMaterialDto = {};
    
    // Actualizar título si se proporciona
    if (updateMaterialFileDto.title) {
      updateData.title = updateMaterialFileDto.title;
    }
    
    // Determinar el tipo de material (nuevo o existente)
    const newType = updateMaterialFileDto.type;
    const isNewTypeExternalLink = newType === 'external_link';
    const isExistingTypeExternalLink = existingMaterial.type === 'external_link';
    
    // Validar que el tipo de material sea coherente con lo que se está actualizando
    if (updateMaterialFileDto.url && newType && newType !== 'external_link') {
      throw new BadRequestException('Si se proporciona una URL, el tipo de material debe ser obligatoriamente enlace externo');
    }

    if (file && isNewTypeExternalLink) {
      throw new BadRequestException('No se puede subir un archivo para materiales de tipo enlace externo. Proporcione una URL en su lugar.');
    }
    
    if (newType) {
      updateData.type = newType;
    }
    
    // Manejar los diferentes tipos de material
    if (isNewTypeExternalLink || (isExistingTypeExternalLink && !newType)) {
      // Si es o sigue siendo un enlace externo
      if (updateMaterialFileDto.url) {
        updateData.fileUrl = updateMaterialFileDto.url;
        
        // Si anteriormente era un archivo (no external_link), eliminar el archivo existente
        if (!isExistingTypeExternalLink && existingMaterial.fileUrl) {
          try {
            const existingFileMetadata = await this.filesService.findByHashedName(existingMaterial.fileUrl);
            if (existingFileMetadata) {
              await this.filesService.remove(existingFileMetadata.id);
            } else {
              await this.storageService.deleteFile(existingMaterial.fileUrl);
            }
          } catch (error) {
            this.logger.warn(`No se pudo eliminar el archivo anterior al cambiar a enlace externo: ${error.message}`);
          }
        }
      } else if (isNewTypeExternalLink && !isExistingTypeExternalLink) {
        // Si se está cambiando a tipo external_link pero no se proporcionó una URL
        throw new BadRequestException('La URL es requerida para materiales de tipo enlace externo');
      }
    } else if (file) {
      // No es un enlace externo y se proporciona un archivo
      try {
        // Si ya existe un archivo físico (no external_link), eliminarlo primero
        if (existingMaterial.fileUrl && !isExistingTypeExternalLink) {
          try {
            // Buscar el archivo en la tabla files por su hashedName
            const existingFileMetadata = await this.filesService.findByHashedName(existingMaterial.fileUrl);
            
            // Si se encuentra el archivo en la tabla files, usar filesService para eliminarlo
            if (existingFileMetadata) {
              await this.filesService.remove(existingFileMetadata.id);
            } else {
              // Como fallback, intentar eliminar directamente del storage si no se encuentra en files
              await this.storageService.deleteFile(existingMaterial.fileUrl);
            }
          } catch (error) {
            this.logger.warn(`No se pudo eliminar el archivo anterior: ${error.message}`);
            // Continuamos con la actualización aunque no se pueda eliminar el archivo anterior
          }
        }
        
        // Construir la ruta para el material y subir utilizando FilesService
        const path = `${this.MATERIALS_PATH_PREFIX}/weeks/${existingMaterial.weekId}`;
        const fileMetadata = await this.filesService.upload(file, userId, path);
        
        // Actualizar la URL del archivo con el hashedName del archivo
        updateData.fileUrl = fileMetadata.hashedName;
      } catch (error) {
        this.logger.error(`Error al actualizar el archivo del material ${id}: ${error.message}`);
        throw new BadRequestException(`Error al actualizar el archivo: ${error.message}`);
      }
    } else if (newType && !isNewTypeExternalLink && isExistingTypeExternalLink) {
      // Si se está cambiando de external_link a otro tipo pero no se proporciona un archivo
      throw new BadRequestException('Se requiere un archivo para este tipo de material');
    }
    
    // Si no hay cambios, retornar el material existente
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No se proporcionaron datos para actualizar');
    }
    
    // Actualizar el material en la base de datos
    const updatedMaterial = await this.update(id, updateData);
    
    if (!updatedMaterial) {
      throw new BadRequestException(`No se pudo actualizar el material con ID ${id}`);
    }
    
    return updatedMaterial;
  }
}
