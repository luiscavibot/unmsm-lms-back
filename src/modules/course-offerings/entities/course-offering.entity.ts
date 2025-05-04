import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Program } from '../../programs/entities/program.entity';
import { Course } from '../../courses/entities/course.entity';
import { CourseOfferingStatus } from '../enums/course-offering-status.enum';
import { Semester } from '../../semesters/entities/semester.entity';

@Entity({ name: 'course_offerings' })
export class CourseOffering {
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

  @ManyToOne(() => Semester, { onDelete: 'SET NULL' })
  semester: Semester;

  @Column({ nullable: true })
  semesterId: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ length: 50, nullable: true })
  module: string;

  @Column({ type: 'enum', enum: CourseOfferingStatus, default: CourseOfferingStatus.UNSTARTED })
  status: CourseOfferingStatus;
}