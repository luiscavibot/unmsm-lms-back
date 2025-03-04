import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AttendanceService } from '../services/attendance.service';
import { CreateAttendanceDto } from '../dtos/create-attendance.dto';
import { UpdateAttendanceDto } from '../dtos/update-attendance.dto';
import { Attendance } from '../entities/attendance.entity';

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
}
