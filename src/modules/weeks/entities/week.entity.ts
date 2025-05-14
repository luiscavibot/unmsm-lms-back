import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Block } from '../../blocks/entities/block.entity';

@Entity({ name: 'weeks' })
export class Week {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Block, { onDelete: 'SET NULL' })
  block: Block;

  @Column({ nullable: true })
  blockId: string;

  @Column({ length: 100 })
  name: string;
}
