import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseService } from '../services/course.service';
import { CreateCourseDto } from '../dtos/create-course.dto';
import { UpdateCourseDto } from '../dtos/update-course.dto';
import { Course } from '../entities/course.entity';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @ApiOperation({ summary: 'Create a course' })
  async create(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    return await this.courseService.create(createCourseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  async findAll(): Promise<Course[]> {
    return await this.courseService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a course by id' })
  async findOne(@Param('id') id: string): Promise<Course | null> {
    return await this.courseService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a course by id' })
  async update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto): Promise<Course | null> {
    return await this.courseService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course by id' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.courseService.remove(id);
  }
}
