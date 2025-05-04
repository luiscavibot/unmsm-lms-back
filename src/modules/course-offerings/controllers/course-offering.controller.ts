import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseOfferingService } from '../services/course-offering.service';
import { CreateCourseOfferingDto } from '../dtos/create-course-offering.dto';
import { UpdateCourseOfferingDto } from '../dtos/update-course-offering.dto';
import { CourseOffering } from '../entities/course-offering.entity';

@Controller('course-offerings')
export class CourseOfferingController {
  constructor(private readonly courseOfferingService: CourseOfferingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a course offering' })
  async create(@Body() createCourseOfferingDto: CreateCourseOfferingDto): Promise<CourseOffering> {
    return await this.courseOfferingService.create(createCourseOfferingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all course offerings' })
  async findAll(): Promise<CourseOffering[]> {
    return await this.courseOfferingService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a course offering by id' })
  async findOne(@Param('id') id: string): Promise<CourseOffering | null> {
    return await this.courseOfferingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a course offering' })
  async update(
    @Param('id') id: string,
    @Body() updateCourseOfferingDto: UpdateCourseOfferingDto,
  ): Promise<CourseOffering | null> {
    return await this.courseOfferingService.update(id, updateCourseOfferingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course offering' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.courseOfferingService.remove(id);
  }
}