import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SemesterService } from '../services/semester.service';
import { CreateSemesterDto } from '../dtos/create-semester.dto';
import { UpdateSemesterDto } from '../dtos/update-semester.dto';
import { Semester } from '../entities/semester.entity';
import { CurrentUserToken } from '../../../common/auth/decorators/current-user.decorator';
import { UserPayload } from '../../../common/auth/interfaces';
import { JwtAuthGuard } from '../../../common/auth/guards/jwt-auth.guard';

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

  @Get('by-user/enrolled')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Obtener los semestres en los que el usuario está matriculado', 
    description: 'Devuelve una lista única de semestres en los que el usuario actual está matriculado a través de ofertas de cursos, filtrando únicamente por el año actual y el año anterior'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de semestres en los que el usuario está matriculado (del año actual y anterior)', 
    type: [Semester] 
  })
  async findByCurrentUser(@CurrentUserToken() user: UserPayload): Promise<Semester[]> {
    return await this.semesterService.findByUserId(user.userId);
  }
}