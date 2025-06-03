import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from '../services/attendance.service';
import { CreateAttendanceDto } from '../dtos/create-attendance.dto';
import { UpdateAttendanceDto } from '../dtos/update-attendance.dto';
import { Attendance } from '../entities/attendance.entity';
import { AttendanceByWeekResponseDto } from '../dtos/attendance-by-week-response.dto';
import { JwtAuthGuard } from '../../../common/auth/guards/jwt-auth.guard';
import { CurrentUserToken } from '../../../common/auth/decorators/current-user.decorator';
import { UserPayload } from '../../../common/auth/interfaces';
import { BulkAttendanceDto } from '../dtos/bulk-attendance.dto';
import { BulkAttendanceResponseDto } from '../dtos/bulk-attendance-response.dto';

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

  @Post('bulk')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Registrar asistencia para múltiples estudiantes',
    description: 'Permite a un profesor registrar o actualizar la asistencia para múltiples estudiantes en una sesión de clase específica'
  })
  @ApiResponse({
    status: 201,
    description: 'Asistencias registradas correctamente',
    type: BulkAttendanceResponseDto
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para registrar asistencia en este bloque'
  })
  async registerBulkAttendance(
    @Body() bulkAttendanceDto: BulkAttendanceDto,
    @CurrentUserToken() user: UserPayload
  ): Promise<BulkAttendanceResponseDto> {
    return await this.attendanceService.registerBulkAttendance(
      bulkAttendanceDto,
      user.userId,
      user.rolName
    );
  }

  @Get('block/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener asistencias por bloque agrupadas por semana',
    description: 'Devuelve todas las asistencias de un bloque específico agrupadas por semana para el usuario autenticado, incluyendo el porcentaje de asistencia general'
  })
  @ApiResponse({
    status: 200,
    description: 'Asistencias agrupadas por semana',
    type: AttendanceByWeekResponseDto
  })
  async findAttendancesByBlockId(
    @Param('id') id: string,
    @CurrentUserToken() user: UserPayload
  ): Promise<AttendanceByWeekResponseDto> {
    return await this.attendanceService.findAttendancesByBlockId(id, user.userId);
  }
}
