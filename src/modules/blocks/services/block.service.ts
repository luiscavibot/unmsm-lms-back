import { Inject, Injectable, NotFoundException, ForbiddenException, BadRequestException, forwardRef } from '@nestjs/common';
import { BlockRepository } from '../interfaces/block-repository.interface';
import { BLOCK_REPOSITORY } from '../tokens/index';
import { Block } from '../entities/block.entity';
import { CreateBlockDto } from '../dtos/create-block.dto';
import { UpdateBlockDto } from '../dtos/update-block.dto';
import { IStorageService } from '../../../common/storage/interfaces/storage.service.interface';
import { BlockAssignmentService } from '../../block-assignments/services/block-assignment.service';
import { BlockRolType } from '../../block-assignments/enums/block-rol-type.enum';
import { SyllabusAccessType, SyllabusPermissionResult } from '../dtos/syllabus-permission.dto';

@Injectable()
export class BlockService {
  constructor(
    @Inject(BLOCK_REPOSITORY)
    private readonly blockRepository: BlockRepository,
    @Inject(IStorageService) 
    private readonly storageService: IStorageService,
    @Inject(forwardRef(() => BlockAssignmentService))
    private readonly blockAssignmentService: BlockAssignmentService,
  ) {}

  async findAll(): Promise<Block[]> {
    return this.blockRepository.findAll();
  }

  async findById(id: string): Promise<Block> {
    const block = await this.blockRepository.findById(id);
    if (!block) {
      throw new NotFoundException(`Block with ID ${id} not found`);
    }
    return block;
  }

  async findByCourseOfferingId(courseOfferingId: string): Promise<Block[]> {
    return this.blockRepository.findByCourseOfferingId(courseOfferingId);
  }

  async create(createBlockDto: CreateBlockDto): Promise<Block> {
    return this.blockRepository.create(createBlockDto);
  }

  async update(id: string, updateBlockDto: UpdateBlockDto): Promise<Block> {
    const updatedBlock = await this.blockRepository.update(id, updateBlockDto);
    if (!updatedBlock) {
      throw new NotFoundException(`Block with ID ${id} not found`);
    }
    return updatedBlock;
  }

  async delete(id: string): Promise<void> {
    const block = await this.blockRepository.findById(id);
    if (!block) {
      throw new NotFoundException(`Block with ID ${id} not found`);
    }
    await this.blockRepository.delete(id);
  }

  async checkSyllabusPermissions(userId: string, rolName: string | null, blockId: string): Promise<SyllabusPermissionResult> {
    // 1. Validar que el usuario sea profesor
    if (rolName !== 'TEACHER') {
      return {
        hasPermission: false,
        accessType: SyllabusAccessType.NO_ACCESS,
        message: 'Solo los profesores pueden manipular el syllabus'
      };
    }

    // 2. Buscar el bloque y obtener su courseOfferingId
    const block = await this.findById(blockId);
    if (!block.courseOfferingId) {
      throw new BadRequestException('El bloque no tiene una oferta de curso asociada');
    }

    // 3. Buscar todas las asignaciones para este bloque
    const blockAssignments = await this.blockAssignmentService.findByBlockId(blockId);
    if (!blockAssignments || blockAssignments.length === 0) {
      return {
        hasPermission: false,
        accessType: SyllabusAccessType.NO_ACCESS,
        message: 'No hay asignaciones para este bloque'
      };
    }

    // 4. Buscar si el usuario actual está asignado a este bloque
    const userAssignment = blockAssignments.find(assignment => assignment.userId === userId);
    
    // 5. Si el usuario está asignado a este bloque, verificar su rol
    if (userAssignment) {
      return {
        hasPermission: true,
        accessType: SyllabusAccessType.OWNER,
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
        accessType: SyllabusAccessType.RESPONSIBLE,
        message: 'Usuario es responsable de la oferta de curso'
      };
    }

    // 7. Si no se cumple ninguna de las condiciones anteriores, no tiene permisos
    return {
      hasPermission: false,
      accessType: SyllabusAccessType.NO_ACCESS,
      message: 'Usuario no tiene permisos para manipular el syllabus de este bloque'
    };
  }

  async uploadSyllabus(id: string, file: Express.Multer.File, userId: string, rolName: string | null): Promise<Block> {
    // Verificar permisos
    const permissionResult = await this.checkSyllabusPermissions(userId, rolName, id);
    if (!permissionResult.hasPermission) {
      throw new ForbiddenException(permissionResult.message);
    }
    
    // Verificar que el bloque existe
    const block = await this.findById(id);
    
    // Si ya existe un syllabus previo, eliminarlo
    if (block.syllabusUrl) {
      try {
        await this.storageService.deleteFile(block.syllabusUrl);
      } catch (error) {
        console.log('Error eliminando syllabus antiguo, posiblemente no existe', error);
      }
    }
    
    // Construir la ruta para el syllabus
    const path = `syllabus/blocks/${id}`;
    const key = `${path}/${file.originalname}`;
    
    // Subir el archivo usando el servicio de almacenamiento
    const hashedKey = await this.storageService.uploadFile(
      file.buffer, 
      key, 
      file.mimetype
    );
    
    // Obtener la fecha actual en formato ISO
    const currentDate = new Date().toISOString();
    
    // Actualizar la URL del syllabus en el bloque y la fecha de actualización
    const updatedBlock = await this.blockRepository.update(id, { 
      syllabusUrl: hashedKey,
      syllabusUpdateDate: currentDate
    });
    if (!updatedBlock) {
      throw new NotFoundException(`Block with ID ${id} not found`);
    }
    
    return updatedBlock;
  }

  async deleteSyllabus(id: string, userId: string, rolName: string | null): Promise<Block> {
    // Verificar permisos
    const permissionResult = await this.checkSyllabusPermissions(userId, rolName, id);
    if (!permissionResult.hasPermission) {
      throw new ForbiddenException(permissionResult.message);
    }
    
    // Verificar que el bloque existe
    const block = await this.findById(id);
    
    // Verificar que el bloque tiene un syllabus
    if (!block.syllabusUrl) {
      throw new NotFoundException(`Syllabus for block with ID ${id} not found`);
    }
    
    // Eliminar el archivo del storage
    try {
      await this.storageService.deleteFile(block.syllabusUrl);
    } catch (error) {
      console.log('Error eliminando syllabus, posiblemente no existe', error);
    }
    
    // Actualizar el registro en la base de datos para eliminar la referencia y la fecha
    const updatedBlock = await this.blockRepository.update(id, { 
      syllabusUrl: '',
      syllabusUpdateDate: ''
    });
    if (!updatedBlock) {
      throw new NotFoundException(`Block with ID ${id} not found`);
    }
    
    return updatedBlock;
  }
}