import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Headers, Res } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiBearerAuth, ApiHeader, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import { EnrollmentBlockService } from '../services/enrollment-block.service';
import { CreateEnrollmentBlockDto } from '../dtos/create-enrollment-block.dto';
import { UpdateEnrollmentBlockDto } from '../dtos/update-enrollment-block.dto';
import { EnrollmentBlock } from '../entities/enrollment-block.entity';
import { EnrolledStudentsResponseDto } from '../dtos/enrolled-students-response.dto';
import { EnrolledStudentsGradesResponseDto } from '../dtos/enrolled-students-grades-response.dto';
import { StudentScoresResponseDto } from '../dtos/student-scores-response.dto';
import { FindEnrolledStudentsQueryDto } from '../dtos/find-enrolled-students-query.dto';
import { CurrentUserToken } from '../../../common/auth/decorators/current-user.decorator';
import { UserPayload } from '../../../common/auth/interfaces';
import { JwtAuthGuard } from '../../../common/auth/guards/jwt-auth.guard';

@Controller('enrollment-blocks')
export class EnrollmentBlockController {
  constructor(private readonly enrollmentBlockService: EnrollmentBlockService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una relación entre inscripción y bloque' })
  async create(@Body() createEnrollmentBlockDto: CreateEnrollmentBlockDto): Promise<EnrollmentBlock> {
    return await this.enrollmentBlockService.create(createEnrollmentBlockDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las relaciones entre inscripciones y bloques' })
  async findAll(): Promise<EnrollmentBlock[]> {
    return await this.enrollmentBlockService.findAll();
  }

  @Get('students/attendance/:blockId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Obtener todos los estudiantes matriculados en un bloque',
    description: 'Devuelve una lista de estudiantes matriculados en un bloque específico con su asistencia en una fecha determinada o la asistencia más próxima si no se especifica fecha. Requiere autenticación de profesor asignado al bloque o responsable del curso.'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de estudiantes matriculados',
    type: EnrolledStudentsResponseDto
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para acceder a esta información'
  })
  @ApiQuery({ 
    name: 'date', 
    required: false, 
    type: String, 
    description: 'Fecha opcional para buscar la asistencia (formato estricto ISO 8601, ejemplo: 2025-05-15T00:00:00Z)' 
  })
  @ApiHeader({
    name: 'lms-timezone',
    description: 'Zona horaria del usuario (ej. America/Lima, America/Bogota)',
    required: false,
  })
  async findEnrolledStudents(
    @Param('blockId') blockId: string,
    @Query() query: FindEnrolledStudentsQueryDto,
    @CurrentUserToken() user: UserPayload,
    @Headers('lms-timezone') timezone?: string
  ): Promise<EnrolledStudentsResponseDto> {
    return await this.enrollmentBlockService.findEnrolledStudents(
      blockId, 
      query.date, 
      user.userId, 
      user.rolName,
      timezone
    );
  }

  @Get('students/grades/:blockId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Obtener todos los estudiantes matriculados en un bloque con sus notas',
    description: 'Devuelve una lista de estudiantes matriculados en un bloque específico con sus notas en las diferentes evaluaciones. Requiere autenticación de profesor asignado al bloque o responsable del curso.'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de estudiantes matriculados con sus notas',
    type: EnrolledStudentsGradesResponseDto
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para acceder a esta información'
  })
  @ApiHeader({
    name: 'lms-timezone',
    description: 'Zona horaria del usuario (ej. America/Lima, America/Bogota)',
    required: false,
  })
  async findEnrolledStudentsGrades(
    @Param('blockId') blockId: string,
    @CurrentUserToken() user: UserPayload,
    @Headers('lms-timezone') timezone?: string
  ): Promise<EnrolledStudentsGradesResponseDto> {
    return await this.enrollmentBlockService.findEnrolledStudentsGrades(
      blockId, 
      user.userId, 
      user.rolName,
      timezone
    );
  }

  @Get('course-scores/:courseOfferingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener las calificaciones de todos los estudiantes de un curso',
    description: 'Devuelve una lista de estudiantes con sus calificaciones por tipo de bloque (teoría y práctica) y su nota final para un curso específico.'
  })
  @ApiParam({
    name: 'courseOfferingId',
    description: 'ID de la oferta de curso',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Calificaciones de los estudiantes',
    type: StudentScoresResponseDto
  })
  async getCourseScores(
    @Param('courseOfferingId') courseOfferingId: string,
    @CurrentUserToken() user: UserPayload
  ): Promise<StudentScoresResponseDto> {
    return await this.enrollmentBlockService.getCourseScores(courseOfferingId);
  }

