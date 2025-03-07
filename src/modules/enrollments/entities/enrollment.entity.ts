import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ProgramCourse } from '../../program-courses/entities/program-course.entity';

@Entity({ name: 'enrollments' })
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => ProgramCourse, { onDelete: 'SET NULL' })
  programCourse: ProgramCourse;

  @Column({ nullable: true })
  programCourseId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  enrollmentDate: Date;
}
