import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CourseService } from '../services/course.service';
import { CreateCourseDto } from '../dtos/create-course.dto';
import { UpdateCourseDto } from '../dtos/update-course.dto';
import { Course } from '../entities/course.entity';
import { CoursesByProgramTypeDto } from '../dtos/courses-by-program-type.dto';
import { CoursesByProgramTypeResponseDto } from '../dtos/courses-by-program-type-response.dto';
import { JwtAuthGuard } from '../../../common/auth/guards/jwt-auth.guard';
import { CurrentUserToken } from '../../../common/auth/decorators/current-user.decorator';
import { UserPayload } from '../../../common/auth/interfaces';
import { CourseDetailResponseDto } from '../dtos/course-detail-response.dto';
import { UserRoles } from '../queries/find-courses-by-program-type.query';

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

  @Get('by-program-type')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener cursos agrupados por programa',
    description:
      'Devuelve los cursos en los que el usuario está matriculado o enseña, agrupados por programa académico. Permite filtrado por tipo de programa, estado, semestre y búsqueda por texto.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de cursos agrupados por programa académico',
    type: CoursesByProgramTypeResponseDto,
  })
  async findCoursesByProgramType(
    @CurrentUserToken() user: UserPayload,
    @Query() filters: CoursesByProgramTypeDto,
  ): Promise<CoursesByProgramTypeResponseDto> {
    return await this.courseService.findCoursesByProgramType(user.userId, filters, user.rolName!);
  }

  @Get('detail/:courseOfferingId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener detalle completo de un curso',
    description:
      'Devuelve información detallada de un curso, incluyendo datos del profesor, bloques, horarios, y recursos asociados.',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalle completo del curso',
    type: CourseDetailResponseDto,
  })
  async getCourseDetail(
    @Param('courseOfferingId') courseOfferingId: string,
    @CurrentUserToken() user: UserPayload,
  ): Promise<CourseDetailResponseDto> {
    return await this.courseService.getCourseDetail(courseOfferingId, user.userId);
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
