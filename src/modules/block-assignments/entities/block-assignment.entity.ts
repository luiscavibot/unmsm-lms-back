import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Block } from '../../blocks/entities/block.entity';
import { CourseOffering } from '../../course-offerings/entities/course-offering.entity';
import { BlockRolType } from '../enums/block-rol-type.enum';

@Entity({ name: 'block_assignments' })
export class BlockAssignment {
  @PrimaryColumn()
  userId: string;

  @PrimaryColumn()
  blockId: string;

  @PrimaryColumn()
  courseOfferingId: string;

  @ManyToOne(() => Block, { onDelete: 'CASCADE' })
  block: Block;

  @ManyToOne(() => CourseOffering, { onDelete: 'CASCADE' })
  courseOffering: CourseOffering;

  @Column({
    type: 'enum',
    enum: BlockRolType,
    default: BlockRolType.COLLABORATOR
  })
  blockRol: BlockRolType;
}