import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SemesterService } from '../services/semester.service';
import { CreateSemesterDto } from '../dtos/create-semester.dto';
import { UpdateSemesterDto } from '../dtos/update-semester.dto';
import { Semester } from '../entities/semester.entity';

@ApiTags('Semestres')
@Controller('semesters')
export class SemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un semestre' })
  async create(@Body() createSemesterDto: CreateSemesterDto): Promise<Semester> {
    return await this.semesterService.create(createSemesterDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los semestres' })
  async findAll(): Promise<Semester[]> {
    return await this.semesterService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un semestre por id' })
  async findOne(@Param('id') id: string): Promise<Semester> {
    return await this.semesterService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un semestre' })
  async update(
    @Param('id') id: string,
    @Body() updateSemesterDto: UpdateSemesterDto,
  ): Promise<Semester | null> {
    return await this.semesterService.update(id, updateSemesterDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un semestre' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.semesterService.remove(id);
  }
}