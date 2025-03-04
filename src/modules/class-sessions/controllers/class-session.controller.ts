import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClassSessionService } from '../services/class-session.service';
import { CreateClassSessionDto } from '../dtos/create-class-session.dto';
import { UpdateClassSessionDto } from '../dtos/update-class-session.dto';
import { ClassSession } from '../entities/class-session.entity';

@Controller('class-sessions')
export class ClassSessionController {
  constructor(private readonly classSessionService: ClassSessionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a class session' })
  async create(@Body() createClassSessionDto: CreateClassSessionDto): Promise<ClassSession> {
    return await this.classSessionService.create(createClassSessionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all class sessions' })
  async findAll(): Promise<ClassSession[]> {
    return await this.classSessionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a class session by id' })
  async findOne(@Param('id') id: string): Promise<ClassSession> {
    return await this.classSessionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a class session' })
  async update(
    @Param('id') id: string,
    @Body() updateClassSessionDto: UpdateClassSessionDto,
  ): Promise<ClassSession | null> {
    return await this.classSessionService.update(id, updateClassSessionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a class session' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.classSessionService.remove(id);
  }
}
