import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Evaluation } from '../../evaluations/entities/evaluation.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';

@Entity({ name: 'grades' })
export class Grade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Evaluation, { onDelete: 'SET NULL' })
  evaluation: Evaluation;

  @Column({ nullable: true })
  evaluationId: string;

  @ManyToOne(() => Enrollment, { onDelete: 'SET NULL' })
  enrollment: Enrollment;

  @Column({ nullable: true })
  enrollmentId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: false })
  score: number;
}