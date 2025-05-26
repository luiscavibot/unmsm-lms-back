import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CourseOffering } from '../../course-offerings/entities/course-offering.entity';

@Entity({ name: 'enrollments' })
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => CourseOffering, { onDelete: 'SET NULL' })
  courseOffering: CourseOffering;

  @Column({ nullable: true })
  courseOfferingId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  enrollmentDate: Date;

  @Column({ type: 'float', nullable: true })
  finalAverage: number;
}
