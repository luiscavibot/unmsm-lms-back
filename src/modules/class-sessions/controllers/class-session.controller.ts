import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClassSessionService } from '../services/class-session.service';
import { CreateClassSessionDto } from '../dtos/create-class-session.dto';
import { UpdateClassSessionDto } from '../dtos/update-class-session.dto';
import { ClassSession } from '../entities/class-session.entity';

@Controller('class-sessions')
export class ClassSessionController {
  constructor(private readonly classSessionService: ClassSessionService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una sesión de clase' })
  async create(@Body() createClassSessionDto: CreateClassSessionDto): Promise<ClassSession> {
    return await this.classSessionService.create(createClassSessionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las sesiones de clase' })
  async findAll(
    @Query('blockId') blockId?: string,
    @Query('weekId') weekId?: string,
  ): Promise<ClassSession[]> {
    if (blockId) {
      return await this.classSessionService.findByBlockId(blockId);
    }
    if (weekId) {
      return await this.classSessionService.findByWeekId(weekId);
    }
    return await this.classSessionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una sesión de clase por ID' })
  async findOne(@Param('id') id: string): Promise<ClassSession> {
    return await this.classSessionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una sesión de clase' })
  async update(
    @Param('id') id: string,
    @Body() updateClassSessionDto: UpdateClassSessionDto,
  ): Promise<ClassSession | null> {
    return await this.classSessionService.update(id, updateClassSessionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una sesión de clase' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.classSessionService.remove(id);
  }
}
