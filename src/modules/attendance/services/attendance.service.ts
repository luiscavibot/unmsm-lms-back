import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Attendance } from '../entities/attendance.entity';
import { IAttendanceRepository } from '../interfaces/attendance.repository.interface';
import { CreateAttendanceDto } from '../dtos/create-attendance.dto';
import { UpdateAttendanceDto } from '../dtos/update-attendance.dto';
import { ATTENDANCE_REPOSITORY } from '../tokens';
import { EnrollmentService } from '../../enrollments/services/enrollment.service';
import { ClassSessionService } from '../../class-sessions/services/class-session.service';
import { AttendanceByWeekResponseDto } from '../dtos/attendance-by-week-response.dto';
import { BlockService } from '../../blocks/services/block.service';

@Injectable()
export class AttendanceService {
  constructor(
    @Inject(ATTENDANCE_REPOSITORY)
    private readonly attendanceRepository: IAttendanceRepository,
    private readonly enrollmentService: EnrollmentService,
    private readonly classSessionService: ClassSessionService,
    private readonly blockService: BlockService,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    await this.enrollmentService.findOne(createAttendanceDto.enrollmentId);
    await this.classSessionService.findOne(createAttendanceDto.classSessionId);
    return await this.attendanceRepository.create(createAttendanceDto as Attendance);
  }

  async findAll(): Promise<Attendance[]> {
    return await this.attendanceRepository.findAll();
  }

  async findOne(id: string): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne(id);
    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }
    return attendance;
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance | null> {
    await this.findOne(id);
    if (updateAttendanceDto.enrollmentId) {
      await this.enrollmentService.findOne(updateAttendanceDto.enrollmentId);
    }
    if (updateAttendanceDto.classSessionId) {
      await this.classSessionService.findOne(updateAttendanceDto.classSessionId);
    }
    return await this.attendanceRepository.update(id, updateAttendanceDto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.attendanceRepository.delete(id);
  }

  async findAttendancesByBlockId(blockId: string): Promise<AttendanceByWeekResponseDto> {
    await this.blockService.findById(blockId);
    return await this.attendanceRepository.findAttendancesByBlockId(blockId);
  }
}
