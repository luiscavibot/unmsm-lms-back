import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { ClassSession } from '../../class-sessions/entities/class-session.entity';

@Entity({ name: 'materials' })
export class Material {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  enrollmentId: string;

  @Column({ nullable: true })
  classSessionId: string;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 50 })
  type: string;

  @Column({ type: 'text' })
  fileUrl: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @ManyToOne(() => Enrollment, { onDelete: 'SET NULL' })
  enrollment: Enrollment;

  @ManyToOne(() => ClassSession, { onDelete: 'SET NULL' })
  classSession: ClassSession;
}
