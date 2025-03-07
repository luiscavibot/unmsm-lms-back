import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Program } from '../../programs/entities/program.entity';
import { Course } from '../../courses/entities/course.entity';

@Entity({ name: 'program_courses' })
export class ProgramCourse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Program, { onDelete: 'SET NULL' })
  program: Program;

  @Column({ nullable: true })
  programId: string;

  @ManyToOne(() => Course, { onDelete: 'SET NULL' })
  course: Course;

  @Column({ nullable: true })
  courseId: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;
}
