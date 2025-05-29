import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ClassSessionService } from '../services/class-session.service';
import { CreateClassSessionDto } from '../dtos/create-class-session.dto';
import { UpdateClassSessionDto } from '../dtos/update-class-session.dto';
import { ClassSession } from '../entities/class-session.entity';
import { ClassDaysResponseDto } from '../dtos/class-days-response.dto';
import { JwtAuthGuard } from '../../../common/auth/guards/jwt-auth.guard';
import { CurrentUserToken } from '../../../common/auth/decorators/current-user.decorator';
import { UserPayload } from '../../../common/auth/interfaces';

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

  @Get('block/:blockId/dates')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Obtener los días de clase para un bloque específico formateados para un datepicker',
    description: 'Devuelve un array de objetos con información sobre los días en que hay sesiones de clase para un bloque específico, útil para llenar un componente datepicker en el frontend. Requiere autenticación de profesor asignado al bloque o responsable del curso.'
  })
  @ApiResponse({
    status: 200,
    description: 'Días de clase obtenidos correctamente',
    type: ClassDaysResponseDto
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para acceder a esta información'
  })
  async getClassDaysForDatepicker(
    @Param('blockId') blockId: string,
    @CurrentUserToken() user: UserPayload
  ): Promise<ClassDaysResponseDto> {
    return await this.classSessionService.getClassDaysForDatepicker(blockId, user.userId, user.rolName);
  }
}
