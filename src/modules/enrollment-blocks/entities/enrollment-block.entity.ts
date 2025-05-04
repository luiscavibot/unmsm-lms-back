import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { Block } from '../../blocks/entities/block.entity';

@Entity({ name: 'enrollment_blocks' })
export class EnrollmentBlock {
  @PrimaryColumn()
  enrollmentId: string;

  @PrimaryColumn()
  blockId: string;

  @Column({ type: 'float', nullable: true })
  blockAverage: number;

  @ManyToOne(() => Enrollment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'enrollmentId' })
  enrollment: Enrollment;

  @ManyToOne(() => Block, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blockId' })
  block: Block;
}