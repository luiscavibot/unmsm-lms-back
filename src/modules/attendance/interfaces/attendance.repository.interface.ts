import { Attendance } from '../entities/attendance.entity';
import { AttendanceByWeekResponseDto } from '../dtos/attendance-by-week-response.dto';

export interface IAttendanceRepository {
  create(attendance: Attendance): Promise<Attendance>;
  findAll(): Promise<Attendance[]>;
  findOne(id: string): Promise<Attendance | null>;
  update(id: string, attendance: Partial<Attendance>): Promise<Attendance | null>;
  delete(id: string): Promise<void>;
  findAttendancesByBlockId(blockId: string): Promise<AttendanceByWeekResponseDto>;
}
