import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { MaterialService } from '../services/material.service';
import { CreateMaterialDto } from '../dtos/create-material.dto';
import { UpdateMaterialDto } from '../dtos/update-material.dto';
import { Material } from '../entities/material.entity';

@Controller('materials')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Post()
  @ApiOperation({ summary: 'Create a material' })
  async create(@Body() createMaterialDto: CreateMaterialDto): Promise<Material> {
    return await this.materialService.create(createMaterialDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all materials' })
  async findAll(): Promise<Material[]> {
    return await this.materialService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a material by id' })
  async findOne(@Param('id') id: string): Promise<Material> {
    return await this.materialService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a material' })
  async update(
    @Param('id') id: string,
    @Body() updateMaterialDto: UpdateMaterialDto,
  ): Promise<Material | null> {
    return await this.materialService.update(id, updateMaterialDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a material' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.materialService.remove(id);
  }
}
