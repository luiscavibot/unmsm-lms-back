import { Attendance } from '../entities/attendance.entity';

export interface IAttendanceRepository {
  create(attendance: Attendance): Promise<Attendance>;
  findAll(): Promise<Attendance[]>;
  findOne(id: string): Promise<Attendance | null>;
  update(id: string, attendance: Partial<Attendance>): Promise<Attendance | null>;
  delete(id: string): Promise<void>;
}
