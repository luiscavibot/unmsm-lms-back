import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CourseOffering } from '../../course-offerings/entities/course-offering.entity';

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

  @ManyToOne(() => CourseOffering, { onDelete: 'SET NULL' })
  programCourse: CourseOffering;
}
