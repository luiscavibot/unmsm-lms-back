import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { WeekService } from '../services/week.service';
import { Week } from '../entities/week.entity';
import { CreateWeekDto } from '../dtos/create-week.dto';
import { UpdateWeekDto } from '../dtos/update-week.dto';

@Controller('weeks')
export class WeekController {
  constructor(private readonly weekService: WeekService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las semanas o filtrar por blockId' })
  async findAll(
    @Query('blockId') blockId?: string,
  ): Promise<Week[]> {
    if (blockId) {
      return await this.weekService.findByBlockId(blockId);
    }
    return await this.weekService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una semana por ID' })
  async findById(@Param('id') id: string): Promise<Week> {
    return await this.weekService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva semana' })
  async create(@Body() createWeekDto: CreateWeekDto): Promise<Week> {
    return await this.weekService.create(createWeekDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una semana por ID' })
  async update(
    @Param('id') id: string,
    @Body() updateWeekDto: UpdateWeekDto,
  ): Promise<Week> {
    return await this.weekService.update(id, updateWeekDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una semana por ID' })
  async delete(@Param('id') id: string): Promise<void> {
    return await this.weekService.delete(id);
  }
}
