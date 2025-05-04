import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
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
  async findAll(): Promise<BlockAssignment[]> {
    return await this.blockAssignmentService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener una asignación de bloque por id' })
  async findOne(@Param('id') id: string): Promise<BlockAssignment> {
    return await this.blockAssignmentService.findOne(id);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener asignaciones de bloque por id de usuario' })
  async findByUserId(@Param('userId') userId: string): Promise<BlockAssignment[]> {
    return await this.blockAssignmentService.findByUserId(userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Actualizar una asignación de bloque' })
  async update(
    @Param('id') id: string, 
    @Body() updateBlockAssignmentDto: UpdateBlockAssignmentDto
  ): Promise<BlockAssignment | null> {
    return await this.blockAssignmentService.update(id, updateBlockAssignmentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Eliminar una asignación de bloque' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.blockAssignmentService.remove(id);
  }
}