import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Block } from '../../blocks/entities/block.entity';

@Entity({ name: 'evaluations' })
export class Evaluation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Block, { onDelete: 'SET NULL' })
  block: Block;

  @Column({ nullable: true })
  blockId: string;

  @Column({ length: 255, nullable: false })
  title: string;

  @Column({ type: 'date', nullable: false })
  evaluationDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: false })
  weight: number;
}