import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EnrollmentBlockService } from '../services/enrollment-block.service';
import { CreateEnrollmentBlockDto } from '../dtos/create-enrollment-block.dto';
import { UpdateEnrollmentBlockDto } from '../dtos/update-enrollment-block.dto';
import { EnrollmentBlock } from '../entities/enrollment-block.entity';

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