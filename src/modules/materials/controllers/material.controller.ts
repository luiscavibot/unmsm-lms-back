import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { MaterialService } from '../services/material.service';
import { CreateMaterialDto } from '../dtos/create-material.dto';
import { UpdateMaterialDto } from '../dtos/update-material.dto';
import { Material } from '../entities/material.entity';
import { WeekWithMaterialsDto } from '../dtos/response-material.dto';
import { UploadMaterialDto } from '../dtos/upload-material.dto';
import { UpdateMaterialFileDto } from '../dtos/update-material-file.dto';
import { CurrentUserToken } from '../../../common/auth/decorators/current-user.decorator';
import { UserPayload } from '../../../common/auth/interfaces';
import { JwtAuthGuard } from '../../../common/auth/guards/jwt-auth.guard';
import { MaterialType } from '../enums/material-type.enum';

@Controller('materials')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un material' })
  async create(@Body() createMaterialDto: CreateMaterialDto): Promise<Material> {
    return await this.materialService.create(createMaterialDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los materiales o filtrar por weekId' })
  async findAll(@Query('weekId') weekId?: string): Promise<Material[]> {
    if (weekId) {
      return await this.materialService.findByWeekId(weekId);
    }
    return await this.materialService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un material por ID' })
  async findOne(@Param('id') id: string): Promise<Material> {
    return await this.materialService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un material' })
  async update(
    @Param('id') id: string,
    @Body() updateMaterialDto: UpdateMaterialDto,
  ): Promise<Material | null> {
    return await this.materialService.update(id, updateMaterialDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un material' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.materialService.remove(id);
  }

  @Get('block/:blockId')
  @ApiOperation({ summary: 'Obtener todos los materiales agrupados por semana para un bloque específico' })
  @ApiParam({ name: 'blockId', description: 'ID del bloque' })
  @ApiResponse({
    status: 200,
    description: 'Lista de materiales agrupados por semana para el bloque',
    type: [WeekWithMaterialsDto]
  })
  async findByBlockId(@Param('blockId') blockId: string): Promise<WeekWithMaterialsDto[]> {
    return await this.materialService.findMaterialsByBlockId(blockId);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir un archivo de material' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo del material para subir',
    type: UploadMaterialDto,
  })
  async uploadMaterial(
    @Body() uploadDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUserToken() user: UserPayload
  ): Promise<Material> {
    // Validar que si es tipo external_link tenga una URL
    if (uploadDto.type === MaterialType.EXTERNAL_LINK && !uploadDto.url) {
      throw new BadRequestException('La URL es requerida para materiales de tipo enlace externo');
    }
    
    // Validar que si no es external_link se haya proporcionado un archivo
    if (uploadDto.type !== MaterialType.EXTERNAL_LINK && !file) {
      throw new BadRequestException('El archivo es requerido para este tipo de material');
    }
    
    const uploadMaterialDto: UploadMaterialDto = {
      weekId: uploadDto.weekId,
      title: uploadDto.title,
      type: uploadDto.type,
      url: uploadDto.url
    };
    
    return this.materialService.uploadMaterial(uploadMaterialDto, file, user.userId, user.rolName);
  }

  @Delete('file/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Eliminar el archivo de un material' })
  @ApiResponse({
    status: 200,
    description: 'Archivo del material eliminado correctamente',
    type: Material
  })
  async deleteFile(
    @Param('id') id: string,
    @CurrentUserToken() user: UserPayload
  ): Promise<void> {
    return this.materialService.deleteFile(id, user.userId, user.rolName);
  }

  @Patch('file/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Actualizar un material y/o su archivo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Datos y/o archivo del material para actualizar',
    type: UpdateMaterialFileDto,
  })
  async updateMaterialFile(
    @Param('id') id: string,
    @Body() updateDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUserToken() user: UserPayload
  ): Promise<Material> {
    const updateMaterialFileDto: UpdateMaterialFileDto = {
      title: updateDto.title,
      type: updateDto.type,
      url: updateDto.url // Capturar la URL para los enlaces externos
    };
    return this.materialService.updateMaterialFile(id, updateMaterialFileDto, file, user.userId, user.rolName);
  }
}
