import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EnrollmentBlockService } from '../services/enrollment-block.service';
import { CreateEnrollmentBlockDto } from '../dtos/create-enrollment-block.dto';
import { UpdateEnrollmentBlockDto } from '../dtos/update-enrollment-block.dto';
import { EnrollmentBlock } from '../entities/enrollment-block.entity';
import { EnrolledStudentsResponseDto } from '../dtos/enrolled-students-response.dto';
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
    description: 'Fecha opcional para buscar la asistencia (formato YYYY-MM-DD)' 
  })
  async findEnrolledStudents(
    @Param('blockId') blockId: string,
    @Query() query: FindEnrolledStudentsQueryDto,
    @CurrentUserToken() user: UserPayload
  ): Promise<EnrolledStudentsResponseDto> {
    return await this.enrollmentBlockService.findEnrolledStudents(
      blockId, 
      query.date, 
      user.userId, 
      user.rolName
    );
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