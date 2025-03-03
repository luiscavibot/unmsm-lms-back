import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProgramCourseService } from '../services/program-course.service';
import { CreateProgramCourseDto } from '../dtos/create-program-course.dto';
import { UpdateProgramCourseDto } from '../dtos/update-program-course.dto';
import { ProgramCourse } from '../entities/program-course.entity';

@Controller('program-courses')
export class ProgramCourseController {
  constructor(private readonly programCourseService: ProgramCourseService) {}

  @Post()
  @ApiOperation({ summary: 'Create a program course' })
  async create(@Body() createProgramCourseDto: CreateProgramCourseDto): Promise<ProgramCourse> {
    return await this.programCourseService.create(createProgramCourseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all program courses' })
  async findAll(): Promise<ProgramCourse[]> {
    return await this.programCourseService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a program course by id' })
  async findOne(@Param('id') id: string): Promise<ProgramCourse | null> {
    return await this.programCourseService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a program course' })
  async update(
    @Param('id') id: string,
    @Body() updateProgramCourseDto: UpdateProgramCourseDto,
  ): Promise<ProgramCourse | null> {
    return await this.programCourseService.update(id, updateProgramCourseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a program course' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.programCourseService.remove(id);
  }
}
