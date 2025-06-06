import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Block } from '../../blocks/entities/block.entity';
import { Week } from '../../weeks/entities/week.entity';

@Entity({ name: 'class_sessions' })
export class ClassSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Block, { onDelete: 'SET NULL' })
  block: Block;

  @Column({ nullable: true })
  blockId: string;

  @ManyToOne(() => Week, { onDelete: 'SET NULL' })
  week: Week;

  @Column({ nullable: true })
  weekId: string;

  @Column({ type: 'date' })
  sessionDate: Date;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ nullable: true })
  virtualRoomUrl: string;
}
