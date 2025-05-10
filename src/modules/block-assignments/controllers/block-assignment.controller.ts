import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { BlockAssignmentService } from '../services/block-assignment.service';
import { BlockAssignment } from '../entities/block-assignment.entity';
import { CreateBlockAssignmentDto } from '../dtos/create-block-assignment.dto';
import { UpdateBlockAssignmentDto } from '../dtos/update-block-assignment.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/auth/guards/jwt-auth.guard';

@Controller('block-assignments')
export class BlockAssignmentController {
  constructor(private readonly blockAssignmentService: BlockAssignmentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Crear una asignación de bloque' })
  async create(@Body() createBlockAssignmentDto: CreateBlockAssignmentDto): Promise<BlockAssignment> {
    return await this.blockAssignmentService.create(createBlockAssignmentDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener todas las asignaciones de bloque' })
  async findAll(
    @Query('userId') userId?: string,
    @Query('blockId') blockId?: string,
    @Query('courseOfferingId') courseOfferingId?: string,
  ): Promise<BlockAssignment[]> {
    if (userId) {
      return await this.blockAssignmentService.findByUserId(userId);
    }
    if (blockId) {
      return await this.blockAssignmentService.findByBlockId(blockId);
    }
    if (courseOfferingId) {
      return await this.blockAssignmentService.findByCourseOfferingId(courseOfferingId);
    }
    return await this.blockAssignmentService.findAll();
  }

  @Get('composite/:userId/:blockId/:courseOfferingId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener una asignación de bloque por clave compuesta' })
  async findByCompositeId(
    @Param('userId') userId: string,
    @Param('blockId') blockId: string,
    @Param('courseOfferingId') courseOfferingId: string
  ): Promise<BlockAssignment> {
    return await this.blockAssignmentService.findByCompositeId(userId, blockId, courseOfferingId);
  }

  @Patch(':userId/:blockId/:courseOfferingId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Actualizar una asignación de bloque' })
  async update(
    @Param('userId') userId: string,
    @Param('blockId') blockId: string,
    @Param('courseOfferingId') courseOfferingId: string,
    @Body() updateBlockAssignmentDto: UpdateBlockAssignmentDto
  ): Promise<BlockAssignment | null> {
    return await this.blockAssignmentService.update(userId, blockId, courseOfferingId, updateBlockAssignmentDto);
  }

  @Delete(':userId/:blockId/:courseOfferingId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Eliminar una asignación de bloque' })
  async remove(
    @Param('userId') userId: string,
    @Param('blockId') blockId: string,
    @Param('courseOfferingId') courseOfferingId: string
  ): Promise<void> {
    return await this.blockAssignmentService.remove(userId, blockId, courseOfferingId);
  }
}