  @Get('course-scores-excel/:courseOfferingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Exportar las calificaciones de todos los estudiantes de un curso a Excel',
    description: 'Devuelve un archivo Excel con las calificaciones de los estudiantes y estadísticas del curso.'
  })
  @ApiParam({
    name: 'courseOfferingId',
    description: 'ID de la oferta de curso',
    type: String
  })
  @ApiHeader({
    name: 'lms-timezone',
    description: 'Zona horaria del usuario (ej. America/Lima)',
    required: false
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo Excel con las calificaciones',
  })
  async exportCourseScoresToExcel(
    @Param('courseOfferingId') courseOfferingId: string,
    @CurrentUserToken() user: UserPayload,
    @Headers('lms-timezone') timezone: string,
    @Res() res: Response
  ): Promise<void> {    
    // Si no se proporciona un timezone, usar America/Lima como predeterminado para clientes peruanos
    const clientTimezone = timezone || 'America/Lima';
    
    const { stream, filename } = await this.enrollmentBlockService.exportCourseScoresToExcel(courseOfferingId, clientTimezone);
    
    // Configurar encabezados para la descarga del archivo
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Enviar el stream al cliente
    stream.pipe(res);
  }

  @Get('enrollment/:enrollmentId')
  @ApiOperation({ summary: 'Obtener las relaciones por ID de inscripción' })
  async findByEnrollmentId(@Param('enrollmentId') enrollmentId: string): Promise<EnrollmentBlock[]> {
    return await this.enrollmentBlockService.findByEnrollmentId(enrollmentId);
  }

  @Get('block/:blockId')
  @ApiOperation({ summary: 'Obtener las relaciones por ID de bloque' })
  async findByBlockId(@Param('blockId') blockId: string): Promise<EnrollmentBlock[]> {
    return await this.enrollmentBlockService.findByBlockId(blockId);
  }

  @Get(':enrollmentId/:blockId')
  @ApiOperation({ summary: 'Obtener una relación por IDs de inscripción y bloque' })
  async findOne(
    @Param('enrollmentId') enrollmentId: string,
    @Param('blockId') blockId: string,
  ): Promise<EnrollmentBlock> {
    return await this.enrollmentBlockService.findOne(enrollmentId, blockId);
  }

  @Patch(':enrollmentId/:blockId')
  @ApiOperation({ summary: 'Actualizar una relación entre inscripción y bloque' })
  async update(
    @Param('enrollmentId') enrollmentId: string,
    @Param('blockId') blockId: string,
    @Body() updateEnrollmentBlockDto: UpdateEnrollmentBlockDto,
  ): Promise<EnrollmentBlock | null> {
    return await this.enrollmentBlockService.update(
      enrollmentId,
      blockId,
      updateEnrollmentBlockDto,
    );
  }

  @Delete(':enrollmentId/:blockId')
  @ApiOperation({ summary: 'Eliminar una relación entre inscripción y bloque' })
  async remove(
    @Param('enrollmentId') enrollmentId: string,
    @Param('blockId') blockId: string,
  ): Promise<void> {
    return await this.enrollmentBlockService.remove(enrollmentId, blockId);
  }
}