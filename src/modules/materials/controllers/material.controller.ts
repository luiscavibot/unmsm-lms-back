import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { MaterialService } from '../services/material.service';
import { CreateMaterialDto } from '../dtos/create-material.dto';
import { UpdateMaterialDto } from '../dtos/update-material.dto';
import { Material } from '../entities/material.entity';
import { WeekWithMaterialsDto } from '../dtos/response-material.dto';

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
}
