import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProgramCourse } from '../../program-courses/entities/program-course.entity';

@Entity({ name: 'class_sessions' })
export class ClassSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  programCourseId: string;

  @Column({ type: 'date' })
  sessionDate: Date;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ nullable: true })
  virtualRoomUrl: string;

  @ManyToOne(() => ProgramCourse, { onDelete: 'SET NULL' })
  programCourse: ProgramCourse;
}
