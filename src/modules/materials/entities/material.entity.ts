import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { Week } from '../../weeks/entities/week.entity';

@Entity({ name: 'materials' })
export class Material {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  enrollmentId: string;

  @Column({ nullable: true })
  weekId: string;

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

  @ManyToOne(() => Week, { onDelete: 'SET NULL' })
  week: Week;
}
