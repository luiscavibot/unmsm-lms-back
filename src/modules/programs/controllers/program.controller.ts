import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProgramService } from '../services/program.service';
import { Program } from '../entities/program.entity';
import { CreateProgramDto } from '../dtos/create-program.dto';
import { UpdateProgramDto } from '../dtos/update-program.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('programs')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  @Post()
  @ApiOperation({ summary: 'Create a program' })
  async create(@Body() createProgramDto: CreateProgramDto): Promise<Program> {
    return this.programService.create(createProgramDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all programs' })
  async findAll(): Promise<Program[]> {
    return this.programService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a program by id' })
  async findOne(@Param('id') id: string): Promise<Program | null> {
    return this.programService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a program' })
  async update(@Param('id') id: string, @Body() updateProgramDto: UpdateProgramDto): Promise<Program | null> {
    return this.programService.update(id, updateProgramDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a program' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.programService.remove(id);
  }
}