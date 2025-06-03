import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GradeService } from '../services/grade.service';
import { Grade } from '../entities/grade.entity';
import { CreateGradeDto } from '../dtos/create-grade.dto';
import { UpdateGradeDto } from '../dtos/update-grade.dto';
import { BlockGradeDto } from '../dtos/block-grade.dto';
import { BlockGradeResponseDto } from '../dtos/block-grade-response.dto';
import { BulkGradeResponseDto } from '../dtos/bulk-grade-response.dto';
import { JwtAuthGuard } from '../../../common/auth/guards/jwt-auth.guard';
import { CurrentUserToken } from '../../../common/auth/decorators/current-user.decorator';
import { UserPayload } from '../../../common/auth/interfaces';

@ApiTags('Calificaciones')
@Controller('grades')
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una calificación' })
  async create(@Body() createGradeDto: CreateGradeDto): Promise<Grade> {
    return await this.gradeService.create(createGradeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las calificaciones' })
  async findAll(
    @Query('evaluationId') evaluationId?: string,
    @Query('enrollmentId') enrollmentId?: string,
  ): Promise<Grade[]> {
    if (evaluationId) {
      return await this.gradeService.findByEvaluationId(evaluationId);
    }
    if (enrollmentId) {
      return await this.gradeService.findByEnrollmentId(enrollmentId);
    }
    return await this.gradeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una calificación por ID' })
  async findOne(@Param('id') id: string): Promise<Grade> {
    return await this.gradeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una calificación' })
  async update(@Param('id') id: string, @Body() updateGradeDto: UpdateGradeDto): Promise<Grade | null> {
    return await this.gradeService.update(id, updateGradeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una calificación' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.gradeService.remove(id);
  }

  @Post('block/:blockId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Registrar calificaciones por bloque',
    description: 'Registra calificaciones de múltiples estudiantes para múltiples evaluaciones en un bloque académico. Procesa las calificaciones de forma masiva en una sola transacción. Calcula y actualiza automáticamente promedios de bloque y curso. Requiere autenticación y rol de profesor.'
  })
  @ApiResponse({
    status: 200,
    description: 'Calificaciones registradas exitosamente',
    type: BulkGradeResponseDto
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para registrar calificaciones'
  })
  async registerBlockGrades(
    @Param('blockId') blockId: string,
    @Body() blockGradeDto: BlockGradeDto,
    @CurrentUserToken() user: UserPayload
  ): Promise<BulkGradeResponseDto> {
    console.log(`[Grades Controller] Iniciando registro de notas para bloque ${blockId} - ${new Date().toISOString()}`);
    console.log(`[Grades Controller] Total de estudiantes: ${blockGradeDto.studentGrades.length}`);
    
    // Asignar siempre el blockId del path param
    blockGradeDto.blockId = blockId;
    
    // Medir tiempo de procesamiento (solo para logs)
    const startTime = Date.now();
    
    // Procesar las calificaciones
    console.log(`[Grades Controller] Llamando al servicio - ${new Date().toISOString()}`);
    const result = await this.gradeService.registerBlockGrades(
      blockGradeDto,
      user.userId,
      user.rolName
    );
    
    // Calcular tiempo de procesamiento (solo para logs)
    const endTime = Date.now();
    console.log(`[Grades Controller] Servicio completado en ${endTime - startTime}ms - ${new Date().toISOString()}`);
    
    // Crear respuesta optimizada en formato BulkGradeResponseDto
    const response: BulkGradeResponseDto = {
      processed: result.grades,
      totalProcessed: result.totalProcessed,
      blockInfo: result.blockInfo
    };
    
    console.log(`[Grades Controller] Finalizando registro de notas - ${new Date().toISOString()}`);
    return response;
  }
}