import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CourseOffering } from '../../course-offerings/entities/course-offering.entity';
import { BlockAssignment } from '../../block-assignments/entities/block-assignment.entity';
import { BlockType } from '../enums/block-type.enum';

@Entity({ name: 'blocks' })
export class Block {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CourseOffering, { onDelete: 'SET NULL' })
  courseOffering: CourseOffering;

  @Column({ nullable: true })
  courseOfferingId: string;

  @ManyToOne(() => BlockAssignment, { onDelete: 'SET NULL' })
  blockAssignment: BlockAssignment;

  @Column({ nullable: true })
  blockAssignmentId: string;

  @Column({
    type: 'enum',
    enum: BlockType,
    default: BlockType.THEORY
  })
  type: BlockType;

  @Column({ length: 50, nullable: true })
  group: string;
}