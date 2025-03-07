import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EnrollmentService } from '../services/enrollment.service';
import { CreateEnrollmentDto } from '../dtos/create-enrollment.dto';
import { UpdateEnrollmentDto } from '../dtos/update-enrollment.dto';
import { Enrollment } from '../entities/enrollment.entity';

@Controller('enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create an enrollment' })
  async create(@Body() createEnrollmentDto: CreateEnrollmentDto): Promise<Enrollment> {
    return await this.enrollmentService.create(createEnrollmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all enrollments' })
  async findAll(): Promise<Enrollment[]> {
    return await this.enrollmentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an enrollment by id' })
  async findOne(@Param('id') id: string): Promise<Enrollment> {
    return await this.enrollmentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an enrollment' })
  async update(
    @Param('id') id: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ): Promise<Enrollment | null> {
    return await this.enrollmentService.update(id, updateEnrollmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an enrollment' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.enrollmentService.remove(id);
  }
}
