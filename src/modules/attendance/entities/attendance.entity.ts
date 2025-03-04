import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { ClassSession } from '../../class-sessions/entities/class-session.entity';
import { AttendanceStatus } from '../enums/attendance-status.enum';

@Entity({ name: 'attendances' })
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  enrollmentId: string;

  @Column({ nullable: true })
  classSessionId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  attendanceDate: Date;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.ABSENT
  })
  status: AttendanceStatus;

  @ManyToOne(() => Enrollment, { onDelete: 'SET NULL' })
  enrollment: Enrollment;

  @ManyToOne(() => ClassSession, { onDelete: 'SET NULL' })
  classSession: ClassSession;
}
