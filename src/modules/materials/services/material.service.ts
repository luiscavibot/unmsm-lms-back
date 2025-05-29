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

  async findMaterialsByBlockId(blockId: string): Promise<WeekWithMaterialsDto[]> {
    await this.blockService.findById(blockId);
    return await this.materialRepository.findByBlockId(blockId);
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
    file: Express.Multer.File, 
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
    
    // Sanitizar el nombre del archivo para seguridad
    const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    // Construir la ruta para el material
    const path = `${this.MATERIALS_PATH_PREFIX}/weeks/${uploadMaterialDto.weekId}`;
    const key = `${path}/${sanitizedFileName}`;
    
    try {
      // Subir el archivo usando el servicio de almacenamiento
      const fileUrl = await this.storageService.uploadFile(
        file.buffer, 
        key, 
        file.mimetype
      );
      
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
    
    // Verificar que el material tiene un archivo
    if (!material.fileUrl) {
      throw new NotFoundException(`Archivo para el material con ID ${id} no encontrado`);
    }
    
    try {
      // Eliminar el archivo del storage
      await this.storageService.deleteFile(material.fileUrl);
      
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
    
    // Actualizar tipo si se proporciona
    if (updateMaterialFileDto.type) {
      updateData.type = updateMaterialFileDto.type;
    }
    
    // Si se proporciona un nuevo archivo, subirlo y actualizar la URL
    if (file) {
      try {
        // Sanitizar el nombre del archivo para seguridad
        const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        
        // Construir la ruta para el material
        const path = `${this.MATERIALS_PATH_PREFIX}/weeks/${existingMaterial.weekId}`;
        const key = `${path}/${sanitizedFileName}`;
        
        // Si ya existe un archivo, eliminarlo primero
        if (existingMaterial.fileUrl) {
          try {
            await this.storageService.deleteFile(existingMaterial.fileUrl);
          } catch (error) {
            this.logger.warn(`No se pudo eliminar el archivo anterior: ${error.message}`);
            // Continuamos con la actualización aunque no se pueda eliminar el archivo anterior
          }
        }
        
        // Subir el nuevo archivo
        const fileUrl = await this.storageService.uploadFile(
          file.buffer, 
          key, 
          file.mimetype
        );
        
        // Actualizar la URL del archivo
        updateData.fileUrl = fileUrl;
      } catch (error) {
        this.logger.error(`Error al actualizar el archivo del material ${id}: ${error.message}`);
        throw new BadRequestException(`Error al actualizar el archivo: ${error.message}`);
      }
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
