import { Attendance } from '../entities/attendance.entity';
import { AttendanceByWeekResponseDto } from '../dtos/attendance-by-week-response.dto';
import { EntityManager } from 'typeorm';

export interface IAttendanceRepository {
  create(attendance: Attendance): Promise<Attendance>;
  findAll(): Promise<Attendance[]>;
  findOne(id: string): Promise<Attendance | null>;
  update(id: string, attendance: Partial<Attendance>): Promise<Attendance | null>;
  delete(id: string): Promise<void>;
  findAttendancesByBlockId(blockId: string): Promise<AttendanceByWeekResponseDto>;
  findByEnrollmentAndSession(enrollmentId: string, classSessionId: string): Promise<Attendance | null>;
  findManyByClassSessionAndEnrollments(
    classSessionId: string, 
    enrollmentIds: string[]
  ): Promise<Map<string, Attendance>>;
  createOrUpdateMany(
    attendances: {
      enrollmentId: string;
      classSessionId: string;
      status: string;
      id?: string;
      attendanceDate?: Date;
    }[]
  ): Promise<Attendance[]>;
  withTransaction<T>(
    runInTransaction: (entityManager: EntityManager) => Promise<T>
  ): Promise<T>;
}
