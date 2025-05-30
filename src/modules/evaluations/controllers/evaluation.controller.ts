import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EvaluationService } from '../services/evaluation.service';
import { Evaluation } from '../entities/evaluation.entity';
import { CreateEvaluationDto } from '../dtos/create-evaluation.dto';
import { UpdateEvaluationDto } from '../dtos/update-evaluation.dto';
import { StudentGradesResponseDto } from '../dtos/student-grades-response.dto';
import { JwtAuthGuard } from '../../../common/auth/guards/jwt-auth.guard';
import { CurrentUserToken } from '../../../common/auth/decorators/current-user.decorator';
import { UserPayload } from '../../../common/auth/interfaces';

@ApiTags('Evaluaciones')
@Controller('evaluations')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las evaluaciones o filtrar por bloque' })
  async findAll(@Query('blockId') blockId?: string): Promise<Evaluation[]> {
    if (blockId) {
      return this.evaluationService.findByBlockId(blockId);
    }
    return this.evaluationService.findAll();
  }

  @Get('student-grades/:blockId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener notas de un estudiante por bloque',
    description:
      'Devuelve las notas de evaluaciones de un estudiante para un bloque específico usando el ID del usuario del token',
  })
  @ApiResponse({
    status: 200,
    description: 'Notas del estudiante con promedio ponderado',
    type: StudentGradesResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontraron notas o matrícula para el bloque y usuario especificados',
  })
  async getStudentGradesByBlockId(
    @Param('blockId') blockId: string,
    @CurrentUserToken() user: UserPayload,
  ): Promise<StudentGradesResponseDto> {
    return this.evaluationService.findStudentGradesByBlockId(blockId, user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una evaluación por ID' })
  async findById(@Param('id') id: string): Promise<Evaluation> {
    return this.evaluationService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear una nueva evaluación',
    description: 'Crea una nueva evaluación en un bloque específico. Requiere autenticación de profesor asignado al bloque o responsable del curso.'
  })
  @ApiResponse({
    status: 201,
    description: 'Evaluación creada exitosamente',
    type: Evaluation
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para crear evaluaciones en este bloque'
  })
  async create(
    @Body() createEvaluationDto: CreateEvaluationDto,
    @CurrentUserToken() user: UserPayload
  ): Promise<Evaluation> {
    return this.evaluationService.createWithPermission(createEvaluationDto, user.userId, user.rolName);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar una evaluación',
    description: 'Actualiza una evaluación existente. Requiere autenticación de profesor asignado al bloque o responsable del curso.'
  })
  @ApiResponse({
    status: 200,
    description: 'Evaluación actualizada exitosamente',
    type: Evaluation
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para modificar evaluaciones en este bloque'
  })
  async update(
    @Param('id') id: string, 
    @Body() updateEvaluationDto: UpdateEvaluationDto,
    @CurrentUserToken() user: UserPayload
  ): Promise<Evaluation> {
    return this.evaluationService.updateWithPermission(id, updateEvaluationDto, user.userId, user.rolName);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar una evaluación',
    description: 'Elimina una evaluación existente. Requiere autenticación de profesor asignado al bloque o responsable del curso.'
  })
  @ApiResponse({
    status: 200,
    description: 'Evaluación eliminada exitosamente'
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para eliminar evaluaciones en este bloque'
  })
  async delete(
    @Param('id') id: string,
    @CurrentUserToken() user: UserPayload
  ): Promise<void> {
    return this.evaluationService.deleteWithPermission(id, user.userId, user.rolName);
  }
}
