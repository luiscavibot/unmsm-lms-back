import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AttendanceService } from '../services/attendance.service';
import { CreateAttendanceDto } from '../dtos/create-attendance.dto';
import { UpdateAttendanceDto } from '../dtos/update-attendance.dto';
import { Attendance } from '../entities/attendance.entity';
import { AttendanceByWeekResponseDto } from '../dtos/attendance-by-week-response.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @ApiOperation({ summary: 'Create attendance' })
  async create(@Body() createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    return await this.attendanceService.create(createAttendanceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all attendances' })
  async findAll(): Promise<Attendance[]> {
    return await this.attendanceService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attendance by id' })
  async findOne(@Param('id') id: string): Promise<Attendance> {
    return await this.attendanceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update attendance' })
  async update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ): Promise<Attendance | null> {
    return await this.attendanceService.update(id, updateAttendanceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete attendance' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.attendanceService.remove(id);
  }

  @Get('block/:id')
  @ApiOperation({
    summary: 'Obtener asistencias por bloque agrupadas por semana',
    description: 'Devuelve todas las asistencias de un bloque específico agrupadas por semana, incluyendo el porcentaje de asistencia general'
  })
  @ApiResponse({
    status: 200,
    description: 'Asistencias agrupadas por semana',
    type: AttendanceByWeekResponseDto
  })
  async findAttendancesByBlockId(@Param('id') id: string): Promise<AttendanceByWeekResponseDto> {
    return await this.attendanceService.findAttendancesByBlockId(id);
  }
}
